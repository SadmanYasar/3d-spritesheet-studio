import React, { useEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';

interface Custom3DModelProps {
  url: string;
  fileFormat: string; // 'glb' | 'gltf' | 'obj' | 'stl' | 'ply'
  materialOverride?: 'default' | 'wireframe' | 'clay' | 'metal' | 'toon';
  onLoaded?: () => void;
  onError?: (error: string) => void;
}

export function Custom3DModel({
  url,
  fileFormat,
  materialOverride = 'default',
  onLoaded,
  onError,
}: Custom3DModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [modelObject, setModelObject] = useState<THREE.Object3D | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setErrorMsg(null);

    const fmt = fileFormat.toLowerCase();

    try {
      if (fmt === 'glb' || fmt === 'gltf') {
        const loader = new GLTFLoader();
        loader.load(
          url,
          (gltf) => {
            if (!isMounted) return;
            const scene = gltf.scene;
            normalizeAndCenter(scene);
            setModelObject(scene);
            setLoading(false);
            if (onLoaded) onLoaded();
          },
          undefined,
          (err) => {
            if (!isMounted) return;
            console.error('Error loading GLTF/GLB:', err);
            setErrorMsg('Failed to parse GLTF/GLB model file.');
            setLoading(false);
            if (onError) onError('Failed to parse GLTF/GLB file.');
          }
        );
      } else if (fmt === 'obj') {
        const loader = new OBJLoader();
        loader.load(
          url,
          (obj) => {
            if (!isMounted) return;
            normalizeAndCenter(obj);
            setModelObject(obj);
            setLoading(false);
            if (onLoaded) onLoaded();
          },
          undefined,
          (err) => {
            if (!isMounted) return;
            console.error('Error loading OBJ:', err);
            setErrorMsg('Failed to parse OBJ model file.');
            setLoading(false);
            if (onError) onError('Failed to parse OBJ file.');
          }
        );
      } else if (fmt === 'stl') {
        const loader = new STLLoader();
        loader.load(
          url,
          (geometry) => {
            if (!isMounted) return;
            geometry.computeVertexNormals();
            const material = new THREE.MeshStandardMaterial({
              color: 0x38bdf8,
              roughness: 0.3,
              metalness: 0.5,
            });
            const mesh = new THREE.Mesh(geometry, material);
            const container = new THREE.Group();
            container.add(mesh);
            normalizeAndCenter(container);
            setModelObject(container);
            setLoading(false);
            if (onLoaded) onLoaded();
          },
          undefined,
          (err) => {
            if (!isMounted) return;
            console.error('Error loading STL:', err);
            setErrorMsg('Failed to parse STL model file.');
            setLoading(false);
            if (onError) onError('Failed to parse STL file.');
          }
        );
      } else if (fmt === 'ply') {
        const loader = new PLYLoader();
        loader.load(
          url,
          (geometry) => {
            if (!isMounted) return;
            geometry.computeVertexNormals();
            const material = new THREE.MeshStandardMaterial({
              color: 0xa855f7,
              roughness: 0.4,
              metalness: 0.4,
            });
            const mesh = new THREE.Mesh(geometry, material);
            const container = new THREE.Group();
            container.add(mesh);
            normalizeAndCenter(container);
            setModelObject(container);
            setLoading(false);
            if (onLoaded) onLoaded();
          },
          undefined,
          (err) => {
            if (!isMounted) return;
            console.error('Error loading PLY:', err);
            setErrorMsg('Failed to parse PLY model file.');
            setLoading(false);
            if (onError) onError('Failed to parse PLY file.');
          }
        );
      } else {
        setErrorMsg(`Unsupported file format: ${fileFormat}`);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Loader exception:', err);
      setErrorMsg(err.message || 'Unknown error loading 3D file.');
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [url, fileFormat]);

  // Apply material override if selected
  useEffect(() => {
    if (!modelObject) return;

    modelObject.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (!mesh.userData.originalMaterial) {
          mesh.userData.originalMaterial = mesh.material;
        }

        if (materialOverride === 'wireframe') {
          mesh.material = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x38bdf8 });
        } else if (materialOverride === 'clay') {
          mesh.material = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8, metalness: 0.1 });
        } else if (materialOverride === 'metal') {
          mesh.material = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.1, metalness: 0.95 });
        } else if (materialOverride === 'toon') {
          mesh.material = new THREE.MeshToonMaterial({ color: 0xec4899 });
        } else if (mesh.userData.originalMaterial) {
          mesh.material = mesh.userData.originalMaterial;
        }
      }
    });
  }, [modelObject, materialOverride]);

  if (loading) {
    return (
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshBasicMaterial color="#38bdf8" wireframe />
      </mesh>
    );
  }

  if (errorMsg || !modelObject) {
    return (
      <group>
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#ef4444" wireframe />
        </mesh>
      </group>
    );
  }

  return <primitive object={modelObject} ref={groupRef} />;
}

// Center the model at origin (0,0,0) and scale it to fit nicely inside a ~2 unit box
function normalizeAndCenter(object: THREE.Object3D) {
  const box = new THREE.Box3().setFromObject(object);
  const center = new THREE.Vector3();
  const size = new THREE.Vector3();

  box.getCenter(center);
  box.getSize(size);

  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = maxDim > 0 ? 2.0 / maxDim : 1.0;

  object.position.x = -center.x * scale;
  object.position.y = -center.y * scale;
  object.position.z = -center.z * scale;

  object.scale.set(scale, scale, scale);

  // Enable shadows for all meshes
  object.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}
