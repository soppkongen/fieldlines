import React, { useState } from 'react';
import { Magnet, Plus, Minus, ChevronDown, ChevronRight } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';
import { clsx } from 'clsx';

export function MagnetostaticControls() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { sources, addSource, removeSource, updateSource } = useSimulationStore();
  
  const magneticSources = sources.filter(s => ['wire', 'loop', 'solenoid'].includes(s.type));

  const handleAddWire = () => {
    addSource({
      position: [Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3],
      strength: 0,
      type: 'wire',
      current: 5,
      direction: [0, 1, 0]
    });
  };

  const handleAddLoop = () => {
    addSource({
      position: [Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3],
      strength: 0,
      type: 'loop',
      current: 3,
      radius: 1
    });
  };

  const handleAddSolenoid = () => {
    addSource({
      position: [Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3],
      strength: 0,
      type: 'solenoid',
      current: 2,
      radius: 0.5,
      length: 2,
      turns: 50
    });
  };

  return (
    <div className="border-b border-gray-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Magnet className="w-5 h-5 text-orange-400" />
          <span className="font-medium text-white">Magnetic Sources</span>
          <span className="text-sm text-gray-400">({magneticSources.length})</span>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Add Source Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleAddWire}
              className="flex flex-col items-center gap-1 px-2 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3 h-3" />
              Wire
            </button>
            <button
              onClick={handleAddLoop}
              className="flex flex-col items-center gap-1 px-2 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3 h-3" />
              Loop
            </button>
            <button
              onClick={handleAddSolenoid}
              className="flex flex-col items-center gap-1 px-2 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3 h-3" />
              Solenoid
            </button>
          </div>

          {/* Source List */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {magneticSources.map((source, index) => (
              <div key={source.id} className="bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white capitalize">
                    {source.type} {index + 1}
                  </span>
                  <button
                    onClick={() => removeSource(source.id)}
                    className="p-1 hover:bg-gray-700 rounded text-red-400 hover:text-red-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Current Control */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Current (A)</label>
                    <input
                      type="range"
                      min="-10"
                      max="10"
                      step="0.1"
                      value={source.current || 0}
                      onChange={(e) => updateSource(source.id, { current: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>-10A</span>
                      <span className={clsx(
                        "font-medium",
                        (source.current || 0) > 0 ? "text-red-400" : "text-blue-400"
                      )}>
                        {(source.current || 0).toFixed(1)}A
                      </span>
                      <span>+10A</span>
                    </div>
                  </div>

                  {/* Type-specific controls */}
                  {source.type === 'loop' && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Radius (m)</label>
                      <input
                        type="range"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value={source.radius || 1}
                        onChange={(e) => updateSource(source.id, { radius: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                      <div className="text-center text-xs text-gray-500">
                        {(source.radius || 1).toFixed(1)}m
                      </div>
                    </div>
                  )}

                  {source.type === 'solenoid' && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Radius (m)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="2"
                            value={source.radius || 0.5}
                            onChange={(e) => updateSource(source.id, { radius: parseFloat(e.target.value) })}
                            className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Length (m)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="5"
                            value={source.length || 2}
                            onChange={(e) => updateSource(source.id, { length: parseFloat(e.target.value) })}
                            className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Turns</label>
                        <input
                          type="range"
                          min="10"
                          max="1000"
                          step="10"
                          value={source.turns || 50}
                          onChange={(e) => updateSource(source.id, { turns: parseInt(e.target.value) })}
                          className="w-full"
                        />
                        <div className="text-center text-xs text-gray-500">
                          {source.turns || 50} turns
                        </div>
                      </div>
                    </>
                  )}

                  {/* Position Controls */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">X</label>
                      <input
                        type="number"
                        step="0.5"
                        value={source.position[0]}
                        onChange={(e) => updateSource(source.id, { 
                          position: [parseFloat(e.target.value), source.position[1], source.position[2]]
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
                        onChange={(e) => updateSource(source.id, { 
                          position: [source.position[0], parseFloat(e.target.value), source.position[2]]
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
                        onChange={(e) => updateSource(source.id, { 
                          position: [source.position[0], source.position[1], parseFloat(e.target.value)]
                        })}
                        className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {magneticSources.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Magnet className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No magnetic sources added yet</p>
              <p className="text-xs">Click buttons above to add current sources</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}