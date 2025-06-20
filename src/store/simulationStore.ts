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

// Helper function to ensure valid source data
const validateSource = (source: any): Source => {
  return {
    id: source.id || crypto.randomUUID(),
    position: Array.isArray(source.position) && source.position.length === 3 
      ? source.position as [number, number, number]
      : [0, 0, 0],
    strength: typeof source.strength === 'number' ? source.strength : 1,
    type: ['charge', 'dipole', 'current', 'wire', 'loop', 'solenoid'].includes(source.type) 
      ? source.type 
      : 'charge',
    current: typeof source.current === 'number' ? source.current : undefined,
    radius: typeof source.radius === 'number' ? source.radius : undefined,
    length: typeof source.length === 'number' ? source.length : undefined,
    turns: typeof source.turns === 'number' ? source.turns : undefined,
    direction: Array.isArray(source.direction) && source.direction.length === 3 
      ? source.direction as [number, number, number]
      : undefined,
    frequency: typeof source.frequency === 'number' ? source.frequency : undefined,
    phase: typeof source.phase === 'number' ? source.phase : undefined
  };
};

// Helper function to ensure valid wave source data
const validateWaveSource = (source: any): WaveSource => {
  return {
    id: source.id || crypto.randomUUID(),
    type: ['dipole', 'monopole', 'loop'].includes(source.type) ? source.type : 'dipole',
    position: Array.isArray(source.position) && source.position.length === 3 
      ? source.position as [number, number, number]
      : [0, 0, 0],
    orientation: Array.isArray(source.orientation) && source.orientation.length === 3 
      ? source.orientation as [number, number, number]
      : [0, 1, 0],
    frequency: typeof source.frequency === 'number' ? source.frequency : 100e6,
    amplitude: typeof source.amplitude === 'number' ? source.amplitude : 1,
    phase: typeof source.phase === 'number' ? source.phase : 0,
    length: typeof source.length === 'number' ? source.length : undefined
  };
};

// Helper function to ensure valid material data
const validateMaterial = (material: any): MaterialProperties => {
  return {
    id: material.id || crypto.randomUUID(),
    name: typeof material.name === 'string' ? material.name : 'Material',
    relativePermittivity: typeof material.relativePermittivity === 'number' 
      ? material.relativePermittivity : 1,
    relativePermeability: typeof material.relativePermeability === 'number' 
      ? material.relativePermeability : 1,
    conductivity: typeof material.conductivity === 'number' ? material.conductivity : 0,
    geometry: {
      type: ['sphere', 'box', 'cylinder'].includes(material.geometry?.type) 
        ? material.geometry.type : 'sphere',
      position: Array.isArray(material.geometry?.position) && material.geometry.position.length === 3 
        ? material.geometry.position as [number, number, number]
        : [0, 0, 0],
      dimensions: Array.isArray(material.geometry?.dimensions) && material.geometry.dimensions.length === 3 
        ? material.geometry.dimensions as [number, number, number]
        : [1, 1, 1]
    }
  };
};

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
    try {
      // Stop simulation first
      set({ isRunning: false });

      // Validate and import sources
      const validatedSources = Array.isArray(data.sources) 
        ? data.sources.map(validateSource)
        : [];

      // Validate and import wave sources
      const validatedWaveSources = Array.isArray(data.waveSources) 
        ? data.waveSources.map(validateWaveSource)
        : [];

      // Validate and import materials
      const validatedMaterials = Array.isArray(data.materials) 
        ? data.materials.map(validateMaterial)
        : [];

      // Validate probe position
      const validatedProbePosition = Array.isArray(data.probePosition) && data.probePosition.length === 3
        ? data.probePosition as [number, number, number]
        : [0, 2, 0];

      // Update state with validated data
      set({
        sources: validatedSources,
        waveSources: validatedWaveSources,
        materials: validatedMaterials,
        probePosition: validatedProbePosition,
        visualizationMode: data.visualizationSettings?.mode || 'fieldLines',
        fieldType: data.visualizationSettings?.fieldType || 'electric',
        animationSpeed: typeof data.visualizationSettings?.animationSpeed === 'number' 
          ? data.visualizationSettings.animationSpeed : 1,
        fieldLinesDensity: typeof data.visualizationSettings?.fieldLinesDensity === 'number' 
          ? data.visualizationSettings.fieldLinesDensity : 8,
        timeStep: typeof data.visualizationSettings?.timeStep === 'number' 
          ? data.visualizationSettings.timeStep : 1e-9,
        waveSpeed: typeof data.visualizationSettings?.waveSpeed === 'number' 
          ? data.visualizationSettings.waveSpeed : 1.0,
        enableInduction: data.visualizationSettings?.enableInduction ?? true,
        showPoyntingVectors: data.visualizationSettings?.showPoyntingVectors ?? false,
        showEnergyDensity: data.visualizationSettings?.showEnergyDensity ?? false,
        fieldHistory: [],
        currentTime: 0
      });

      console.log('Scene imported successfully:', {
        sources: validatedSources.length,
        waveSources: validatedWaveSources.length,
        materials: validatedMaterials.length
      });

    } catch (error) {
      console.error('Failed to import scene:', error);
      // Reset to default state on error
      set({
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
        isRunning: false,
        currentTime: 0,
        fieldHistory: []
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
    if (state.fieldHistory.length === 0) {
      console.warn('No field data to export');
      return;
    }

    try {
      const csvData = state.fieldHistory.map(data => ({
        timestamp: data.timestamp || 0,
        Ex: data.electric?.[0] || 0,
        Ey: data.electric?.[1] || 0,
        Ez: data.electric?.[2] || 0,
        Bx: data.magnetic?.[0] || 0,
        By: data.magnetic?.[1] || 0,
        Bz: data.magnetic?.[2] || 0,
        Sx: data.poynting?.[0] || 0,
        Sy: data.poynting?.[1] || 0,
        Sz: data.poynting?.[2] || 0
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
    } catch (error) {
      console.error('Failed to export field data:', error);
    }
  }
}));