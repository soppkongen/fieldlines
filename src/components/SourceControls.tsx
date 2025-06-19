import React, { useState } from 'react';
import { Plus, Minus, Zap, ChevronDown, ChevronRight } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';
import { clsx } from 'clsx';

export function SourceControls() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { sources, addSource, removeSource, updateSource } = useSimulationStore();

  const handleAddSource = () => {
    addSource({
      position: [Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5],
      strength: 1,
      type: 'charge'
    });
  };

  return (
    <div className="border-b border-gray-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-white">Sources</span>
          <span className="text-sm text-gray-400">({sources.length})</span>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          <button
            onClick={handleAddSource}
            className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Charge
          </button>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sources.map((source, index) => (
              <div key={source.id} className="bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    Charge {index + 1}
                  </span>
                  <button
                    onClick={() => removeSource(source.id)}
                    className="p-1 hover:bg-gray-700 rounded text-red-400 hover:text-red-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Strength</label>
                    <input
                      type="range"
                      min="-5"
                      max="5"
                      step="0.1"
                      value={source.strength}
                      onChange={(e) => updateSource(source.id, { strength: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>-5</span>
                      <span className={clsx(
                        "font-medium",
                        source.strength > 0 ? "text-red-400" : "text-blue-400"
                      )}>
                        {source.strength.toFixed(1)}
                      </span>
                      <span>+5</span>
                    </div>
                  </div>

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

          {sources.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No sources added yet</p>
              <p className="text-xs">Click "Add Charge" to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}