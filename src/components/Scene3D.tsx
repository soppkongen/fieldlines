import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { useSimulationStore } from '../store/simulationStore';
import { ChargeSource } from './ChargeSource';
import { FieldLines } from './FieldLines';
import { VectorField } from './VectorField';
import { FieldProbe } from './FieldProbe';

export function Scene3D() {
  const groupRef = useRef<Group>(null);
  const { sources, isRunning, visualizationMode, animationSpeed } = useSimulationStore();

  // Animation loop
  useFrame((state) => {
    if (!isRunning || !groupRef.current) return;
    
    const time = state.clock.getElapsedTime() * animationSpeed;
    groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.05;
  });

  // Calculate field lines based on sources
  const fieldLines = useMemo(() => {
    if (sources.length === 0) return [];
    
    const lines = [];
    const density = 8; // Field lines per unit charge
    
    for (const source of sources) {
      const numLines = Math.abs(source.strength) * density;
      
      for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2;
        const startPos = new Vector3(
          source.position[0] + Math.cos(angle) * 0.2,
          source.position[1],
          source.position[2] + Math.sin(angle) * 0.2
        );
        
        const points = calculateFieldLine(startPos, sources, source.strength > 0);
        lines.push({ points, strength: source.strength });
      }
    }
    
    return lines;
  }, [sources]);

  return (
    <group ref={groupRef}>
      {/* Charge Sources */}
      {sources.map((source) => (
        <ChargeSource key={source.id} source={source} />
      ))}
      
      {/* Field Visualization */}
      {visualizationMode === 'fieldLines' && (
        <FieldLines lines={fieldLines} />
      )}
      
      {visualizationMode === 'vectorField' && (
        <VectorField sources={sources} />
      )}
      
      {/* Field Probe */}
      <FieldProbe />
    </group>
  );
}

// Helper function to calculate field line paths
function calculateFieldLine(startPos: Vector3, sources: any[], isPositive: boolean): Vector3[] {
  const points = [startPos.clone()];
  const stepSize = 0.1;
  const maxSteps = 200;
  let currentPos = startPos.clone();
  
  for (let step = 0; step < maxSteps; step++) {
    const field = calculateElectricField(currentPos, sources);
    
    if (field.length() < 0.001) break; // Field too weak
    
    field.normalize().multiplyScalar(stepSize * (isPositive ? 1 : -1));
    currentPos.add(field);
    
    // Stop if too far from origin
    if (currentPos.length() > 20) break;
    
    points.push(currentPos.clone());
  }
  
  return points;
}

// Calculate electric field at a point
function calculateElectricField(position: Vector3, sources: any[]): Vector3 {
  const field = new Vector3();
  const k = 8.99e9; // Coulomb's constant (simplified for visualization)
  
  for (const source of sources) {
    const sourcePos = new Vector3(...source.position);
    const r = position.clone().sub(sourcePos);
    const distance = r.length();
    
    if (distance < 0.1) continue; // Avoid singularity
    
    const fieldMagnitude = (k * source.strength) / (distance * distance);
    const fieldDirection = r.normalize();
    
    field.add(fieldDirection.multiplyScalar(fieldMagnitude));
  }
  
  return field;
}