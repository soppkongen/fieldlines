import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { useSimulationStore } from '../store/simulationStore';

export function FieldProbe() {
  const meshRef = useRef<Mesh>(null);
  const { probePosition, isRunning } = useSimulationStore();

  useFrame(() => {
    if (!meshRef.current || !isRunning) return;
    
    const time = Date.now() * 0.001;
    meshRef.current.position.y = probePosition[1] + Math.sin(time * 2) * 0.1;
  });

  return (
    <group position={probePosition}>
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.3]} />
        <meshPhongMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      {/* Probe beam */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2]} />
        <meshPhongMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}