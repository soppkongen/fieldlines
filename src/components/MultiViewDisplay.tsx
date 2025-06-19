import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { Scene3D } from './Scene3D';
import { useSimulationStore } from '../store/simulationStore';

export function MultiViewDisplay() {
  const { activeViews } = useSimulationStore();

  const renderView = (viewType: string, position: [number, number, number], up: [number, number, number]) => (
    <div className="w-1/2 h-1/2 border border-gray-700">
      <div className="absolute top-2 left-2 z-10 bg-black/50 px-2 py-1 rounded text-xs text-white">
        {viewType.toUpperCase()}
      </div>
      <Canvas
        camera={{ position, up, fov: 60 }}
        className="w-full h-full"
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#1f2937');
        }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        
        <Scene3D />
        
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minDistance={2}
          maxDistance={20}
        />
        
        <Grid
          position={[0, -2, 0]}
          infiniteGrid
          cellSize={0.5}
          cellThickness={0.3}
          sectionSize={5}
          sectionThickness={0.5}
          cellColor="#374151"
          sectionColor="#4b5563"
          fadeDistance={15}
          fadeStrength={1}
        />
      </Canvas>
    </div>
  );

  return (
    <div className="w-full h-full relative grid grid-cols-2 grid-rows-2">
      {/* XY Plane (Top View) */}
      {renderView('xy', [0, 10, 0], [0, 0, -1])}
      
      {/* YZ Plane (Side View) */}
      {renderView('yz', [10, 0, 0], [0, 1, 0])}
      
      {/* XZ Plane (Front View) */}
      {renderView('xz', [0, 0, 10], [0, 1, 0])}
      
      {/* 3D Perspective */}
      {renderView('3d', [10, 10, 10], [0, 1, 0])}
    </div>
  );
}