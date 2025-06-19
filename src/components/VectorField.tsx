import React, { useMemo } from 'react';
import { Vector3 } from 'three';

interface VectorFieldProps {
  sources: Array<{
    id: string;
    position: [number, number, number];
    strength: number;
    type: string;
  }>;
}

export function VectorField({ sources }: VectorFieldProps) {
  const vectors = useMemo(() => {
    const vectors = [];
    const gridSize = 10;
    const spacing = 2;
    
    for (let x = -gridSize; x <= gridSize; x += spacing) {
      for (let y = -gridSize; y <= gridSize; y += spacing) {
        for (let z = -gridSize; z <= gridSize; z += spacing) {
          const position = new Vector3(x, y, z);
          const field = calculateFieldAtPoint(position, sources);
          
          if (field.length() > 0.1) {
            vectors.push({
              position: position.toArray(),
              direction: field.normalize().toArray(),
              magnitude: Math.min(field.length(), 2)
            });
          }
        }
      }
    }
    
    return vectors;
  }, [sources]);

  return (
    <group>
      {vectors.map((vector, index) => (
        <mesh
          key={index}
          position={vector.position}
          lookAt={[
            vector.position[0] + vector.direction[0],
            vector.position[1] + vector.direction[1],
            vector.position[2] + vector.direction[2]
          ]}
        >
          <coneGeometry args={[0.1, vector.magnitude, 8]} />
          <meshPhongMaterial
            color="#10b981"
            transparent
            opacity={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

function calculateFieldAtPoint(position: Vector3, sources: any[]): Vector3 {
  const field = new Vector3();
  const k = 1; // Simplified constant for visualization
  
  for (const source of sources) {
    const sourcePos = new Vector3(...source.position);
    const r = position.clone().sub(sourcePos);
    const distance = r.length();
    
    if (distance < 0.5) continue;
    
    const fieldMagnitude = (k * source.strength) / (distance * distance);
    const fieldDirection = r.normalize();
    
    field.add(fieldDirection.multiplyScalar(fieldMagnitude));
  }
  
  return field;
}