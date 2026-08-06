import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import gifshot from 'gifshot';
import JSZip from 'jszip';
import {
  CapturedFrame,
  GeneratedSpritesheet,
  ModelAsset,
  SceneConfig,
  SpritesheetConfig,
} from '../types';

export async function generateSpritesheet(
  modelAsset: ModelAsset,
  sceneConfig: SceneConfig,
  spritesheetConfig: SpritesheetConfig,
  onProgress?: (percent: number, statusText: string) => void
): Promise<GeneratedSpritesheet> {
  const { frameWidth, frameHeight, columns, rows, totalFrames, padding, layout, isMultiAxisGrid } =
    spritesheetConfig;

  if (onProgress) onProgress(5, 'Initializing 3D Renderer...');

  // Create offscreen WebGLRenderer
  const canvas = document.createElement('canvas');
  canvas.width = frameWidth;
  canvas.height = frameHeight;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    preserveDrawingBuffer: true,
  });

  renderer.setSize(frameWidth, frameHeight, false);
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = sceneConfig.shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();

  // Background setting
  if (!sceneConfig.transparentBg) {
    scene.background = new THREE.Color(sceneConfig.backgroundColor);
  } else {
    scene.background = null;
  }

  // Camera setup
  const camera = new THREE.PerspectiveCamera(45, frameWidth / frameHeight, 0.1, 100);
  const baseDist = 3.5 / sceneConfig.zoom;
  
  // Camera pitch/yaw offset
  const pitchRad = THREE.MathUtils.degToRad(sceneConfig.pitchOffset);
  const yawRad = THREE.MathUtils.degToRad(sceneConfig.yawOffset);
  
  camera.position.x = baseDist * Math.sin(yawRad) * Math.cos(pitchRad);
  camera.position.y = baseDist * Math.sin(pitchRad);
  camera.position.z = baseDist * Math.cos(yawRad) * Math.cos(pitchRad);
  camera.lookAt(0, 0, 0);

  // Lights setup
  const ambientLight = new THREE.AmbientLight(0xffffff, sceneConfig.ambientIntensity);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(
    sceneConfig.lightColor,
    sceneConfig.lightIntensity
  );
  dirLight.position.set(...sceneConfig.lightPosition);
  dirLight.castShadow = sceneConfig.shadows;
  dirLight.shadow.mapSize.width = 1024;
  dirLight.shadow.mapSize.height = 1024;
  scene.add(dirLight);

  const fillLight = new THREE.DirectionalLight(0xffffff, sceneConfig.ambientIntensity * 0.5);
  fillLight.position.set(-dirLight.position.x, dirLight.position.y, -dirLight.position.z);
  scene.add(fillLight);

  if (onProgress) onProgress(15, 'Loading 3D Model into Offscreen Buffer...');

  // Load 3D model into scene
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  await loadModelIntoGroup(modelAsset, modelGroup, sceneConfig.materialOverride);

  if (onProgress) onProgress(30, 'Capturing Angle Frames...');

  const capturedFrames: CapturedFrame[] = [];

  // Determine row / col count according to layout
  let finalCols = columns;
  let finalRows = rows;
  if (layout === 'row') {
    finalCols = totalFrames;
    finalRows = 1;
  } else if (layout === 'column') {
    finalCols = 1;
    finalRows = totalFrames;
  }

  const effectiveTotalFrames = Math.min(totalFrames, finalCols * finalRows);

  for (let idx = 0; idx < effectiveTotalFrames; idx++) {
    const r = Math.floor(idx / finalCols);
    const c = idx % finalCols;

    let pitchDeg = 0;
    let yawDeg = 0;
    let rollDeg = 0;

    if (isMultiAxisGrid) {
      // 2D Pitch / Yaw Multi-Axis Matrix Grid
      const { pitchRange, yawRange } = spritesheetConfig.gridMultiAxis;
      
      const pitchStep = finalRows > 1 ? (pitchRange.end - pitchRange.start) / (finalRows - 1) : 0;
      const yawStep = finalCols > 1 ? (yawRange.end - yawRange.start) / (finalCols - 1) : 0;

      pitchDeg = pitchRange.start + r * pitchStep;
      yawDeg = yawRange.start + c * yawStep;

      // Apply pitch and yaw
      modelGroup.rotation.x = THREE.MathUtils.degToRad(pitchDeg);
      modelGroup.rotation.y = THREE.MathUtils.degToRad(yawDeg);
      modelGroup.rotation.z = 0;
    } else {
      // 1D Single-Axis Spin
      const { singleAxis, singleAxisRange } = spritesheetConfig;
      const rangeSpan = singleAxisRange.end - singleAxisRange.start;
      const step = effectiveTotalFrames > 1 ? rangeSpan / effectiveTotalFrames : 0;
      const angle = singleAxisRange.start + idx * step;

      modelGroup.rotation.x = 0;
      modelGroup.rotation.y = 0;
      modelGroup.rotation.z = 0;

      if (singleAxis === 'X') {
        modelGroup.rotation.x = THREE.MathUtils.degToRad(angle);
        pitchDeg = angle;
      } else if (singleAxis === 'Y') {
        modelGroup.rotation.y = THREE.MathUtils.degToRad(angle);
        yawDeg = angle;
      } else if (singleAxis === 'Z') {
        modelGroup.rotation.z = THREE.MathUtils.degToRad(angle);
        rollDeg = angle;
      }
    }

    // Render frame
    renderer.render(scene, camera);

    // Create frame canvas
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = frameWidth;
    frameCanvas.height = frameHeight;
    const frameCtx = frameCanvas.getContext('2d')!;
    frameCtx.drawImage(renderer.domElement, 0, 0);

    capturedFrames.push({
      index: idx,
      row: r,
      col: c,
      pitch: pitchDeg,
      yaw: yawDeg,
      roll: rollDeg,
      dataUrl: frameCanvas.toDataURL('image/png'),
      canvas: frameCanvas,
    });

    const progressPct = 30 + Math.floor((idx / effectiveTotalFrames) * 50);
    if (onProgress) onProgress(progressPct, `Captured frame ${idx + 1}/${effectiveTotalFrames}`);
  }

  if (onProgress) onProgress(85, 'Stitching Spritesheet Atlas...');

  // Build combined Spritesheet Canvas
  const sheetWidth = finalCols * frameWidth + (finalCols + 1) * padding;
  const sheetHeight = finalRows * frameHeight + (finalRows + 1) * padding;

  const sheetCanvas = document.createElement('canvas');
  sheetCanvas.width = sheetWidth;
  sheetCanvas.height = sheetHeight;
  const sheetCtx = sheetCanvas.getContext('2d')!;

  // Fill background if not transparent
  if (!sceneConfig.transparentBg) {
    sheetCtx.fillStyle = sceneConfig.backgroundColor;
    sheetCtx.fillRect(0, 0, sheetWidth, sheetHeight);
  }

  // Draw frames onto atlas
  capturedFrames.forEach((frame) => {
    const x = padding + frame.col * (frameWidth + padding);
    const y = padding + frame.row * (frameHeight + padding);
    sheetCtx.drawImage(frame.canvas, x, y, frameWidth, frameHeight);
  });

  const finalDataUrl = sheetCanvas.toDataURL('image/png');

  if (onProgress) onProgress(100, 'Spritesheet generation complete!');

  // Clean up renderer resources
  renderer.dispose();

  return {
    dataUrl: finalDataUrl,
    width: sheetWidth,
    height: sheetHeight,
    columns: finalCols,
    rows: finalRows,
    frameWidth,
    frameHeight,
    padding,
    frames: capturedFrames,
  };
}

