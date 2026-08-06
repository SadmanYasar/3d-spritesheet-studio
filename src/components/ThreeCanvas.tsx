import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { ModelAsset, SceneConfig } from '../types';
import { AlienCreature, CrystalGem, RobotHead, SciFiHelmet } from './ProceduralModels';
import { Custom3DModel } from './Custom3DModel';

interface ThreeCanvasProps {
  modelAsset: ModelAsset;
  sceneConfig: SceneConfig;
  className?: string;
  onModelLoaded?: () => void;
  onModelError?: (error: string) => void;
}

function SceneLights({ sceneConfig }: { sceneConfig: SceneConfig }) {
  return (
    <>
      <ambientLight intensity={sceneConfig.ambientIntensity} />
      <directionalLight
        position={sceneConfig.lightPosition}
        intensity={sceneConfig.lightIntensity}
        color={sceneConfig.lightColor}
        castShadow={sceneConfig.shadows}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-sceneConfig.lightPosition[0], sceneConfig.lightPosition[1], -sceneConfig.lightPosition[2]]}
        intensity={sceneConfig.ambientIntensity * 0.4}
      />
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
  if (asset.type === 'sample' || asset.format === 'procedural') {
    const st = asset.sampleType || 'robot_head';
    if (st === 'robot_head' || st === 'cyber_face') {
      return <RobotHead materialOverride={sceneConfig.materialOverride} />;
    }
    if (st === 'helmet') {
      return <SciFiHelmet materialOverride={sceneConfig.materialOverride} />;
    }
    if (st === 'gem') {
      return <CrystalGem materialOverride={sceneConfig.materialOverride} />;
    }
    if (st === 'coin') {
      return <AlienCreature materialOverride={sceneConfig.materialOverride} />;
    }
    return <RobotHead materialOverride={sceneConfig.materialOverride} />;
  }

  return (
    <Custom3DModel
      url={asset.url}
      fileFormat={asset.format || 'glb'}
      materialOverride={sceneConfig.materialOverride}
      onLoaded={onModelLoaded}
      onError={onModelError}
    />
  );
}

export function ThreeCanvas({
  modelAsset,
  sceneConfig,
  className = '',
  onModelLoaded,
  onModelError,
}: ThreeCanvasProps) {
  const cameraDist = 3.5 / sceneConfig.zoom;

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none rounded-xl border-2 border-black dark:border-zinc-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.15)] ${className}`}
      style={{
        backgroundColor: sceneConfig.transparentBg ? 'transparent' : sceneConfig.backgroundColor,
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
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 0 12px, 12px -12px, -12px 0px',
          }}
        />
      )}

      <Canvas shadows gl={{ antialias: true, alpha: sceneConfig.transparentBg, preserveDrawingBuffer: true }}>
        <PerspectiveCamera makeDefault position={[0, 0, cameraDist]} fov={45} />
        <SceneLights sceneConfig={sceneConfig} />

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
          enablePan
          enableZoom
          enableRotate
          minDistance={1.0}
          maxDistance={12.0}
          makeDefault
        />
      </Canvas>

      {/* Orbit Help Overlay Badge */}
      <div className="absolute bottom-3 left-3 px-3 py-1 text-[11px] font-mono font-bold tracking-wider bg-black text-white dark:bg-white dark:text-black rounded-md border-2 border-black dark:border-white pointer-events-none flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
        DRAG TO ORBIT | SCROLL TO ZOOM
      </div>
    </div>
  );
}
