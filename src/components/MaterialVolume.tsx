import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { MaterialProperties } from '../utils/maxwellEngine';

interface MaterialVolumeProps {
  material: MaterialProperties;
}

export function MaterialVolume({ material }: MaterialVolumeProps) {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    if (!meshRef.current) return;
    
    // Subtle animation to show material boundaries
    const time = Date.now() * 0.001;
    meshRef.current.material.opacity = 0.1 + Math.sin(time * 2) * 0.05;
  });

  const getGeometry = () => {
    const { type, dimensions } = material.geometry;
    
    switch (type) {
      case 'sphere':
        return <sphereGeometry args={[dimensions[0], 32, 32]} />;
      case 'box':
        return <boxGeometry args={dimensions} />;
      case 'cylinder':
        return <cylinderGeometry args={[dimensions[0], dimensions[0], dimensions[1], 32]} />;
      default:
        return <sphereGeometry args={[1, 32, 32]} />;
    }
  };

  const getColor = () => {
    // Color based on material properties
    if (material.relativePermittivity > 5) return '#3b82f6'; // Blue for high-k dielectrics
    if (material.relativePermeability > 10) return '#ef4444'; // Red for magnetic materials
    if (material.conductivity > 1e6) return '#fbbf24'; // Yellow for conductors
    return '#6b7280'; // Gray for general materials
  };

  return (
    <mesh
      ref={meshRef}
      position={material.geometry.position}
    >
      {getGeometry()}
      <meshPhongMaterial
        color={getColor()}
        transparent
        opacity={0.15}
        wireframe={false}
      />
      
      {/* Wireframe overlay */}
      <mesh position={[0, 0, 0]}>
        {getGeometry()}
        <meshBasicMaterial
          color={getColor()}
          transparent
          opacity={0.3}
          wireframe
        />
      </mesh>
    </mesh>
  );
}