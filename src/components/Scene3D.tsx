import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { useSimulationStore } from '../store/simulationStore';
import { ChargeSource } from './ChargeSource';
import { MagneticSource } from './MagneticSource';
import { FieldLines } from './FieldLines';
import { MagneticFieldLines } from './MagneticFieldLines';
import { VectorField } from './VectorField';
import { FieldProbe } from './FieldProbe';
import { WavePropagationDisplay } from './WavePropagationDisplay';
import { PhysicsEngine } from '../utils/physics';

export function Scene3D() {
  const groupRef = useRef<Group>(null);
  const { 
    sources, 
    isRunning, 
    visualizationMode, 
    fieldType,
    animationSpeed, 
    currentTime,
    stepSimulation,
    probePosition,
    fieldHistory
  } = useSimulationStore();

  // Animation loop
  useFrame((state, delta) => {
    if (!isRunning || !groupRef.current) return;
    
    const time = state.clock.getElapsedTime() * animationSpeed;
    groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.02;
    
    // Step simulation forward
    stepSimulation();
  });

  // Update field history
  useEffect(() => {
    if (!isRunning) return;
    
    const electricField = PhysicsEngine.calculateElectricField(probePosition, sources, currentTime);
    const magneticField = PhysicsEngine.calculateMagneticField(probePosition, sources, currentTime);
    const poyntingVector = PhysicsEngine.calculatePoyntingVector(electricField, magneticField);
    
    const newFieldData = {
      electric: electricField,
      magnetic: magneticField,
      poynting: poyntingVector,
      timestamp: currentTime
    };
    
    useSimulationStore.setState(state => ({
      fieldHistory: [...state.fieldHistory.slice(-999), newFieldData]
    }));
  }, [currentTime, isRunning, probePosition, sources]);

  // Calculate field lines based on sources and field type
  const fieldLines = useMemo(() => {
    if (sources.length === 0) return [];
    
    const electricSources = sources.filter(s => ['charge', 'dipole'].includes(s.type));
    if (electricSources.length === 0 && fieldType === 'electric') return [];
    
    const lines = [];
    const density = 8;
    
    for (const source of electricSources) {
      const numLines = Math.abs(source.strength) * density;
      
      for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2;
        const startPos = new Vector3(
          source.position[0] + Math.cos(angle) * 0.2,
          source.position[1],
          source.position[2] + Math.sin(angle) * 0.2
        );
        
        const points = PhysicsEngine.generateFieldLine(startPos, sources, 0.1, 200);
        lines.push({ points, strength: source.strength });
      }
    }
    
    return lines;
  }, [sources, fieldType]);

  const electricSources = sources.filter(s => ['charge', 'dipole'].includes(s.type));
  const magneticSources = sources.filter(s => ['wire', 'loop', 'solenoid'].includes(s.type));

  return (
    <group ref={groupRef}>
      {/* Electric Charge Sources */}
      {electricSources.map((source) => (
        <ChargeSource key={source.id} source={source} />
      ))}
      
      {/* Magnetic Current Sources */}
      {magneticSources.map((source) => (
        <MagneticSource key={source.id} source={source} />
      ))}
      
      {/* Field Visualization */}
      {visualizationMode === 'fieldLines' && (
        <>
          {(fieldType === 'electric' || fieldType === 'both') && (
            <FieldLines lines={fieldLines} />
          )}
          {(fieldType === 'magnetic' || fieldType === 'both') && (
            <MagneticFieldLines sources={magneticSources} density={8} />
          )}
        </>
      )}
      
      {visualizationMode === 'vectorField' && (
        <VectorField sources={sources} fieldType={fieldType} />
      )}
      
      {visualizationMode === 'wavePropagation' && (
        <WavePropagationDisplay />
      )}
      
      {/* Field Probe */}
      <FieldProbe />
    </group>
  );
}