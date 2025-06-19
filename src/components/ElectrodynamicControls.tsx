import React, { useState } from 'react';
import { Zap, Play, Pause, SkipForward, ChevronDown, ChevronRight } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export function ElectrodynamicControls() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { 
    isRunning,
    toggleSimulation,
    stepSimulation,
    animationSpeed,
    setAnimationSpeed,
    timeStep,
    setTimeStep,
    waveSpeed,
    setWaveSpeed,
    showWavefront,
    phaseDisplay,
    sources,
    addSource,
    updateSource
  } = useSimulationStore();

  const handleAddOscillatingCharge = () => {
    addSource({
      position: [Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3],
      strength: 1,
      type: 'charge',
      frequency: 1e6, // 1 MHz
      phase: 0
    });
  };

  const oscillatingSources = sources.filter(s => s.frequency && s.frequency > 0);

  return (
    <div className="border-b border-gray-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          <span className="font-medium text-white">Electrodynamics</span>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Time Evolution Controls */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Time Controls</label>
            <div className="flex gap-2 mb-3">
              <button
                onClick={toggleSimulation}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                  isRunning 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Pause' : 'Play'}
              </button>
              
              <button
                onClick={stepSimulation}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                <SkipForward className="w-4 h-4" />
                Step
              </button>
            </div>

            {/* Simulation Speed */}
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Simulation Speed</label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={animationSpeed}
                onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.1x</span>
                <span className="text-white font-medium">{animationSpeed.toFixed(1)}x</span>
                <span>10x</span>
              </div>
            </div>

            {/* Time Step */}
            <div>
              <label className="block text-xs text-gray-400 mb-1">Time Step</label>
              <select
                value={timeStep}
                onChange={(e) => setTimeStep(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
              >
                <option value={1e-12}>1 ps</option>
                <option value={1e-11}>10 ps</option>
                <option value={1e-10}>100 ps</option>
                <option value={1e-9}>1 ns</option>
                <option value={1e-8}>10 ns</option>
                <option value={1e-7}>100 ns</option>
                <option value={1e-6}>1 µs</option>
                <option value={1e-5}>10 µs</option>
                <option value={1e-4}>100 µs</option>
                <option value={1e-3}>1 ms</option>
              </select>
            </div>
          </div>

          {/* Wave Propagation Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Wave Propagation</label>
            
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">Propagation Speed (fraction of c)</label>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.01"
                value={waveSpeed}
                onChange={(e) => setWaveSpeed(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0.1c</span>
                <span className="text-white font-medium">{waveSpeed.toFixed(2)}c</span>
                <span>1.0c</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={showWavefront}
                  onChange={(e) => useSimulationStore.setState({ showWavefront: e.target.checked })}
                  className="rounded"
                />
                Show Wavefronts
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={phaseDisplay}
                  onChange={(e) => useSimulationStore.setState({ phaseDisplay: e.target.checked })}
                  className="rounded"
                />
                Phase Display
              </label>
            </div>
          </div>

          {/* Oscillating Sources */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Oscillating Sources</label>
              <button
                onClick={handleAddOscillatingCharge}
                className="px-2 py-1 bg-purple-600 hover:bg-purple-700 rounded text-xs text-white font-medium transition-colors"
              >
                Add Oscillating Charge
              </button>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {oscillatingSources.map((source, index) => (
                <div key={source.id} className="bg-gray-800 rounded-lg p-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">
                      Oscillator {index + 1}
                    </span>
                    <span className="text-xs text-gray-400">
                      {((source.frequency || 0) / 1e6).toFixed(1)} MHz
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Frequency (MHz)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="100"
                        value={(source.frequency || 1e6) / 1e6}
                        onChange={(e) => updateSource(source.id, { 
                          frequency: parseFloat(e.target.value) * 1e6 
                        })}
                        className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Phase (°)</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="360"
                        value={((source.phase || 0) * 180 / Math.PI) % 360}
                        onChange={(e) => updateSource(source.id, { 
                          phase: parseFloat(e.target.value) * Math.PI / 180 
                        })}
                        className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {oscillatingSources.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                <p className="text-sm">No oscillating sources</p>
                <p className="text-xs">Add sources to see electromagnetic waves</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}