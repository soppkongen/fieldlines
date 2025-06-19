import React, { useMemo } from 'react';
import { Vector3 } from 'three';
import { useSimulationStore } from '../store/simulationStore';

export function WavePropagationDisplay() {
  const { sources, currentTime, waveSpeed, showWavefront } = useSimulationStore();
  
  const waveData = useMemo(() => {
    const oscillatingSources = sources.filter(s => s.frequency && s.frequency > 0);
    const waves = [];
    
    for (const source of oscillatingSources) {
      const frequency = source.frequency || 1e6; // 1 MHz default
      const wavelength = (3e8 * waveSpeed) / frequency; // c * waveSpeed / f
      const phase = source.phase || 0;
      
      // Generate wave propagation spheres
      const numWavefronts = 10;
      for (let i = 0; i < numWavefronts; i++) {
        const waveTime = currentTime - (i * wavelength) / (3e8 * waveSpeed);
        if (waveTime < 0) continue;
        
        const radius = 3e8 * waveSpeed * waveTime;
        const amplitude = Math.sin(2 * Math.PI * frequency * waveTime + phase) * 
                         Math.exp(-radius * 0.1); // Decay with distance
        
        if (Math.abs(amplitude) > 0.01 && radius < 20) {
          waves.push({
            position: source.position,
            radius,
            amplitude,
            frequency,
            phase: 2 * Math.PI * frequency * waveTime + phase
          });
        }
      }
    }
    
    return waves;
  }, [sources, currentTime, waveSpeed]);

  return (
    <group>
      {waveData.map((wave, index) => (
        <group key={index}>
          {/* Electric field wave */}
          <mesh position={wave.position}>
            <sphereGeometry args={[wave.radius, 32, 16, 0, Math.PI * 2, 0, Math.PI]} />
            <meshBasicMaterial
              color="#22d3ee"
              transparent
              opacity={Math.abs(wave.amplitude) * 0.3}
              wireframe
            />
          </mesh>
          
          {/* Magnetic field wave */}
          <mesh position={wave.position}>
            <sphereGeometry args={[wave.radius, 32, 16, 0, Math.PI * 2, 0, Math.PI]} />
            <meshBasicMaterial
              color="#f59e0b"
              transparent
              opacity={Math.abs(wave.amplitude) * 0.2}
              wireframe
            />
          </mesh>
          
          {/* Wavefront marker */}
          {showWavefront && (
            <mesh position={wave.position}>
              <sphereGeometry args={[wave.radius, 64, 32, 0, Math.PI * 2, 0, Math.PI]} />
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.1}
                side={2} // DoubleSide
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}