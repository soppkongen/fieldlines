import React, { useMemo } from 'react';
import { Vector3, CatmullRomCurve3, BufferGeometry, Line } from 'three';

interface FieldLinesProps {
  lines: Array<{
    points: Vector3[];
    strength: number;
  }>;
}

export function FieldLines({ lines }: FieldLinesProps) {
  const lineGeometries = useMemo(() => {
    return lines.map(({ points, strength }) => {
      if (points.length < 2) return null;
      
      const curve = new CatmullRomCurve3(points);
      const geometry = new BufferGeometry().setFromPoints(
        curve.getPoints(Math.min(points.length * 2, 100))
      );
      
      return { geometry, strength };
    }).filter(Boolean);
  }, [lines]);

  return (
    <group>
      {lineGeometries.map((line, index) => {
        if (!line) return null;
        
        const isPositive = line.strength > 0;
        const opacity = Math.min(Math.abs(line.strength) * 0.3 + 0.4, 1.0);
        
        return (
          <line key={index} geometry={line.geometry}>
            <lineBasicMaterial
              color={isPositive ? '#22d3ee' : '#f59e0b'}
              transparent
              opacity={opacity}
              linewidth={2}
            />
          </line>
        );
      })}
    </group>
  );
}