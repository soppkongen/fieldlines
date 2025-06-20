import React, { useMemo } from 'react';
import { Vector3 } from 'three';
import { MaxwellEngine } from '../utils/maxwellEngine';
import { PhysicsEngine } from '../utils/physics';

interface PoyntingVectorFieldProps {
  sources: any[];
  materials: any[];
  currentTime: number;
}

export function PoyntingVectorField({ sources, materials, currentTime }: PoyntingVectorFieldProps) {
  const poyntingVectors = useMemo(() => {
    const vectors = [];
    const gridSize = 6;
    const spacing = 1.5;
    
    for (let x = -gridSize; x <= gridSize; x += spacing) {
      for (let y = -gridSize; y <= gridSize; y += spacing) {
        for (let z = -gridSize; z <= gridSize; z += spacing) {
          const position: [number, number, number] = [x, y, z];
          
          // Calculate E and B fields
          const electricField = PhysicsEngine.calculateElectricField(position, sources, currentTime);
          const magneticField = PhysicsEngine.calculateMagneticField(position, sources, currentTime);
          
          // Calculate Poynting vector
          const poyntingVector = MaxwellEngine.calculatePoyntingVector(
            electricField, 
            magneticField, 
            materials, 
            position
          );
          
          const magnitude = Math.sqrt(
            poyntingVector[0]**2 + poyntingVector[1]**2 + poyntingVector[2]**2
          );
          
          if (magnitude > 1e-8) {
            vectors.push({
              position,
              direction: [
                poyntingVector[0] / magnitude,
                poyntingVector[1] / magnitude,
                poyntingVector[2] / magnitude
              ],
              magnitude: Math.min(magnitude * 1e6, 3), // Scale for visibility
              energyDensity: MaxwellEngine.calculateEnergyDensity(
                electricField, 
                magneticField, 
                materials, 
                position
              )
            });
          }
        }
      }
    }
    
    return vectors;
  }, [sources, materials, currentTime]);

  return (
    <group>
      {poyntingVectors.map((vector, index) => (
        <group key={index}>
          {/* Energy flow arrow */}
          <mesh
            position={vector.position}
            lookAt={[
              vector.position[0] + vector.direction[0],
              vector.position[1] + vector.direction[1],
              vector.position[2] + vector.direction[2]
            ]}
          >
            <coneGeometry args={[0.08, vector.magnitude * 0.3, 8]} />
            <meshPhongMaterial
              color="#10b981"
              emissive="#065f46"
              emissiveIntensity={0.2}
              transparent
              opacity={0.8}
            />
          </mesh>
          
          {/* Energy flow stem */}
          <mesh
            position={[
              vector.position[0] + vector.direction[0] * vector.magnitude * 0.15,
              vector.position[1] + vector.direction[1] * vector.magnitude * 0.15,
              vector.position[2] + vector.direction[2] * vector.magnitude * 0.15
            ]}
            lookAt={[
              vector.position[0] + vector.direction[0],
              vector.position[1] + vector.direction[1],
              vector.position[2] + vector.direction[2]
            ]}
          >
            <cylinderGeometry args={[0.02, 0.02, vector.magnitude * 0.3]} />
            <meshPhongMaterial
              color="#10b981"
              transparent
              opacity={0.6}
            />
          </mesh>
          
          {/* Energy density visualization */}
          <mesh position={vector.position}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial
              color="#fbbf24"
              transparent
              opacity={Math.min(vector.energyDensity * 1e12, 0.5)}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}