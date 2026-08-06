import React from 'react';
import * as THREE from 'three';

interface ModelProps {
  materialOverride?: 'default' | 'wireframe' | 'clay' | 'metal' | 'toon';
}

function getOverrideMaterial(override?: 'default' | 'wireframe' | 'clay' | 'metal' | 'toon', defaultMat?: THREE.Material) {
  if (!override || override === 'default') return defaultMat;
  if (override === 'wireframe') {
    return new THREE.MeshBasicMaterial({ wireframe: true, color: 0x38bdf8 });
  }
  if (override === 'clay') {
    return new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8, metalness: 0.1 });
  }
  if (override === 'metal') {
    return new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.1, metalness: 0.95 });
  }
  if (override === 'toon') {
    return new THREE.MeshToonMaterial({ color: 0xf43f5e });
  }
  return defaultMat;
}

// 1. Cyber Robot Head (Ideal for Face Look-At Mouse Tracking)
export function RobotHead({ materialOverride = 'default' }: ModelProps) {
  const headMat = getOverrideMaterial(
    materialOverride,
    new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.3, metalness: 0.7 })
  );
  const faceplateMat = getOverrideMaterial(
    materialOverride,
    new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.2, metalness: 0.9 })
  );
  const eyeMat = getOverrideMaterial(
    materialOverride,
    new THREE.MeshStandardMaterial({ color: '#06b6d4', emissive: '#0891b2', emissiveIntensity: 0.8, roughness: 0.1 })
  );
  const pupilMat = getOverrideMaterial(
    materialOverride,
    new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#38bdf8', emissiveIntensity: 1 })
  );
  const earMat = getOverrideMaterial(
    materialOverride,
    new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.4, metalness: 0.8 })
  );
  const antennaMat = getOverrideMaterial(
    materialOverride,
    new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.3, metalness: 0.8 })
  );
  const mouthMat = getOverrideMaterial(
    materialOverride,
    new THREE.MeshStandardMaterial({ color: '#10b981', emissive: '#059669', emissiveIntensity: 0.6 })
  );

  return (
    <group position={[0, -0.2, 0]} scale={[1.1, 1.1, 1.1]}>
      {/* Head Base */}
      <mesh material={headMat as THREE.Material} position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 1.5, 1.2]} />
      </mesh>

      {/* Curved Jaw / Chin */}
      <mesh material={headMat as THREE.Material} position={[0, -0.85, 0.1]} castShadow receiveShadow>
        <boxGeometry args={[1.0, 0.4, 0.9]} />
      </mesh>

      {/* Inset Face Plate */}
      <mesh material={faceplateMat as THREE.Material} position={[0, 0.05, 0.55]}>
        <boxGeometry args={[1.2, 1.2, 0.2]} />
      </mesh>

      {/* Eyes */}
      <mesh material={eyeMat as THREE.Material} position={[-0.32, 0.25, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
      </mesh>
      <mesh material={eyeMat as THREE.Material} position={[0.32, 0.25, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
      </mesh>

      {/* Pupils */}
      <mesh material={pupilMat as THREE.Material} position={[-0.32, 0.25, 0.71]}>
        <sphereGeometry args={[0.08, 12, 12]} />
      </mesh>
      <mesh material={pupilMat as THREE.Material} position={[0.32, 0.25, 0.71]}>
        <sphereGeometry args={[0.08, 12, 12]} />
      </mesh>

      {/* Eyebrow Plates */}
      <mesh material={headMat as THREE.Material} position={[-0.32, 0.48, 0.67]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.42, 0.08, 0.1]} />
      </mesh>
      <mesh material={headMat as THREE.Material} position={[0.32, 0.48, 0.67]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.42, 0.08, 0.1]} />
      </mesh>

      {/* Mouth Bar */}
      <mesh material={mouthMat as THREE.Material} position={[0, -0.3, 0.66]}>
        <boxGeometry args={[0.6, 0.12, 0.05]} />
      </mesh>

      {/* Nose Ridge */}
      <mesh material={earMat as THREE.Material} position={[0, 0.1, 0.68]} rotation={[Math.PI / 4, 0, 0]}>
        <coneGeometry args={[0.08, 0.3, 4]} />
      </mesh>

      {/* Ears / Side Bolts */}
      <mesh material={earMat as THREE.Material} position={[-0.75, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
      </mesh>
      <mesh material={earMat as THREE.Material} position={[0.75, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.2, 16]} />
      </mesh>

      {/* Antenna */}
      <mesh material={earMat as THREE.Material} position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.04, 0.06, 0.4, 12]} />
      </mesh>
      <mesh material={antennaMat as THREE.Material} position={[0, 1.1, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
      </mesh>
    </group>
  );
}

// 2. Cute Creature / Alien Face
export function AlienCreature({ materialOverride = 'default' }: ModelProps) {
  const bodyMat = getOverrideMaterial(
    materialOverride,
    new THREE.MeshStandardMaterial({ color: '#8b5cf6', roughness: 0.4, metalness: 0.1 })
  );
  const bellyMat = getOverrideMaterial(
    materialOverride,
    new THREE.MeshStandardMaterial({ color: '#f472b6', roughness: 0.5, metalness: 0.0 })
  );
  const bigEyeMat = getOverrideMaterial(
    materialOverride,
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.1 })
  );
  const pupilMat = getOverrideMaterial(
    materialOverride,
    new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1 })
  );
  const hornMat = getOverrideMaterial(
    materialOverride,
    new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.3, metalness: 0.3 })
  );

  return (
    <group position={[0, -0.2, 0]}>
      {/* Head */}
      <mesh material={bodyMat as THREE.Material} position={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.9, 32, 32]} />
      </mesh>

      {/* Cheeks */}
      <mesh material={bellyMat as THREE.Material} position={[-0.45, -0.2, 0.6]}>
        <sphereGeometry args={[0.25, 16, 16]} />
      </mesh>
      <mesh material={bellyMat as THREE.Material} position={[0.45, -0.2, 0.6]}>
        <sphereGeometry args={[0.25, 16, 16]} />
      </mesh>

      {/* Center Big Eye */}
      <mesh material={bigEyeMat as THREE.Material} position={[0, 0.2, 0.75]}>
        <sphereGeometry args={[0.35, 24, 24]} />
      </mesh>
      <mesh material={pupilMat as THREE.Material} position={[0, 0.2, 1.02]}>
        <sphereGeometry args={[0.15, 16, 16]} />
      </mesh>

      {/* Snout / Smile */}
      <mesh material={bellyMat as THREE.Material} position={[0, -0.25, 0.8]}>
        <sphereGeometry args={[0.15, 16, 16]} />
      </mesh>

      {/* Horns */}
      <mesh material={hornMat as THREE.Material} position={[-0.5, 0.8, -0.1]} rotation={[0.2, 0, -0.3]}>
        <coneGeometry args={[0.15, 0.6, 16]} />
      </mesh>
      <mesh material={hornMat as THREE.Material} position={[0.5, 0.8, -0.1]} rotation={[0.2, 0, 0.3]}>
        <coneGeometry args={[0.15, 0.6, 16]} />
      </mesh>
    </group>
  );
}

