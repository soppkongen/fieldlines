import React, { useState } from 'react';
import { Layers, Plus, Minus, ChevronDown, ChevronRight } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';
import { clsx } from 'clsx';

export function MaterialControls() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { materials, addMaterial, removeMaterial, updateMaterial } = useSimulationStore();

  const handleAddMaterial = (type: 'dielectric' | 'magnetic' | 'conductor') => {
    const materialPresets = {
      dielectric: {
        name: 'Dielectric',
        relativePermittivity: 4.0,
        relativePermeability: 1.0,
        conductivity: 0
      },
      magnetic: {
        name: 'Ferromagnetic',
        relativePermittivity: 1.0,
        relativePermeability: 1000,
        conductivity: 0
      },
      conductor: {
        name: 'Conductor',
        relativePermittivity: 1.0,
        relativePermeability: 1.0,
        conductivity: 5.8e7 // Copper
      }
    };

    const preset = materialPresets[type];
    addMaterial({
      name: preset.name,
      relativePermittivity: preset.relativePermittivity,
      relativePermeability: preset.relativePermeability,
      conductivity: preset.conductivity,
      geometry: {
        type: 'sphere',
        position: [Math.random() * 6 - 3, Math.random() * 6 - 3, Math.random() * 6 - 3],
        dimensions: [1, 1, 1]
      }
    });
  };

  return (
    <div className="border-b border-gray-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          <span className="font-medium text-white">Materials</span>
          <span className="text-sm text-gray-400">({materials.length})</span>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Add Material Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleAddMaterial('dielectric')}
              className="flex flex-col items-center gap-1 px-2 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3 h-3" />
              Dielectric
            </button>
            <button
              onClick={() => handleAddMaterial('magnetic')}
              className="flex flex-col items-center gap-1 px-2 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3 h-3" />
              Magnetic
            </button>
            <button
              onClick={() => handleAddMaterial('conductor')}
              className="flex flex-col items-center gap-1 px-2 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white text-xs font-medium transition-colors"
            >
              <Plus className="w-3 h-3" />
              Conductor
            </button>
          </div>

          {/* Material List */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {materials.map((material, index) => (
              <div key={material.id} className="bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">
                    {material.name} {index + 1}
                  </span>
                  <button
                    onClick={() => removeMaterial(material.id)}
                    className="p-1 hover:bg-gray-700 rounded text-red-400 hover:text-red-300"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {/* Material Properties */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">εᵣ (Permittivity)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="1000"
                        value={material.relativePermittivity}
                        onChange={(e) => updateMaterial(material.id, { 
                          relativePermittivity: parseFloat(e.target.value) 
                        })}
                        className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">μᵣ (Permeability)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        max="10000"
                        value={material.relativePermeability}
                        onChange={(e) => updateMaterial(material.id, { 
                          relativePermeability: parseFloat(e.target.value) 
                        })}
                        className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Conductivity */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Conductivity (S/m)</label>
                    <input
                      type="number"
                      step="1e6"
                      min="0"
                      value={material.conductivity}
                      onChange={(e) => updateMaterial(material.id, { 
                        conductivity: parseFloat(e.target.value) 
                      })}
                      className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                    />
                  </div>

                  {/* Geometry Type */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Shape</label>
                    <select
                      value={material.geometry.type}
                      onChange={(e) => updateMaterial(material.id, { 
                        geometry: { 
                          ...material.geometry, 
                          type: e.target.value as 'sphere' | 'box' | 'cylinder' 
                        } 
                      })}
                      className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                    >
                      <option value="sphere">Sphere</option>
                      <option value="box">Box</option>
                      <option value="cylinder">Cylinder</option>
                    </select>
                  </div>

                  {/* Dimensions */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">
                      {material.geometry.type === 'sphere' ? 'Radius' : 
                       material.geometry.type === 'box' ? 'Width × Height × Depth' : 
                       'Radius × Height'}
                    </label>
                    <div className={clsx(
                      "grid gap-2",
                      material.geometry.type === 'sphere' ? 'grid-cols-1' : 
                      material.geometry.type === 'cylinder' ? 'grid-cols-2' : 'grid-cols-3'
                    )}>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={material.geometry.dimensions[0]}
                        onChange={(e) => updateMaterial(material.id, { 
                          geometry: { 
                            ...material.geometry, 
                            dimensions: [
                              parseFloat(e.target.value), 
                              material.geometry.dimensions[1], 
                              material.geometry.dimensions[2]
                            ] 
                          } 
                        })}
                        className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                      />
                      {material.geometry.type !== 'sphere' && (
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={material.geometry.dimensions[1]}
                          onChange={(e) => updateMaterial(material.id, { 
                            geometry: { 
                              ...material.geometry, 
                              dimensions: [
                                material.geometry.dimensions[0], 
                                parseFloat(e.target.value), 
                                material.geometry.dimensions[2]
                              ] 
                            } 
                          })}
                          className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                        />
                      )}
                      {material.geometry.type === 'box' && (
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={material.geometry.dimensions[2]}
                          onChange={(e) => updateMaterial(material.id, { 
                            geometry: { 
                              ...material.geometry, 
                              dimensions: [
                                material.geometry.dimensions[0], 
                                material.geometry.dimensions[1], 
                                parseFloat(e.target.value)
                              ] 
                            } 
                          })}
                          className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                        />
                      )}
                    </div>
                  </div>

                  {/* Position Controls */}
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">X</label>
                      <input
                        type="number"
                        step="0.5"
                        value={material.geometry.position[0]}
                        onChange={(e) => updateMaterial(material.id, { 
                          geometry: { 
                            ...material.geometry, 
                            position: [
                              parseFloat(e.target.value), 
                              material.geometry.position[1], 
                              material.geometry.position[2]
                            ] 
                          } 
                        })}
                        className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Y</label>
                      <input
                        type="number"
                        step="0.5"
                        value={material.geometry.position[1]}
                        onChange={(e) => updateMaterial(material.id, { 
                          geometry: { 
                            ...material.geometry, 
                            position: [
                              material.geometry.position[0], 
                              parseFloat(e.target.value), 
                              material.geometry.position[2]
                            ] 
                          } 
                        })}
                        className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Z</label>
                      <input
                        type="number"
                        step="0.5"
                        value={material.geometry.position[2]}
                        onChange={(e) => updateMaterial(material.id, { 
                          geometry: { 
                            ...material.geometry, 
                            position: [
                              material.geometry.position[0], 
                              material.geometry.position[1], 
                              parseFloat(e.target.value)
                            ] 
                          } 
                        })}
                        className="w-full px-2 py-1 bg-gray-700 rounded text-xs text-white"
                      />
                    </div>
                  </div>

                  {/* Material Info */}
                  <div className="bg-gray-700 rounded p-2 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-gray-300">
                      <div>Wave Speed: {(299792458 / Math.sqrt(material.relativePermittivity * material.relativePermeability) / 1e6).toFixed(1)} Mm/s</div>
                      <div>Impedance: {(377 * Math.sqrt(material.relativePermeability / material.relativePermittivity)).toFixed(0)} Ω</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {materials.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No materials added yet</p>
              <p className="text-xs">Add materials to see field interactions</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}