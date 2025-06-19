import React, { useState } from 'react';
import { Save, FolderOpen, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export function SceneControls() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { exportScene, importScene, clearScene } = useSimulationStore();

  const handleExport = () => {
    const sceneData = exportScene();
    const blob = new Blob([JSON.stringify(sceneData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `em-scene-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const sceneData = JSON.parse(e.target?.result as string);
        importScene(sceneData);
      } catch (error) {
        console.error('Failed to import scene:', error);
        alert('Failed to import scene. Please check the file format.');
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
          <Save className="w-5 h-5 text-purple-400" />
          <span className="font-medium text-white">Scene</span>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            Export Scene
          </button>

          <div className="relative">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <button className="w-full flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
              <FolderOpen className="w-4 h-4" />
              Import Scene
            </button>
          </div>

          <button
            onClick={clearScene}
            className="w-full flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear Scene
          </button>

          <div className="bg-gray-800 rounded-lg p-3">
            <h4 className="text-sm font-medium text-white mb-2">Example Scenes</h4>
            <div className="space-y-1">
              <button className="w-full text-left text-sm text-gray-300 hover:text-white py-1">
                Two Point Charges
              </button>
              <button className="w-full text-left text-sm text-gray-300 hover:text-white py-1">
                Electric Dipole
              </button>
              <button className="w-full text-left text-sm text-gray-300 hover:text-white py-1">
                Parallel Plates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}