import React, { useMemo } from 'react';
import { Vector3, CatmullRomCurve3, BufferGeometry } from 'three';
import { PhysicsEngine } from '../utils/physics';

interface MagneticFieldLinesProps {
  sources: Array<{
    id: string;
    position: [number, number, number];
    type: string;
    current?: number;
    radius?: number;
    direction?: [number, number, number];
  }>;
  density: number;
}

export function MagneticFieldLines({ sources, density }: MagneticFieldLinesProps) {
  const fieldLines = useMemo(() => {
    const lines = [];
    const magneticSources = sources.filter(s => 
      ['wire', 'loop', 'solenoid'].includes(s.type)
    );
    
    if (magneticSources.length === 0) return [];
    
    for (const source of magneticSources) {
      const numLines = Math.abs(source.current || 0) * density;
      
      for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2;
        let startPos: Vector3;
        
        if (source.type === 'wire') {
          // Field lines around wire form circles
          const radius = 0.5 + i * 0.2;
          startPos = new Vector3(
            source.position[0] + Math.cos(angle) * radius,
            source.position[1],
            source.position[2] + Math.sin(angle) * radius
          );
        } else if (source.type === 'loop') {
          // Field lines from current loop
          const loopRadius = source.radius || 1;
          startPos = new Vector3(
            source.position[0] + Math.cos(angle) * loopRadius * 0.1,
            source.position[1] + (i % 2 === 0 ? 0.1 : -0.1),
            source.position[2] + Math.sin(angle) * loopRadius * 0.1
          );
        } else {
          // Solenoid field lines
          startPos = new Vector3(
            source.position[0] + Math.cos(angle) * 0.2,
            source.position[1] + (Math.random() - 0.5) * (source.length || 2),
            source.position[2] + Math.sin(angle) * 0.2
          );
        }
        
        const points = PhysicsEngine.generateMagneticFieldLine(
          startPos, 
          magneticSources, 
          source.type
        );
        
        if (points.length > 1) {
          lines.push({ 
            points, 
            strength: source.current || 0,
            type: source.type
          });
        }
      }
    }
    
    return lines;
  }, [sources, density]);

  const lineGeometries = useMemo(() => {
    return fieldLines.map(({ points, strength, type }) => {
      if (points.length < 2) return null;
      
      const curve = new CatmullRomCurve3(points);
      const geometry = new BufferGeometry().setFromPoints(
        curve.getPoints(Math.min(points.length * 2, 100))
      );
      
      return { geometry, strength, type };
    }).filter(Boolean);
  }, [fieldLines]);

  return (
    <group>
      {lineGeometries.map((line, index) => {
        if (!line) return null;
        
        const isPositive = line.strength > 0;
        const opacity = Math.min(Math.abs(line.strength) * 0.1 + 0.3, 0.8);
        
        // Color coding: Blue to Red based on field strength
        const color = isPositive ? '#ef4444' : '#3b82f6';
        
        return (
          <line key={index} geometry={line.geometry}>
            <lineBasicMaterial
              color={color}
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