import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { useSimulationStore } from '../store/simulationStore';

interface MagneticSourceProps {
  source: {
    id: string;
    position: [number, number, number];
    strength: number;
    type: 'wire' | 'loop' | 'solenoid';
    current?: number;
    radius?: number;
    length?: number;
    turns?: number;
    direction?: [number, number, number];
  };
}

export function MagneticSource({ source }: MagneticSourceProps) {
  const meshRef = useRef<Mesh>(null);
  const { isRunning, currentTime } = useSimulationStore();
  
  const current = source.current || 0;
  const isPositiveCurrent = current > 0;
  
  useFrame(() => {
    if (!meshRef.current || !isRunning) return;
    
    // Animate current flow
    const time = currentTime * 0.001;
    meshRef.current.rotation.y = time * (isPositiveCurrent ? 1 : -1);
  });

  const handleClick = () => {
    useSimulationStore.getState().updateSource(source.id, {
      current: -current
    });
  };

  const renderWire = () => (
    <group>
      <mesh
        ref={meshRef}
        position={source.position}
        onClick={handleClick}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.05, 0.05, 10]} />
        <meshPhongMaterial
          color={isPositiveCurrent ? '#ef4444' : '#3b82f6'}
          emissive={isPositiveCurrent ? '#991b1b' : '#1e3a8a'}
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Current direction indicators */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh
          key={i}
          position={[
            source.position[0],
            source.position[1] + (i - 2) * 2,
            source.position[2]
          ]}
        >
          <coneGeometry args={[0.1, 0.3, 8]} />
          <meshBasicMaterial
            color={isPositiveCurrent ? '#fbbf24' : '#06b6d4'}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );

  const renderLoop = () => {
    const radius = source.radius || 1;
    return (
      <group>
        <mesh
          ref={meshRef}
          position={source.position}
          onClick={handleClick}
        >
          <torusGeometry args={[radius, 0.05, 16, 100]} />
          <meshPhongMaterial
            color={isPositiveCurrent ? '#ef4444' : '#3b82f6'}
            emissive={isPositiveCurrent ? '#991b1b' : '#1e3a8a'}
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Current flow indicators */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                source.position[0] + Math.cos(angle) * radius,
                source.position[1],
                source.position[2] + Math.sin(angle) * radius
              ]}
              rotation={[0, angle + Math.PI / 2, 0]}
            >
              <coneGeometry args={[0.05, 0.15, 6]} />
              <meshBasicMaterial
                color="#fbbf24"
                transparent
                opacity={0.9}
              />
            </mesh>
          );
        })}
      </group>
    );
  };

  const renderSolenoid = () => {
    const length = source.length || 2;
    const turns = source.turns || 10;
    const radius = source.radius || 0.5;
    
    return (
      <group>
        {/* Solenoid coils */}
        {Array.from({ length: turns }, (_, i) => (
          <mesh
            key={i}
            position={[
              source.position[0],
              source.position[1] + (i / turns - 0.5) * length,
              source.position[2]
            ]}
          >
            <torusGeometry args={[radius, 0.02, 8, 32]} />
            <meshPhongMaterial
              color={isPositiveCurrent ? '#ef4444' : '#3b82f6'}
              emissive={isPositiveCurrent ? '#991b1b' : '#1e3a8a'}
              emissiveIntensity={0.2}
            />
          </mesh>
        ))}
        
        {/* Magnetic field lines inside solenoid */}
        <mesh position={source.position}>
          <cylinderGeometry args={[radius * 0.8, radius * 0.8, length, 32, 1, true]} />
          <meshBasicMaterial
            color="#10b981"
            transparent
            opacity={0.1}
            wireframe
          />
        </mesh>
      </group>
    );
  };

  switch (source.type) {
    case 'wire':
      return renderWire();
    case 'loop':
      return renderLoop();
    case 'solenoid':
      return renderSolenoid();
    default:
      return null;
  }
}