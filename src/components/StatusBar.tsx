import React from 'react';
import { Activity, Cpu, Clock } from 'lucide-react';
import { useSimulationStore } from '../store/simulationStore';

export function StatusBar() {
  const { isRunning, sources } = useSimulationStore();
  const [fps, setFps] = React.useState(60);
  const [performance, setPerformance] = React.useState(95);

  React.useEffect(() => {
    const interval = setInterval(() => {
      // Simulate performance metrics
      setFps(58 + Math.random() * 4);
      setPerformance(90 + Math.random() * 10);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-gray-900 border-t border-gray-800 px-6 py-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-gray-400">
              Status: {isRunning ? 'Running' : 'Paused'}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-400">
            <Activity className="w-4 h-4" />
            <span>Sources: {sources.length}</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="w-4 h-4" />
            <span>FPS: {fps.toFixed(0)}</span>
          </div>
          
          <div className="flex items-center gap-2 text-gray-400">
            <Cpu className="w-4 h-4" />
            <span>GPU: {performance.toFixed(0)}%</span>
          </div>
          
          <div className="text-gray-500">
            EM-Vis Pro v1.0.0
          </div>
        </div>
      </div>
    </footer>
  );
}