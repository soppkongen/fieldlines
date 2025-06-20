import React, { useState } from 'react';
import { Radio, Plus, Minus, ChevronDown, ChevronRight } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';
import { clsx } from 'clsx';

export function DipoleAntennaControls() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { waveSources, addWaveSource, removeWaveSource, updateWaveSource } = useSimulationStore();

  const handleAddDipole = () => {
    addWaveSource({
      type: 'dipole',
      position: [Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3],
      orientation: [0, 1, 0], // Vertical dipole
      frequency: 100e6, // 100 MHz
      amplitude: 1,
      phase: 0,
      length: 1.5 // Half-wave dipole at 100 MHz
    });
  };

  const handleAddLoop = () => {
    addWaveSource({
      type: 'loop',
      position: [Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3],
      orientation: [0, 0, 1], // Loop in XY plane
      frequency: 100e6,
      amplitude: 1,
      phase: 0,
      length: 0.5 // Loop radius
    });
  };

  return (
    <div className="border-b border-gray-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-pink-400" />
          <span className="font-medium text-white">Wave Sources</span>
          <span className="text-sm text-gray-400">({waveSources.length})</span>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Add Source Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAddDipole}
              className="flex flex-col items-center gap-1 px-2 py-2 bg-pink-600 hover:bg-pink-700 rounded-lg text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3 h-3" />
              Dipole Antenna
            </button>
            <button
              onClick={handleAddLoop}
              className="flex flex-col items-center gap-1 px-2 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3 h-3" />
              Loop Antenna
            </button>
          </div>

          {/* Wave Source List */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {waveSources.map((source, index) => (
              <div key={source.id} className="bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white capitalize">
                    {source.type} {index + 1}
                  </span>
                  <button
                    onClick={() => removeWaveSource(source.id)}
                    className="p-1 hover:bg-gray-700 rounded text-red-400 hover:text-red-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Frequency Control */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Frequency (MHz)</label>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="10000"
                      value={source.frequency / 1e6}
                      onChange={(e) => updateWaveSource(source.id, { 
                        frequency: parseFloat(e.target.value) * 1e6 
                      })}
                      className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      λ = {(299.792458 / (source.frequency / 1e6)).toFixed(2)} m
                    </div>
                  </div>

                  {/* Amplitude Control */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Amplitude</label>
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={source.amplitude}
                      onChange={(e) => updateWaveSource(source.id, { 
                        amplitude: parseFloat(e.target.value) 
                      })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0.1</span>
                      <span className="text-white font-medium">{source.amplitude.toFixed(1)}</span>
                      <span>10</span>
                    </div>
                  </div>

                  {/* Phase Control */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Phase (°)</label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={(source.phase * 180 / Math.PI) % 360}
                      onChange={(e) => updateWaveSource(source.id, { 
                        phase: parseFloat(e.target.value) * Math.PI / 180 
                      })}
                      className="w-full"
                    />
                    <div className="text-center text-xs text-gray-500">
                      {((source.phase * 180 / Math.PI) % 360).toFixed(0)}°
                    </div>
                  </div>

                  {/* Length/Size Control */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      {source.type === 'dipole' ? 'Length (m)' : 'Radius (m)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10"
                      value={source.length || 1}
                      onChange={(e) => updateWaveSource(source.id, { 
                        length: parseFloat(e.target.value) 
                      })}
                      className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                    />
                    {source.type === 'dipole' && (
                      <div className="text-xs text-gray-500 mt-1">
                        {((source.length || 1) / (299.792458 / (source.frequency / 1e6)) * 2).toFixed(2)}λ
                      </div>
                    )}
                  </div>

                  {/* Orientation Controls */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Orientation</label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">X</label>
                        <input
                          type="number"
                          step="0.1"
                          min="-1"
                          max="1"
                          value={source.orientation[0]}
                          onChange={(e) => updateWaveSource(source.id, { 
                            orientation: [
                              parseFloat(e.target.value), 
                              source.orientation[1], 
                              source.orientation[2]
                            ] 
                          })}
                          className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Y</label>
                        <input
                          type="number"
                          step="0.1"
                          min="-1"
                          max="1"
                          value={source.orientation[1]}
                          onChange={(e) => updateWaveSource(source.id, { 
                            orientation: [
                              source.orientation[0], 
                              parseFloat(e.target.value), 
                              source.orientation[2]
                            ] 
                          })}
                          className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Z</label>
                        <input
                          type="number"
                          step="0.1"
                          min="-1"
                          max="1"
                          value={source.orientation[2]}
                          onChange={(e) => updateWaveSource(source.id, { 
                            orientation: [
                              source.orientation[0], 
                              source.orientation[1], 
                              parseFloat(e.target.value)
                            ] 
                          })}
                          className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Position Controls */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">X</label>
                      <input
                        type="number"
                        step="0.5"
                        value={source.position[0]}
                        onChange={(e) => updateWaveSource(source.id, { 
                          position: [
                            parseFloat(e.target.value), 
                            source.position[1], 
                            source.position[2]
                          ] 
                        })}
                        className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Y</label>
                      <input
                        type="number"
                        step="0.5"
                        value={source.position[1]}
                        onChange={(e) => updateWaveSource(source.id, { 
                          position: [
                            source.position[0], 
                            parseFloat(e.target.value), 
                            source.position[2]
                          ] 
                        })}
                        className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Z</label>
                      <input
                        type="number"
                        step="0.5"
                        value={source.position[2]}
                        onChange={(e) => updateWaveSource(source.id, { 
                          position: [
                            source.position[0], 
                            source.position[1], 
                            parseFloat(e.target.value)
                          ] 
                        })}
                        className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Radiation Pattern Info */}
                  <div className="bg-gray-700 rounded p-2 text-xs">
                    <div className="text-gray-300">
                      <div>Power: {(source.amplitude**2 * 377 / 2).toFixed(1)} W/m²</div>
                      <div>Wavelength: {(299.792458 / (source.frequency / 1e6)).toFixed(2)} m</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {waveSources.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No wave sources added yet</p>
              <p className="text-xs">Add antennas to generate electromagnetic waves</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}