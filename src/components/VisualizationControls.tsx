import React, { useState } from 'react';
import { Eye, Activity, ChevronDown, ChevronRight } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export function VisualizationControls() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { 
    visualizationMode, 
    setVisualizationMode,
    fieldType,
    setFieldType,
    animationSpeed, 
    setAnimationSpeed,
    fieldLinesDensity,
    setFieldLinesDensity,
    showFieldComponents,
    activeViews,
    setActiveViews
  } = useSimulationStore();

  return (
    <div className="border-b border-gray-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-green-400" />
          <span className="font-medium text-white">Visualization</span>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Display Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Display Mode</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setVisualizationMode('fieldLines')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  visualizationMode === 'fieldLines'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Field Lines
              </button>
              <button
                onClick={() => setVisualizationMode('vectorField')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  visualizationMode === 'vectorField'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Vector Field
              </button>
              <button
                onClick={() => setVisualizationMode('multiView')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  visualizationMode === 'multiView'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Multi-View
              </button>
              <button
                onClick={() => setVisualizationMode('wavePropagation')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  visualizationMode === 'wavePropagation'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Wave Propagation
              </button>
            </div>
          </div>

          {/* Field Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Field Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setFieldType('electric')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  fieldType === 'electric'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Electric
              </button>
              <button
                onClick={() => setFieldType('magnetic')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  fieldType === 'magnetic'
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Magnetic
              </button>
              <button
                onClick={() => setFieldType('both')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  fieldType === 'both'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Both
              </button>
              <button
                onClick={() => setFieldType('poynting')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  fieldType === 'poynting'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Poynting
              </button>
            </div>
          </div>

          {/* Animation Speed */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Animation Speed</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Slow</span>
              <span className="text-white font-medium">{animationSpeed.toFixed(1)}x</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Field Lines Density */}
          {visualizationMode === 'fieldLines' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Field Lines Density</label>
              <input
                type="range"
                min="2"
                max="20"
                step="1"
                value={fieldLinesDensity}
                onChange={(e) => setFieldLinesDensity(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span className="text-white font-medium">{fieldLinesDensity}</span>
                <span>High</span>
              </div>
            </div>
          )}

          {/* Field Components Toggle */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={showFieldComponents}
                onChange={(e) => useSimulationStore.setState({ showFieldComponents: e.target.checked })}
                className="rounded"
              />
              Show Field Components
            </label>
          </div>

          {/* Color Scheme */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Color Scheme</label>
            <select className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white text-sm">
              <option>Electric Field (Cyan/Blue)</option>
              <option>Magnetic Field (Red/Orange)</option>
              <option>Rainbow Gradient</option>
              <option>Monochrome</option>
              <option>High Contrast</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}