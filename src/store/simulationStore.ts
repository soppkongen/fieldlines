import { create } from 'zustand';
import { MaterialProperties, WaveSource } from '../utils/maxwellEngine';

interface Source {
  id: string;
  position: [number, number, number];
  strength: number;
  type: 'charge' | 'dipole' | 'current' | 'wire' | 'loop' | 'solenoid';
  // Additional properties for magnetic sources
  current?: number; // Amperes
  radius?: number; // meters (for loops)
  length?: number; // meters (for solenoids)
  turns?: number; // number of turns (for solenoids)
  direction?: [number, number, number]; // current direction
  frequency?: number; // Hz (for oscillating sources)
  phase?: number; // radians
}

interface FieldData {
  electric: [number, number, number];
  magnetic: [number, number, number];
  poynting: [number, number, number];
  timestamp: number;
}

interface SimulationStore {
  // Simulation state
  isRunning: boolean;
  sources: Source[];
  waveSources: WaveSource[];
  materials: MaterialProperties[];
  probePosition: [number, number, number];
  currentTime: number;
  
  // Visualization settings
  visualizationMode: 'fieldLines' | 'vectorField' | 'multiView' | 'wavePropagation' | 'poyntingField';
  fieldType: 'electric' | 'magnetic' | 'both' | 'poynting';
  animationSpeed: number;
  fieldLinesDensity: number;
  timeStep: number; // seconds
  
  // Magnetostatic settings
  magneticFieldResolution: number;
  showFieldComponents: boolean;
  
  // Electrodynamic settings
  waveSpeed: number; // fraction of c
  showWavefront: boolean;
  phaseDisplay: boolean;
  
  // Maxwell engine settings
  enableInduction: boolean;
  showPoyntingVectors: boolean;
  showEnergyDensity: boolean;
  
  // Multi-view settings
  activeViews: string[];
  
  // Field probe data
  fieldHistory: FieldData[];
  
  // Actions
  toggleSimulation: () => void;
  resetSimulation: () => void;
  stepSimulation: () => void;
  addSource: (source: Omit<Source, 'id'>) => void;
  removeSource: (id: string) => void;
  updateSource: (id: string, updates: Partial<Source>) => void;
  addWaveSource: (source: Omit<WaveSource, 'id'>) => void;
  removeWaveSource: (id: string) => void;
  updateWaveSource: (id: string, updates: Partial<WaveSource>) => void;
  addMaterial: (material: Omit<MaterialProperties, 'id'>) => void;
  removeMaterial: (id: string) => void;
  updateMaterial: (id: string, updates: Partial<MaterialProperties>) => void;
  setProbePosition: (position: [number, number, number]) => void;
  setVisualizationMode: (mode: 'fieldLines' | 'vectorField' | 'multiView' | 'wavePropagation' | 'poyntingField') => void;
  setFieldType: (type: 'electric' | 'magnetic' | 'both' | 'poynting') => void;
  setAnimationSpeed: (speed: number) => void;
  setFieldLinesDensity: (density: number) => void;
  setTimeStep: (step: number) => void;
  setWaveSpeed: (speed: number) => void;
  setActiveViews: (views: string[]) => void;
  exportScene: () => object;
  importScene: (data: any) => void;
  clearScene: () => void;
  exportFieldData: () => void;
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
  waveSources: [],
  materials: [],
  probePosition: [0, 2, 0],
  currentTime: 0,
  visualizationMode: 'fieldLines',
  fieldType: 'electric',
  animationSpeed: 1,
  fieldLinesDensity: 8,
  timeStep: 1e-9, // 1 nanosecond
  magneticFieldResolution: 0.001, // 1mm
  showFieldComponents: true,
  waveSpeed: 1.0, // speed of light
  showWavefront: true,
  phaseDisplay: false,
  enableInduction: true,
  showPoyntingVectors: false,
  showEnergyDensity: false,
  activeViews: ['3d'],
  fieldHistory: [],

  // Actions
  toggleSimulation: () => set((state) => ({ isRunning: !state.isRunning })),
  
  stepSimulation: () => set((state) => ({ 
    currentTime: state.currentTime + state.timeStep,
    fieldHistory: [...state.fieldHistory.slice(-1000)] // Keep last 1000 points
  })),
  
