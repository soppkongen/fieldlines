import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Stats } from '@react-three/drei';
import { Scene3D } from './Scene3D';
import { LoadingSpinner } from './LoadingSpinner';

export function MainViewer() {
  return (
    <div className="flex-1 relative bg-gray-900">
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3">
          <h3 className="text-sm font-medium text-white mb-2">3D Viewport</h3>
          <div className="text-xs text-gray-300 space-y-1">
            <div>• Left click + drag: Rotate view</div>
            <div>• Right click + drag: Pan view</div>
            <div>• Scroll wheel: Zoom</div>
            <div>• Double click: Add charge</div>
          </div>
        </div>
      </div>

      <Canvas
        camera={{ position: [10, 10, 10], fov: 60 }}
        className="w-full h-full"
        gl={{ antialias: true, alpha: false }}
        onCreated={({ gl }) => {
          gl.setClearColor('#111827');
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 5]} intensity={0.5} />
          <pointLight position={[-10, -10, -5]} intensity={0.3} color="#4f46e5" />
          
          {/* Scene */}
          <Scene3D />
          
          {/* Controls */}
          <OrbitControls
            enableDamping
            dampingFactor={0.05}
            minDistance={5}
            maxDistance={50}
            minPolarAngle={0}
            maxPolarAngle={Math.PI}
          />
          
          {/* Grid */}
          <Grid
            position={[0, -5, 0]}
            infiniteGrid
            cellSize={1}
            cellThickness={0.5}
            sectionSize={10}
            sectionThickness={1}
            cellColor="#374151"
            sectionColor="#4b5563"
            fadeDistance={30}
            fadeStrength={1}
          />
          
          {/* Performance Stats */}
          <Stats showPanel={0} className="stats" />
        </Suspense>
      </Canvas>

      {/* Loading Overlay */}
      <Suspense fallback={<LoadingSpinner />}>
        <div />
      </Suspense>
    </div>
  );
}