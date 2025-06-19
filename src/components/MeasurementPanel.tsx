import React, { useState } from 'react';
import { Target, ChevronDown, ChevronRight } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export function MeasurementPanel() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { probePosition, setProbePosition, sources } = useSimulationStore();

  // Calculate field at probe position
  const fieldData = React.useMemo(() => {
    if (sources.length === 0) return null;

    // Simplified field calculation for display
    let Ex = 0, Ey = 0, Ez = 0;
    const k = 8.99e9;

    for (const source of sources) {
      const dx = probePosition[0] - source.position[0];
      const dy = probePosition[1] - source.position[1];
      const dz = probePosition[2] - source.position[2];
      const r = Math.sqrt(dx*dx + dy*dy + dz*dz);

      if (r < 0.1) continue;

      const fieldMag = (k * source.strength) / (r * r);
      Ex += fieldMag * (dx / r);
      Ey += fieldMag * (dy / r);
      Ez += fieldMag * (dz / r);
    }

    const totalMagnitude = Math.sqrt(Ex*Ex + Ey*Ey + Ez*Ez);

    return {
      Ex: Ex.toExponential(2),
      Ey: Ey.toExponential(2),
      Ez: Ez.toExponential(2),
      magnitude: totalMagnitude.toExponential(2)
    };
  }, [probePosition, sources]);

  return (
    <div className="border-b border-gray-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-yellow-400" />
          <span className="font-medium text-white">Field Probe</span>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Probe Position</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">X</label>
                <input
                  type="number"
                  step="0.5"
                  value={probePosition[0]}
                  onChange={(e) => setProbePosition([parseFloat(e.target.value), probePosition[1], probePosition[2]])}
                  className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Y</label>
                <input
                  type="number"
                  step="0.5"
                  value={probePosition[1]}
                  onChange={(e) => setProbePosition([probePosition[0], parseFloat(e.target.value), probePosition[2]])}
                  className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Z</label>
                <input
                  type="number"
                  step="0.5"
                  value={probePosition[2]}
                  onChange={(e) => setProbePosition([probePosition[0], probePosition[1], parseFloat(e.target.value)])}
                  className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Electric Field</label>
            {fieldData ? (
              <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Ex:</span>
                    <span className="text-cyan-400 ml-2 font-mono">{fieldData.Ex}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Ey:</span>
                    <span className="text-cyan-400 ml-2 font-mono">{fieldData.Ey}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Ez:</span>
                    <span className="text-cyan-400 ml-2 font-mono">{fieldData.Ez}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">|E|:</span>
                    <span className="text-cyan-400 ml-2 font-mono">{fieldData.magnitude}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
                  Units: N/C (Newtons per Coulomb)
                </div>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-lg p-3 text-center text-gray-500">
                Add sources to see field measurements
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}