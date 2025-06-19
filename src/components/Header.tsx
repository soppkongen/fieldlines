import React from 'react';
import { Zap, Settings, Download, Upload, Play, Pause, RotateCcw } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export function Header() {
  const { isRunning, toggleSimulation, resetSimulation } = useSimulationStore();

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Zap className="w-8 h-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">EM-Vis Pro</h1>
          </div>
          <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
            Electromagnetic Field Simulator
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSimulation}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                isRunning 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Pause' : 'Start'}
            </button>
            
            <button
              onClick={resetSimulation}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>

          <div className="w-px h-6 bg-gray-700" />

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Upload className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Download className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}