// 3. Sci-Fi Gem / Crystal
export function CrystalGem({ materialOverride = 'default' }: ModelProps) {
  const gemMat = getOverrideMaterial(
    materialOverride,
    new THREE.MeshPhysicalMaterial({
      color: '#10b981',
      emissive: '#047857',
      emissiveIntensity: 0.3,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.6,
      ior: 1.5,
    })
  );

  return (
    <group position={[0, 0, 0]}>
      <mesh material={gemMat as THREE.Material} castShadow receiveShadow>
        <octahedronGeometry args={[1.1, 0]} />
      </mesh>
    </group>
  );
}

// 4. Stylized Helmet
export function SciFiHelmet({ materialOverride = 'default' }: ModelProps) {
  const helmetMat = getOverrideMaterial(
    materialOverride,
    new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.2, metalness: 0.8 })
  );
  const visorMat = getOverrideMaterial(
    materialOverride,
    new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#d97706', emissiveIntensity: 0.7, roughness: 0.1 })
  );
  const goldAccents = getOverrideMaterial(
    materialOverride,
    new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.3, metalness: 0.9 })
  );

  return (
    <group position={[0, -0.1, 0]}>
      {/* Dome */}
      <mesh material={helmetMat as THREE.Material} position={[0, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.95, 32, 32]} />
      </mesh>
      {/* Visor */}
      <mesh material={visorMat as THREE.Material} position={[0, 0.1, 0.45]}>
        <boxGeometry args={[1.3, 0.45, 0.8]} />
      </mesh>
      {/* Crest */}
      <mesh material={goldAccents as THREE.Material} position={[0, 0.85, 0]}>
        <boxGeometry args={[0.15, 0.3, 1.4]} />
      </mesh>
    </group>
  );
}
