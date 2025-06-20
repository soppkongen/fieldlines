import React from 'react';
import { SourceControls } from './SourceControls';
import { MagnetostaticControls } from './MagnetostaticControls';
import { ElectrodynamicControls } from './ElectrodynamicControls';
import { DipoleAntennaControls } from './DipoleAntennaControls';
import { MaterialControls } from './MaterialControls';
import { VisualizationControls } from './VisualizationControls';
import { AdvancedMeasurementPanel } from './AdvancedMeasurementPanel';
import { ScenarioLibrary } from './ScenarioLibrary';
import { SceneControls } from './SceneControls';

export function ControlPanel() {
  return (
    <div className="w-96 bg-gray-900 border-l border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Control Panel</h2>
        <p className="text-sm text-gray-400 mt-1">Complete Maxwell's equations simulator</p>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1">
          <ScenarioLibrary />
          <SourceControls />
          <MagnetostaticControls />
          <DipoleAntennaControls />
          <MaterialControls />
          <ElectrodynamicControls />
          <VisualizationControls />
          <AdvancedMeasurementPanel />
          <SceneControls />
        </div>
      </div>
    </div>
  );
}