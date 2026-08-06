import React, { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  GizmoHelper,
  GizmoViewport,
  OrbitControls,
  PerspectiveCamera,
  useHelper,
} from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import { RotateCcw } from "lucide-react";
import { ModelAsset, SceneConfig, SpritesheetConfig } from "../types";
import {
  AlienCreature,
  CrystalGem,
  RobotHead,
  SciFiHelmet,
} from "./ProceduralModels";
import { Custom3DModel } from "./Custom3DModel";
import { Button } from "./ui/button";
import { captureSpritesheetFromLiveScene } from "../utils/spritesheetGenerator";

interface ThreeCanvasProps {
  modelAsset: ModelAsset;
  sceneConfig: SceneConfig;
  setSceneConfig?: React.Dispatch<React.SetStateAction<SceneConfig>>;
  className?: string;
  onModelLoaded?: () => void;
  onModelError?: (error: string) => void;
  bakerRef?: React.MutableRefObject<any>;
}

function CanvasBakerRegistrar({
  bakerRef,
  modelAsset,
  sceneConfig,
}: {
  bakerRef?: React.MutableRefObject<any>;
  modelAsset: ModelAsset;
  sceneConfig: SceneConfig;
}) {
  const { scene, gl } = useThree();

  useEffect(() => {
    if (bakerRef) {
      bakerRef.current = (
        spritesheetConfig: SpritesheetConfig,
        onProgress?: (percent: number, statusText: string) => void
      ) => {
        return captureSpritesheetFromLiveScene(
          scene,
          gl,
          modelAsset,
          sceneConfig,
          spritesheetConfig,
          onProgress
        );
      };
    }
  }, [bakerRef, scene, gl, modelAsset, sceneConfig]);

  return null;
}

function SceneMaterialUpdater({
  modelAsset,
  materialOverride,
  environmentPreset,
}: {
  modelAsset: ModelAsset;
  materialOverride?: string;
  environmentPreset?: string;
}) {
  const scene = useThree((state) => state.scene);

  useEffect(() => {
    // Force material shader update on model switch or material override change so environment map is immediately bound
    const timer = setTimeout(() => {
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => (m.needsUpdate = true));
          } else if (mesh.material) {
            mesh.material.needsUpdate = true;
          }
        }
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [scene, modelAsset.id, modelAsset.url, materialOverride, environmentPreset]);

  return null;
}

function SceneLights({ sceneConfig }: { sceneConfig: SceneConfig }) {
  const key = sceneConfig.keyLight || {
    position: sceneConfig.lightPosition,
    intensity: sceneConfig.lightIntensity,
    color: sceneConfig.lightColor,
    enabled: true,
  };
  const fill = sceneConfig.fillLight || {
    position: [
      -sceneConfig.lightPosition[0],
      sceneConfig.lightPosition[1],
      -sceneConfig.lightPosition[2],
    ],
    intensity: sceneConfig.ambientIntensity * 0.4,
    color: "#ffffff",
    enabled: true,
  };
  const rim = sceneConfig.rimLight || {
    position: [0, -5, -5],
    intensity: 0.8,
    color: "#f472b6",
    enabled: false,
  };

  const showHelper = sceneConfig.showLightHelpers ?? false;

  const keyRef = useRef<THREE.DirectionalLight>(null);
  const fillRef = useRef<THREE.DirectionalLight>(null);
  const rimRef = useRef<THREE.DirectionalLight>(null);

  // Helper color helper: replace white (#ffffff) with vibrant high-contrast colors so helper lines are clearly visible in light mode
  const getHelperColor = (color: string, defaultColor: string) => {
    if (!color || color.toLowerCase() === "#ffffff" || color.toLowerCase() === "#fff") {
      return defaultColor;
    }
    return color;
  };

  useHelper(
    showHelper && key.enabled ? (keyRef as any) : null,
    THREE.DirectionalLightHelper,
    1.2,
    getHelperColor(key.color, "#f59e0b") // Amber Gold
  );
  useHelper(
    showHelper && fill.enabled ? (fillRef as any) : null,
    THREE.DirectionalLightHelper,
    1.0,
    getHelperColor(fill.color, "#3b82f6") // Electric Blue
  );
  useHelper(
    showHelper && rim.enabled ? (rimRef as any) : null,
    THREE.DirectionalLightHelper,
    1.0,
    getHelperColor(rim.color, "#ec4899") // Vibrant Pink
  );

  return (
    <>
      <ambientLight intensity={sceneConfig.ambientIntensity} />

      {key.enabled && (
        <directionalLight
          ref={keyRef}
          position={key.position}
          intensity={key.intensity}
          color={key.color}
          castShadow={sceneConfig.shadows}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
      )}

      {fill.enabled && (
        <directionalLight
          ref={fillRef}
          position={fill.position}
          intensity={fill.intensity}
          color={fill.color}
        />
      )}

      {rim.enabled && (
        <directionalLight
          ref={rimRef}
          position={rim.position}
          intensity={rim.intensity}
          color={rim.color}
        />
      )}
    </>
  );
}

