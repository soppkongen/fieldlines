import { create } from 'zustand';

interface Source {
  id: string;
  position: [number, number, number];
  strength: number;
  type: 'charge' | 'dipole' | 'current';
}

interface SimulationStore {
  // Simulation state
  isRunning: boolean;
  sources: Source[];
  probePosition: [number, number, number];
  
  // Visualization settings
  visualizationMode: 'fieldLines' | 'vectorField';
  animationSpeed: number;
  fieldLinesDensity: number;
  
  // Actions
  toggleSimulation: () => void;
  resetSimulation: () => void;
  addSource: (source: Omit<Source, 'id'>) => void;
  removeSource: (id: string) => void;
  updateSource: (id: string, updates: Partial<Source>) => void;
  setProbePosition: (position: [number, number, number]) => void;
  setVisualizationMode: (mode: 'fieldLines' | 'vectorField') => void;
  setAnimationSpeed: (speed: number) => void;
  setFieldLinesDensity: (density: number) => void;
  exportScene: () => object;
  importScene: (data: any) => void;
  clearScene: () => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial state
  isRunning: false,
  sources: [
    {
      id: 'default-1',
      position: [-3, 0, 0],
      strength: 2,
      type: 'charge'
    },
    {
      id: 'default-2',
      position: [3, 0, 0],
      strength: -2,
      type: 'charge'
    }
  ],
  probePosition: [0, 2, 0],
  visualizationMode: 'fieldLines',
  animationSpeed: 1,
  fieldLinesDensity: 8,

  // Actions
  toggleSimulation: () => set((state) => ({ isRunning: !state.isRunning })),
  
  resetSimulation: () => set({
    isRunning: false,
    sources: [
      {
        id: 'default-1',
        position: [-3, 0, 0],
        strength: 2,
        type: 'charge'
      },
      {
        id: 'default-2',
        position: [3, 0, 0],
        strength: -2,
        type: 'charge'
      }
    ],
    probePosition: [0, 2, 0]
  }),

  addSource: (source) => set((state) => ({
    sources: [...state.sources, { ...source, id: crypto.randomUUID() }]
  })),

  removeSource: (id) => set((state) => ({
    sources: state.sources.filter(source => source.id !== id)
  })),

  updateSource: (id, updates) => set((state) => ({
    sources: state.sources.map(source => 
      source.id === id ? { ...source, ...updates } : source
    )
  })),

  setProbePosition: (position) => set({ probePosition: position }),
  
  setVisualizationMode: (mode) => set({ visualizationMode: mode }),
  
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  
  setFieldLinesDensity: (density) => set({ fieldLinesDensity: density }),

  exportScene: () => {
    const state = get();
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      sources: state.sources,
      probePosition: state.probePosition,
      visualizationSettings: {
        mode: state.visualizationMode,
        animationSpeed: state.animationSpeed,
        fieldLinesDensity: state.fieldLinesDensity
      }
    };
  },

  importScene: (data) => {
    if (data.sources && Array.isArray(data.sources)) {
      set({
        sources: data.sources,
        probePosition: data.probePosition || [0, 2, 0],
        visualizationMode: data.visualizationSettings?.mode || 'fieldLines',
        animationSpeed: data.visualizationSettings?.animationSpeed || 1,
        fieldLinesDensity: data.visualizationSettings?.fieldLinesDensity || 8
      });
    }
  },

  clearScene: () => set({
    sources: [],
    probePosition: [0, 2, 0],
    isRunning: false
  })
}));