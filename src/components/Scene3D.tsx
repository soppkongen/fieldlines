import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3 } from 'three';
import { useSimulationStore } from '../store/simulationStore';
import { ChargeSource } from './ChargeSource';
import { MagneticSource } from './MagneticSource';
import { MaterialVolume } from './MaterialVolume';
import { FieldLines } from './FieldLines';
import { MagneticFieldLines } from './MagneticFieldLines';
import { VectorField } from './VectorField';
import { FieldProbe } from './FieldProbe';
import { WavePropagationDisplay } from './WavePropagationDisplay';
import { PoyntingVectorField } from './PoyntingVectorField';
import { PhysicsEngine } from '../utils/physics';
import { MaxwellEngine } from '../utils/maxwellEngine';

export function Scene3D() {
  const groupRef = useRef<Group>(null);
  const { 
    sources, 
    waveSources,
    materials,
    isRunning, 
    visualizationMode, 
    fieldType,
    animationSpeed, 
    currentTime,
    stepSimulation,
    probePosition,
    fieldHistory,
    enableInduction,
    showPoyntingVectors
  } = useSimulationStore();

  // Animation loop
  useFrame((state, delta) => {
    if (!isRunning || !groupRef.current) return;
    
    const time = state.clock.getElapsedTime() * animationSpeed;
    groupRef.current.rotation.y = Math.sin(time * 0.1) * 0.02;
    
    // Step simulation forward
    stepSimulation();
  });

  // Update field history with Maxwell coupling
  useEffect(() => {
    if (!isRunning) return;
    
    let electricField = PhysicsEngine.calculateElectricField(probePosition, sources, currentTime);
    let magneticField = PhysicsEngine.calculateMagneticField(probePosition, sources, currentTime);
    
    // Add wave source contributions
    for (const waveSource of waveSources) {
      const waveFields = MaxwellEngine.calculateDipoleRadiation(probePosition, waveSource, currentTime);
      electricField[0] += waveFields.electric[0];
      electricField[1] += waveFields.electric[1];
      electricField[2] += waveFields.electric[2];
      magneticField[0] += waveFields.magnetic[0];
      magneticField[1] += waveFields.magnetic[1];
      magneticField[2] += waveFields.magnetic[2];
    }
    
    // Apply material effects
    electricField = MaxwellEngine.applyMaterialEffects(electricField, 'electric', probePosition, materials);
    magneticField = MaxwellEngine.applyMaterialEffects(magneticField, 'magnetic', probePosition, materials);
    
    // Add induction effects if enabled
    if (enableInduction && fieldHistory.length > 1) {
      const deltaTime = currentTime - fieldHistory[fieldHistory.length - 1].timestamp;
      
      const inducedE = MaxwellEngine.calculateInducedElectricField(
        probePosition,
        fieldHistory.map(h => ({ field: h.magnetic, time: h.timestamp })),
        deltaTime
      );
      
      const inducedB = MaxwellEngine.calculateInducedMagneticField(
        probePosition,
        fieldHistory.map(h => ({ field: h.electric, time: h.timestamp })),
        deltaTime,
        materials
      );
      
      electricField[0] += inducedE[0];
      electricField[1] += inducedE[1];
      electricField[2] += inducedE[2];
      magneticField[0] += inducedB[0];
      magneticField[1] += inducedB[1];
      magneticField[2] += inducedB[2];
    }
    
    const poyntingVector = MaxwellEngine.calculatePoyntingVector(electricField, magneticField, materials, probePosition);
    
    const newFieldData = {
      electric: electricField,
      magnetic: magneticField,
      poynting: poyntingVector,
      timestamp: currentTime
    };
    
    useSimulationStore.setState(state => ({
      fieldHistory: [...state.fieldHistory.slice(-999), newFieldData]
    }));
  }, [currentTime, isRunning, probePosition, sources, waveSources, materials, enableInduction, fieldHistory]);

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
      
      {/* Material Volumes */}
      {materials.map((material) => (
        <MaterialVolume key={material.id} material={material} />
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
      
      {(visualizationMode === 'poyntingField' || showPoyntingVectors) && (
        <PoyntingVectorField 
          sources={[...sources, ...waveSources]} 
          materials={materials} 
          currentTime={currentTime} 
        />
      )}
      
      {/* Field Probe */}
      <FieldProbe />
    </group>
  );
}