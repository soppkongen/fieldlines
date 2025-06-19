import React, { useState, useMemo } from 'react';
import { Target, ChevronDown, ChevronRight, Download, Activity } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';
import { PhysicsEngine } from '../utils/physics';

export function AdvancedMeasurementPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { 
    probePosition, 
    setProbePosition, 
    sources, 
    currentTime,
    fieldHistory,
    exportFieldData
  } = useSimulationStore();

  // Calculate comprehensive field data at probe position
  const fieldData = useMemo(() => {
    if (sources.length === 0) return null;

    const electricField = PhysicsEngine.calculateElectricField(probePosition, sources, currentTime);
    const magneticField = PhysicsEngine.calculateMagneticField(probePosition, sources, currentTime);
    const poyntingVector = PhysicsEngine.calculatePoyntingVector(electricField, magneticField);

    return {
      electric: {
        x: electricField[0],
        y: electricField[1],
        z: electricField[2],
        magnitude: Math.sqrt(electricField[0]**2 + electricField[1]**2 + electricField[2]**2)
      },
      magnetic: {
        x: magneticField[0] * 1e6, // Convert to µT
        y: magneticField[1] * 1e6,
        z: magneticField[2] * 1e6,
        magnitude: Math.sqrt(magneticField[0]**2 + magneticField[1]**2 + magneticField[2]**2) * 1e6
      },
      poynting: {
        x: poyntingVector[0],
        y: poyntingVector[1],
        z: poyntingVector[2],
        magnitude: Math.sqrt(poyntingVector[0]**2 + poyntingVector[1]**2 + poyntingVector[2]**2)
      }
    };
  }, [probePosition, sources, currentTime]);

  const formatScientific = (value: number, precision: number = 2) => {
    if (Math.abs(value) < 1e-15) return '0.00';
    return value.toExponential(precision);
  };

  return (
    <div className="border-b border-gray-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-yellow-400" />
          <span className="font-medium text-white">Advanced Field Probe</span>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Probe Position Controls */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Probe Position (m)</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">X</label>
                <input
                  type="number"
                  step="0.1"
                  value={probePosition[0]}
                  onChange={(e) => setProbePosition([parseFloat(e.target.value), probePosition[1], probePosition[2]])}
                  className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Y</label>
                <input
                  type="number"
                  step="0.1"
                  value={probePosition[1]}
                  onChange={(e) => setProbePosition([probePosition[0], parseFloat(e.target.value), probePosition[2]])}
                  className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Z</label>
                <input
                  type="number"
                  step="0.1"
                  value={probePosition[2]}
                  onChange={(e) => setProbePosition([probePosition[0], probePosition[1], parseFloat(e.target.value)])}
                  className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                />
              </div>
            </div>
          </div>

          {/* Field Measurements */}
          {fieldData ? (
            <div className="space-y-3">
              {/* Electric Field */}
              <div>
                <label className="block text-sm font-medium text-cyan-400 mb-2">Electric Field (V/m)</label>
                <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Ex:</span>
                      <span className="text-cyan-400 ml-2 font-mono">{formatScientific(fieldData.electric.x)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Ey:</span>
                      <span className="text-cyan-400 ml-2 font-mono">{formatScientific(fieldData.electric.y)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Ez:</span>
                      <span className="text-cyan-400 ml-2 font-mono">{formatScientific(fieldData.electric.z)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">|E|:</span>
                      <span className="text-cyan-400 ml-2 font-mono font-bold">{formatScientific(fieldData.electric.magnitude)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Magnetic Field */}
              <div>
                <label className="block text-sm font-medium text-orange-400 mb-2">Magnetic Field (µT)</label>
                <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Bx:</span>
                      <span className="text-orange-400 ml-2 font-mono">{formatScientific(fieldData.magnetic.x)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">By:</span>
                      <span className="text-orange-400 ml-2 font-mono">{formatScientific(fieldData.magnetic.y)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Bz:</span>
                      <span className="text-orange-400 ml-2 font-mono">{formatScientific(fieldData.magnetic.z)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">|B|:</span>
                      <span className="text-orange-400 ml-2 font-mono font-bold">{formatScientific(fieldData.magnetic.magnitude)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Poynting Vector */}
              <div>
                <label className="block text-sm font-medium text-green-400 mb-2">Poynting Vector (W/m²)</label>
                <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Sx:</span>
                      <span className="text-green-400 ml-2 font-mono">{formatScientific(fieldData.poynting.x)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Sy:</span>
                      <span className="text-green-400 ml-2 font-mono">{formatScientific(fieldData.poynting.y)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Sz:</span>
                      <span className="text-green-400 ml-2 font-mono">{formatScientific(fieldData.poynting.z)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">|S|:</span>
                      <span className="text-green-400 ml-2 font-mono font-bold">{formatScientific(fieldData.poynting.magnitude)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Information */}
              <div className="bg-gray-800 rounded-lg p-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Time:</span>
                  <span className="text-white font-mono">{formatScientific(currentTime)} s</span>
                </div>
                <div className="flex justify-between items-center text-sm mt-1">
                  <span className="text-gray-400">Data Points:</span>
                  <span className="text-white">{fieldHistory.length}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-3 text-center text-gray-500">
              Add sources to see field measurements
            </div>
          )}

          {/* Export Controls */}
          <div className="flex gap-2">
            <button
              onClick={exportFieldData}
              disabled={fieldHistory.length === 0}
              className="flex-1 flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors">
              <Activity className="w-4 h-4" />
              Plot
            </button>
          </div>
        </div>
      )}
    </div>
  );
}