// Model Loader Helper
async function loadModelIntoGroup(
  asset: ModelAsset,
  group: THREE.Group,
  materialOverride?: 'default' | 'wireframe' | 'clay' | 'metal' | 'toon'
): Promise<void> {
  return new Promise((resolve) => {
    if (asset.type === 'sample' || asset.format === 'procedural') {
      // Build procedural sample
      const modelMesh = createProceduralMesh(asset.sampleType || 'robot_head', materialOverride);
      group.add(modelMesh);
      resolve();
      return;
    }

    const fmt = (asset.format || 'glb').toLowerCase();
    const url = asset.url;

    if (fmt === 'glb' || fmt === 'gltf') {
      const loader = new GLTFLoader();
      loader.load(
        url,
        (gltf) => {
          normalizeAndCenterObject(gltf.scene);
          group.add(gltf.scene);
          resolve();
        },
        undefined,
        () => {
          // Fallback on error
          group.add(createProceduralMesh('robot_head', materialOverride));
          resolve();
        }
      );
    } else if (fmt === 'obj') {
      const loader = new OBJLoader();
      loader.load(
        url,
        (obj) => {
          normalizeAndCenterObject(obj);
          group.add(obj);
          resolve();
        },
        undefined,
        () => {
          group.add(createProceduralMesh('robot_head', materialOverride));
          resolve();
        }
      );
    } else if (fmt === 'stl') {
      const loader = new STLLoader();
      loader.load(
        url,
        (geom) => {
          geom.computeVertexNormals();
          const mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 });
          const mesh = new THREE.Mesh(geom, mat);
          const wrapper = new THREE.Group();
          wrapper.add(mesh);
          normalizeAndCenterObject(wrapper);
          group.add(wrapper);
          resolve();
        },
        undefined,
        () => {
          group.add(createProceduralMesh('robot_head', materialOverride));
          resolve();
        }
      );
    } else if (fmt === 'ply') {
      const loader = new PLYLoader();
      loader.load(
        url,
        (geom) => {
          geom.computeVertexNormals();
          const mat = new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.4 });
          const mesh = new THREE.Mesh(geom, mat);
          const wrapper = new THREE.Group();
          wrapper.add(mesh);
          normalizeAndCenterObject(wrapper);
          group.add(wrapper);
          resolve();
        },
        undefined,
        () => {
          group.add(createProceduralMesh('robot_head', materialOverride));
          resolve();
        }
      );
    } else {
      group.add(createProceduralMesh('robot_head', materialOverride));
      resolve();
    }
  });
}