function RotatingWrapper({
  autoRotate,
  children,
}: {
  autoRotate: boolean;
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && groupRef.current) {
      groupRef.current.rotation.y += delta * 0.8;
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

function ModelSelector({
  asset,
  sceneConfig,
  onModelLoaded,
  onModelError,
}: {
  asset: ModelAsset;
  sceneConfig: SceneConfig;
  onModelLoaded?: () => void;
  onModelError?: (error: string) => void;
}) {
  if (asset.type === "sample" || asset.format === "procedural") {
    const st = asset.sampleType || "robot_head";
    if (st === "robot_head" || st === "cyber_face") {
      return <RobotHead materialOverride={sceneConfig.materialOverride} />;
    }
    if (st === "helmet") {
      return <SciFiHelmet materialOverride={sceneConfig.materialOverride} />;
    }
    if (st === "gem") {
      return <CrystalGem materialOverride={sceneConfig.materialOverride} />;
    }
    if (st === "coin") {
      return <AlienCreature materialOverride={sceneConfig.materialOverride} />;
    }
    return <RobotHead materialOverride={sceneConfig.materialOverride} />;
  }

  return (
    <Custom3DModel
      url={asset.url}
      fileFormat={asset.format || "glb"}
      materialOverride={sceneConfig.materialOverride}
      onLoaded={onModelLoaded}
      onError={onModelError}
    />
  );
}

export function ThreeCanvas({
  modelAsset,
  sceneConfig,
  setSceneConfig,
  className = "",
  onModelLoaded,
  onModelError,
  bakerRef,
}: ThreeCanvasProps) {
  const cameraDist = 3.5 / sceneConfig.zoom;
  const controlsRef = useRef<OrbitControlsImpl>(null);

  const handleResetPosition = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    if (setSceneConfig) {
      setSceneConfig((prev) => ({
        ...prev,
        zoom: 1.0,
        pitchOffset: 0,
        yawOffset: 0,
      }));
    }
  };

  const envPreset = sceneConfig.environmentPreset ?? "city";

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none rounded-xl border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] ${className}`}
      style={{
        backgroundColor: sceneConfig.transparentBg
          ? "transparent"
          : sceneConfig.backgroundColor,
      }}
    >
      {/* Checkerboard pattern for transparency */}
      {sceneConfig.transparentBg && (
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(45deg, #71717a 25%, transparent 25%), 
              linear-gradient(-45deg, #71717a 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #71717a 75%), 
              linear-gradient(-45deg, transparent 75%, #71717a 75%)
            `,
            backgroundSize: "24px 24px",
            backgroundPosition: "0 0, 0 12px, 12px -12px, -12px 0px",
          }}
        />
      )}

      {/* Viewport Action Bar: Reset Position */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResetPosition}
          className="bg-white/90 dark:bg-black/90 backdrop-blur-sm border-2 border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] font-mono text-[11px] font-bold h-8"
          title="Reset Camera Position & Orientation"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          <span>Reset View</span>
        </Button>
      </div>

      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: sceneConfig.transparentBg,
          preserveDrawingBuffer: true,
        }}
      >
        <CanvasBakerRegistrar
          bakerRef={bakerRef}
          modelAsset={modelAsset}
          sceneConfig={sceneConfig}
        />
        <PerspectiveCamera makeDefault position={[0, 0, cameraDist]} fov={45} />
        <SceneLights sceneConfig={sceneConfig} />

        {envPreset !== "none" && (
          <Environment preset={envPreset} background={false} />
        )}

        <SceneMaterialUpdater
          modelAsset={modelAsset}
          materialOverride={sceneConfig.materialOverride}
          environmentPreset={envPreset}
        />

        <Suspense
          fallback={
            <mesh>
              <boxGeometry args={[0.8, 0.8, 0.8]} />
              <meshBasicMaterial color="#000000" wireframe />
            </mesh>
          }
        >
          <RotatingWrapper autoRotate={sceneConfig.autoRotatePreview}>
            <ModelSelector
              asset={modelAsset}
              sceneConfig={sceneConfig}
              onModelLoaded={onModelLoaded}
              onModelError={onModelError}
            />
          </RotatingWrapper>
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan
          enableZoom
          enableRotate
          minDistance={1.0}
          maxDistance={12.0}
          makeDefault
        />

        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport
            axisColors={["#ef4444", "#22c55e", "#3b82f6"]}
            labelColor="#ffffff"
          />
        </GizmoHelper>
      </Canvas>

      {/* Orbit Help Overlay Badge */}
      <div className="absolute bottom-3 left-3 px-3 py-1 text-[11px] font-mono font-bold tracking-wider bg-black text-white dark:bg-white dark:text-black rounded-md border-2 border-black dark:border-white pointer-events-none flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        DRAG TO ORBIT | SCROLL TO ZOOM
      </div>
    </div>
  );
}
