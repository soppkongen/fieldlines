import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { useSimulationStore } from '../store/simulationStore';

interface ChargeSourceProps {
  source: {
    id: string;
    position: [number, number, number];
    strength: number;
    type: 'charge' | 'dipole' | 'current';
  };
}

export function ChargeSource({ source }: ChargeSourceProps) {
  const meshRef = useRef<Mesh>(null);
  const { isRunning } = useSimulationStore();
  
  const isPositive = source.strength > 0;
  const size = Math.min(Math.abs(source.strength) * 0.5 + 0.3, 1.0);
  
  useFrame((state) => {
    if (!meshRef.current || !isRunning) return;
    
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * 0.5;
    meshRef.current.rotation.y = time * 0.3;
    
    // Pulsing effect based on charge strength
    const scale = 1 + Math.sin(time * 2) * 0.1;
    meshRef.current.scale.setScalar(scale);
  });

  const handleClick = () => {
    // Toggle charge polarity on click
    useSimulationStore.getState().updateSource(source.id, {
      strength: -source.strength
    });
  };

  return (
    <mesh
      ref={meshRef}
      position={source.position}
      onClick={handleClick}
      scale={[size, size, size]}
    >
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhongMaterial
        color={isPositive ? '#ef4444' : '#3b82f6'}
        emissive={isPositive ? '#991b1b' : '#1e3a8a'}
        emissiveIntensity={0.3}
        shininess={100}
        transparent
        opacity={0.8}
      />
      
      {/* Charge indicator */}
      <mesh position={[0, 0, 1.2]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial
          color="white"
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Glow effect */}
      <mesh scale={[1.5, 1.5, 1.5]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color={isPositive ? '#ef4444' : '#3b82f6'}
          transparent
          opacity={0.1}
        />
      </mesh>
    </mesh>
  );
}