function normalizeAndCenterObject(obj: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(obj);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();
  box.getCenter(center);
  box.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? 2.0 / maxDim : 1.0;

  obj.position.x = -center.x * scale;
  obj.position.y = -center.y * scale;
  obj.position.z = -center.z * scale;
  obj.scale.set(scale, scale, scale);

  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

// Procedural Mesh Generator
function createProceduralMesh(
  type: string,
  materialOverride?: 'default' | 'wireframe' | 'clay' | 'metal' | 'toon'
): THREE.Object3D {
  const container = new THREE.Group();

  const getMat = (color: string, roughness = 0.3, metalness = 0.5) => {
    if (materialOverride === 'wireframe') {
      return new THREE.MeshBasicMaterial({ wireframe: true, color });
    }
    if (materialOverride === 'clay') {
      return new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8, metalness: 0.1 });
    }
    if (materialOverride === 'metal') {
      return new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.1, metalness: 0.95 });
    }
    if (materialOverride === 'toon') {
      return new THREE.MeshToonMaterial({ color });
    }
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
  };

  if (type === 'cyber_face' || type === 'robot_head') {
    // Robot Head Mesh
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.5, 1.2), getMat('#3b82f6', 0.3, 0.7));
    head.position.set(0, 0, 0);
    container.add(head);

    const faceplate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.2), getMat('#1e293b', 0.2, 0.9));
    faceplate.position.set(0, 0.05, 0.55);
    container.add(faceplate);

    // Eyes
    const eye1 = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16),
      getMat('#06b6d4', 0.1, 0.2)
    );
    eye1.rotation.x = Math.PI / 2;
    eye1.position.set(-0.32, 0.25, 0.65);
    container.add(eye1);

    const eye2 = eye1.clone();
    eye2.position.set(0.32, 0.25, 0.65);
    container.add(eye2);

    // Pupils
    const pupil1 = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), getMat('#38bdf8', 0, 0));
    pupil1.position.set(-0.32, 0.25, 0.71);
    container.add(pupil1);

    const pupil2 = pupil1.clone();
    pupil2.position.set(0.32, 0.25, 0.71);
    container.add(pupil2);

    // Mouth
    const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.12, 0.05), getMat('#10b981', 0.2, 0.8));
    mouth.position.set(0, -0.3, 0.66);
    container.add(mouth);

    // Antenna
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.4, 12), getMat('#64748b', 0.4, 0.8));
    ant.position.set(0, 0.85, 0);
    container.add(ant);

    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), getMat('#f59e0b', 0.2, 0.8));
    tip.position.set(0, 1.1, 0);
    container.add(tip);
  } else if (type === 'helmet') {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.95, 32, 32), getMat('#0f172a', 0.2, 0.8));
    container.add(dome);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.45, 0.8), getMat('#f59e0b', 0.1, 0.9));
    visor.position.set(0, 0.1, 0.45);
    container.add(visor);
  } else if (type === 'gem') {
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(1.1, 0), getMat('#10b981', 0.1, 0.2));
    container.add(gem);
  } else {
    // Default Torus Knot
    const knot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.7, 0.25, 100, 16),
      getMat('#a855f7', 0.3, 0.6)
    );
    container.add(knot);
  }

  normalizeAndCenterObject(container);
  return container;
}