  resetSimulation: () => set({
    isRunning: false,
    currentTime: 0,
    fieldHistory: [],
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
    waveSources: [],
    materials: [],
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

  addWaveSource: (source) => set((state) => ({
    waveSources: [...state.waveSources, { ...source, id: crypto.randomUUID() }]
  })),

  removeWaveSource: (id) => set((state) => ({
    waveSources: state.waveSources.filter(source => source.id !== id)
  })),

  updateWaveSource: (id, updates) => set((state) => ({
    waveSources: state.waveSources.map(source => 
      source.id === id ? { ...source, ...updates } : source
    )
  })),

  addMaterial: (material) => set((state) => ({
    materials: [...state.materials, { ...material, id: crypto.randomUUID() }]
  })),

  removeMaterial: (id) => set((state) => ({
    materials: state.materials.filter(material => material.id !== id)
  })),

  updateMaterial: (id, updates) => set((state) => ({
    materials: state.materials.map(material => 
      material.id === id ? { ...material, ...updates } : material
    )
  })),

  setProbePosition: (position) => set({ probePosition: position }),
  setVisualizationMode: (mode) => set({ visualizationMode: mode }),
  setFieldType: (type) => set({ fieldType: type }),
  setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
  setFieldLinesDensity: (density) => set({ fieldLinesDensity: density }),
  setTimeStep: (step) => set({ timeStep: step }),
  setWaveSpeed: (speed) => set({ waveSpeed: speed }),
  setActiveViews: (views) => set({ activeViews: views }),

  exportScene: () => {
    const state = get();
    return {
      version: '3.0.0',
      timestamp: new Date().toISOString(),
      sources: state.sources,
      waveSources: state.waveSources,
      materials: state.materials,
      probePosition: state.probePosition,
      visualizationSettings: {
        mode: state.visualizationMode,
        fieldType: state.fieldType,
        animationSpeed: state.animationSpeed,
        fieldLinesDensity: state.fieldLinesDensity,
        timeStep: state.timeStep,
        waveSpeed: state.waveSpeed,
        enableInduction: state.enableInduction,
        showPoyntingVectors: state.showPoyntingVectors,
        showEnergyDensity: state.showEnergyDensity
      },
      fieldHistory: state.fieldHistory
    };
  },

  importScene: (data) => {
    if (data.sources && Array.isArray(data.sources)) {
      set({
        sources: data.sources,
        waveSources: data.waveSources || [],
        materials: data.materials || [],
        probePosition: data.probePosition || [0, 2, 0],
        visualizationMode: data.visualizationSettings?.mode || 'fieldLines',
        fieldType: data.visualizationSettings?.fieldType || 'electric',
        animationSpeed: data.visualizationSettings?.animationSpeed || 1,
        fieldLinesDensity: data.visualizationSettings?.fieldLinesDensity || 8,
        timeStep: data.visualizationSettings?.timeStep || 1e-9,
        waveSpeed: data.visualizationSettings?.waveSpeed || 1.0,
        enableInduction: data.visualizationSettings?.enableInduction ?? true,
        showPoyntingVectors: data.visualizationSettings?.showPoyntingVectors ?? false,
        showEnergyDensity: data.visualizationSettings?.showEnergyDensity ?? false,
        fieldHistory: data.fieldHistory || []
      });
    }
  },

  clearScene: () => set({
    sources: [],
    waveSources: [],
    materials: [],
    probePosition: [0, 2, 0],
    isRunning: false,
    currentTime: 0,
    fieldHistory: []
  }),

  exportFieldData: () => {
    const state = get();
    const csvData = state.fieldHistory.map(data => ({
      timestamp: data.timestamp,
      Ex: data.electric[0],
      Ey: data.electric[1],
      Ez: data.electric[2],
      Bx: data.magnetic[0],
      By: data.magnetic[1],
      Bz: data.magnetic[2],
      Sx: data.poynting[0],
      Sy: data.poynting[1],
      Sz: data.poynting[2]
    }));
    
    const csv = [
      'timestamp,Ex,Ey,Ez,Bx,By,Bz,Sx,Sy,Sz',
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `field-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}));