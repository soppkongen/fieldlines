import React, { useMemo } from 'react';
import { Vector3 } from 'three';
import { PhysicsEngine } from '../utils/physics';

interface VectorFieldProps {
  sources: Array<{
    id: string;
    position: [number, number, number];
    strength: number;
    type: string;
    current?: number;
    radius?: number;
    direction?: [number, number, number];
  }>;
  fieldType: 'electric' | 'magnetic' | 'both' | 'poynting';
}

export function VectorField({ sources, fieldType }: VectorFieldProps) {
  const vectors = useMemo(() => {
    const vectors = [];
    const gridSize = 8;
    const spacing = 2;
    
    for (let x = -gridSize; x <= gridSize; x += spacing) {
      for (let y = -gridSize; y <= gridSize; y += spacing) {
        for (let z = -gridSize; z <= gridSize; z += spacing) {
          const position: [number, number, number] = [x, y, z];
          
          if (fieldType === 'electric' || fieldType === 'both') {
            const electricField = PhysicsEngine.calculateElectricField(position, sources);
            const magnitude = Math.sqrt(electricField[0]**2 + electricField[1]**2 + electricField[2]**2);
            
            if (magnitude > 0.1) {
              vectors.push({
                position,
                direction: [
                  electricField[0] / magnitude,
                  electricField[1] / magnitude,
                  electricField[2] / magnitude
                ],
                magnitude: Math.min(magnitude * 0.1, 2),
                color: '#22d3ee',
                type: 'electric'
              });
            }
          }
          
          if (fieldType === 'magnetic' || fieldType === 'both') {
            const magneticField = PhysicsEngine.calculateMagneticField(position, sources);
            const magnitude = Math.sqrt(magneticField[0]**2 + magneticField[1]**2 + magneticField[2]**2);
            
            if (magnitude > 1e-8) {
              vectors.push({
                position,
                direction: [
                  magneticField[0] / magnitude,
                  magneticField[1] / magnitude,
                  magneticField[2] / magnitude
                ],
                magnitude: Math.min(magnitude * 1e6, 2), // Scale for visibility
                color: '#f59e0b',
                type: 'magnetic'
              });
            }
          }
          
          if (fieldType === 'poynting') {
            const electricField = PhysicsEngine.calculateElectricField(position, sources);
            const magneticField = PhysicsEngine.calculateMagneticField(position, sources);
            const poyntingVector = PhysicsEngine.calculatePoyntingVector(electricField, magneticField);
            const magnitude = Math.sqrt(poyntingVector[0]**2 + poyntingVector[1]**2 + poyntingVector[2]**2);
            
            if (magnitude > 1e-6) {
              vectors.push({
                position,
                direction: [
                  poyntingVector[0] / magnitude,
                  poyntingVector[1] / magnitude,
                  poyntingVector[2] / magnitude
                ],
                magnitude: Math.min(magnitude * 1e3, 2), // Scale for visibility
                color: '#10b981',
                type: 'poynting'
              });
            }
          }
        }
      }
    }
    
    return vectors;
  }, [sources, fieldType]);

  return (
    <group>
      {vectors.map((vector, index) => (
        <group key={index}>
          {/* Vector arrow */}
          <mesh
            position={vector.position}
            lookAt={[
              vector.position[0] + vector.direction[0],
              vector.position[1] + vector.direction[1],
              vector.position[2] + vector.direction[2]
            ]}
          >
            <coneGeometry args={[0.1, vector.magnitude, 8]} />
            <meshPhongMaterial
              color={vector.color}
              transparent
              opacity={0.7}
            />
          </mesh>
          
          {/* Vector stem */}
          <mesh
            position={[
              vector.position[0] + vector.direction[0] * vector.magnitude * 0.25,
              vector.position[1] + vector.direction[1] * vector.magnitude * 0.25,
              vector.position[2] + vector.direction[2] * vector.magnitude * 0.25
            ]}
            lookAt={[
              vector.position[0] + vector.direction[0],
              vector.position[1] + vector.direction[1],
              vector.position[2] + vector.direction[2]
            ]}
          >
            <cylinderGeometry args={[0.02, 0.02, vector.magnitude * 0.5]} />
            <meshPhongMaterial
              color={vector.color}
              transparent
              opacity={0.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}