// Generate Animated GIF
export function createAnimatedGif(
  frames: CapturedFrame[],
  fps: number,
  frameWidth: number,
  frameHeight: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const images = frames.map((f) => f.dataUrl);
    const interval = 1 / fps;

    gifshot.createGIF(
      {
        images,
        gifWidth: frameWidth,
        gifHeight: frameHeight,
        interval,
        numFrames: frames.length,
        frameDuration: 1,
        sampleInterval: 10,
        numWorkers: 2,
      },
      (obj: any) => {
        if (!obj.error) {
          resolve(obj.image);
        } else {
          reject(new Error(obj.errorMsg || 'Failed to create GIF'));
        }
      }
    );
  });
}

// Create ZIP with PNG sequence and JSON metadata atlas
export async function createFramesZip(
  spritesheet: GeneratedSpritesheet,
  spritesheetConfig: SpritesheetConfig,
  modelName: string
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(`${modelName.replace(/\s+/g, '_')}_spritesheet`);

  // 1. Save Spritesheet Atlas PNG
  const sheetBase64 = spritesheet.dataUrl.replace(/^data:image\/png;base64,/, '');
  folder?.file('spritesheet.png', sheetBase64, { base64: true });

  // 2. Save individual PNG frames
  const framesFolder = folder?.folder('frames');
  spritesheet.frames.forEach((frame) => {
    const base64 = frame.dataUrl.replace(/^data:image\/png;base64,/, '');
    const num = String(frame.index + 1).padStart(3, '0');
    framesFolder?.file(`frame_${num}.png`, base64, { base64: true });
  });

  // 3. Save JSON Texture Atlas Metadata
  const atlasJson = {
    meta: {
      app: '3D Spritesheet Studio',
      version: '1.0',
      image: 'spritesheet.png',
      size: { w: spritesheet.width, h: spritesheet.height },
      scale: '1',
      totalFrames: spritesheet.frames.length,
      columns: spritesheet.columns,
      rows: spritesheet.rows,
      frameWidth: spritesheet.frameWidth,
      frameHeight: spritesheet.frameHeight,
      layout: spritesheetConfig.layout,
      isMultiAxisGrid: spritesheetConfig.isMultiAxisGrid,
    },
    frames: spritesheet.frames.map((frame) => {
      const num = String(frame.index + 1).padStart(3, '0');
      const x = spritesheet.padding + frame.col * (spritesheet.frameWidth + spritesheet.padding);
      const y = spritesheet.padding + frame.row * (spritesheet.frameHeight + spritesheet.padding);

      return {
        filename: `frame_${num}.png`,
        frame: { x, y, w: spritesheet.frameWidth, h: spritesheet.frameHeight },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: spritesheet.frameWidth, h: spritesheet.frameHeight },
        sourceSize: { w: spritesheet.frameWidth, h: spritesheet.frameHeight },
        pivot: { x: 0.5, y: 0.5 },
        orientation: {
          row: frame.row,
          col: frame.col,
          pitchDeg: frame.pitch,
          yawDeg: frame.yaw,
          rollDeg: frame.roll,
        },
      };
    }),
  };

  folder?.file('atlas.json', JSON.stringify(atlasJson, null, 2));

  return await zip.generateAsync({ type: 'blob' });
}
