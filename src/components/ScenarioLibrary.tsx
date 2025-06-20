import React, { useState } from 'react';
import { BookOpen, Download, Upload, ChevronDown, ChevronRight } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

interface ScenarioTemplate {
  id: string;
  name: string;
  description: string;
  category: 'electrostatics' | 'magnetostatics' | 'waves' | 'materials';
  data: any;
}

const SCENARIO_TEMPLATES: ScenarioTemplate[] = [
  {
    id: 'two-charges',
    name: 'Two Point Charges',
    description: 'Classic dipole configuration with positive and negative charges',
    category: 'electrostatics',
    data: {
      sources: [
        { position: [-2, 0, 0], strength: 2, type: 'charge' },
        { position: [2, 0, 0], strength: -2, type: 'charge' }
      ],
      probePosition: [0, 1, 0]
    }
  },
  {
    id: 'parallel-plates',
    name: 'Parallel Plate Capacitor',
    description: 'Uniform electric field between charged plates',
    category: 'electrostatics',
    data: {
      sources: [
        { position: [-3, 0, 0], strength: 5, type: 'charge' },
        { position: [-3, 1, 0], strength: 5, type: 'charge' },
        { position: [-3, -1, 0], strength: 5, type: 'charge' },
        { position: [3, 0, 0], strength: -5, type: 'charge' },
        { position: [3, 1, 0], strength: -5, type: 'charge' },
        { position: [3, -1, 0], strength: -5, type: 'charge' }
      ],
      probePosition: [0, 0, 0]
    }
  },
  {
    id: 'helmholtz-coil',
    name: 'Helmholtz Coil',
    description: 'Two coaxial circular coils producing uniform magnetic field',
    category: 'magnetostatics',
    data: {
      sources: [
        { position: [0, -1.5, 0], type: 'loop', current: 5, radius: 1.5 },
        { position: [0, 1.5, 0], type: 'loop', current: 5, radius: 1.5 }
      ],
      probePosition: [0, 0, 0]
    }
  },
  {
    id: 'solenoid-field',
    name: 'Solenoid Magnetic Field',
    description: 'Long solenoid showing uniform internal field',
    category: 'magnetostatics',
    data: {
      sources: [
        { position: [0, 0, 0], type: 'solenoid', current: 3, radius: 0.8, length: 4, turns: 200 }
      ],
      probePosition: [0, 0, 0]
    }
  },
  {
    id: 'dipole-antenna',
    name: 'Dipole Antenna Radiation',
    description: 'Half-wave dipole antenna radiating electromagnetic waves',
    category: 'waves',
    data: {
      waveSources: [
        { 
          type: 'dipole', 
          position: [0, 0, 0], 
          orientation: [0, 1, 0], 
          frequency: 100e6, 
          amplitude: 2, 
          phase: 0, 
          length: 1.5 
        }
      ],
      probePosition: [3, 0, 0]
    }
  },
  {
    id: 'dielectric-sphere',
    name: 'Dielectric Sphere',
    description: 'Electric field interaction with high-permittivity sphere',
    category: 'materials',
    data: {
      sources: [
        { position: [-4, 0, 0], strength: 3, type: 'charge' }
      ],
      materials: [
        {
          name: 'High-K Dielectric',
          relativePermittivity: 10,
          relativePermeability: 1,
          conductivity: 0,
          geometry: {
            type: 'sphere',
            position: [0, 0, 0],
            dimensions: [1.5, 0, 0]
          }
        }
      ],
      probePosition: [2, 0, 0]
    }
  },
  {
    id: 'ferromagnetic-core',
    name: 'Ferromagnetic Core',
    description: 'Magnetic field concentration in high-permeability material',
    category: 'materials',
    data: {
      sources: [
        { position: [0, 0, 0], type: 'solenoid', current: 2, radius: 0.6, length: 2, turns: 100 }
      ],
      materials: [
        {
          name: 'Iron Core',
          relativePermittivity: 1,
          relativePermeability: 5000,
          conductivity: 0,
          geometry: {
            type: 'cylinder',
            position: [0, 0, 0],
            dimensions: [0.4, 2.2, 0]
          }
        }
      ],
      probePosition: [1, 0, 0]
    }
  }
];

export function ScenarioLibrary() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { importScene, exportScene } = useSimulationStore();

  const filteredScenarios = selectedCategory === 'all' 
    ? SCENARIO_TEMPLATES 
    : SCENARIO_TEMPLATES.filter(s => s.category === selectedCategory);

  const handleLoadScenario = (scenario: ScenarioTemplate) => {
    importScene(scenario.data);
  };

  const handleExportCustom = () => {
    const sceneData = exportScene();
    const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-scenario-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportCustom = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const sceneData = JSON.parse(e.target?.result as string);
        importScene(sceneData);
      } catch (error) {
        console.error('Failed to import scenario:', error);
        alert('Failed to import scenario. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="border-b border-gray-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <span className="font-medium text-white">Scenario Library</span>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg text-white text-sm"
            >
              <option value="all">All Categories</option>
              <option value="electrostatics">Electrostatics</option>
              <option value="magnetostatics">Magnetostatics</option>
              <option value="waves">Electromagnetic Waves</option>
              <option value="materials">Material Interactions</option>
            </select>
          </div>

          {/* Import/Export Controls */}
          <div className="flex gap-2">
            <button
              onClick={handleExportCustom}
              className="flex-1 flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Current
            </button>
            
            <div className="flex-1 relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportCustom}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="w-full flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors">
                <Upload className="w-4 h-4" />
                Import Custom
              </button>
            </div>
          </div>

          {/* Scenario Templates */}
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filteredScenarios.map((scenario) => (
              <div key={scenario.id} className="bg-gray-800 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-sm font-medium text-white">{scenario.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{scenario.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300 capitalize">
                    {scenario.category.replace('statics', '')}
                  </span>
                </div>
                
                <button
                  onClick={() => handleLoadScenario(scenario)}
                  className="w-full px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white text-sm font-medium transition-colors"
                >
                  Load Scenario
                </button>
              </div>
            ))}
          </div>

          {filteredScenarios.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No scenarios in this category</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}