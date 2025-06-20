import { Vector3 } from 'three';

export interface MaterialProperties {
  id: string;
  name: string;
  relativePermittivity: number; // εᵣ
  relativePermeability: number; // μᵣ
  conductivity: number; // σ (S/m)
  geometry: {
    type: 'sphere' | 'box' | 'cylinder';
    position: [number, number, number];
    dimensions: [number, number, number]; // [radius/width, height, depth]
  };
}

export interface WaveSource {
  id: string;
  type: 'dipole' | 'monopole' | 'loop';
  position: [number, number, number];
  orientation: [number, number, number];
  frequency: number; // Hz
  amplitude: number;
  phase: number; // radians
  length?: number; // for dipole antennas
}

export class MaxwellEngine {
  private static readonly EPSILON_0 = 8.854e-12; // F/m
  private static readonly MU_0 = 4 * Math.PI * 1e-7; // H/m
  private static readonly C = 299792458; // m/s
  private static readonly ETA_0 = 376.73; // Ω (impedance of free space)

  /**
   * Calculate induced electric field from time-varying magnetic field (Faraday's Law)
   * ∇ × E = -∂B/∂t
   */
  static calculateInducedElectricField(
    position: [number, number, number],
    magneticFieldHistory: Array<{ field: [number, number, number]; time: number }>,
    deltaTime: number
  ): [number, number, number] {
    if (magneticFieldHistory.length < 2) return [0, 0, 0];

    const current = magneticFieldHistory[magneticFieldHistory.length - 1];
    const previous = magneticFieldHistory[magneticFieldHistory.length - 2];

    // Calculate ∂B/∂t
    const dBdt: [number, number, number] = [
      (current.field[0] - previous.field[0]) / deltaTime,
      (current.field[1] - previous.field[1]) / deltaTime,
      (current.field[2] - previous.field[2]) / deltaTime
    ];

    // For a simplified curl calculation, we approximate the induced E-field
    // In a full implementation, this would require spatial derivatives
    const inducedE: [number, number, number] = [
      -dBdt[0] * 0.1, // Simplified coupling coefficient
      -dBdt[1] * 0.1,
      -dBdt[2] * 0.1
    ];

    return inducedE;
  }

  /**
   * Calculate induced magnetic field from time-varying electric field (Ampère-Maxwell Law)
   * ∇ × B = μ₀ε₀ ∂E/∂t + μ₀J
   */
  static calculateInducedMagneticField(
    position: [number, number, number],
    electricFieldHistory: Array<{ field: [number, number, number]; time: number }>,
    deltaTime: number,
    materials: MaterialProperties[]
  ): [number, number, number] {
    if (electricFieldHistory.length < 2) return [0, 0, 0];

    const current = electricFieldHistory[electricFieldHistory.length - 1];
    const previous = electricFieldHistory[electricFieldHistory.length - 2];

    // Get material properties at this position
    const material = this.getMaterialAtPosition(position, materials);
    const epsilon = this.EPSILON_0 * material.relativePermittivity;
    const mu = this.MU_0 * material.relativePermeability;

    // Calculate ∂E/∂t
    const dEdt: [number, number, number] = [
      (current.field[0] - previous.field[0]) / deltaTime,
      (current.field[1] - previous.field[1]) / deltaTime,
      (current.field[2] - previous.field[2]) / deltaTime
    ];

    // Displacement current contribution: μ₀ε₀ ∂E/∂t
    const displacementCurrent: [number, number, number] = [
      mu * epsilon * dEdt[0],
      mu * epsilon * dEdt[1],
      mu * epsilon * dEdt[2]
    ];

    // Simplified curl calculation for induced B-field
    const inducedB: [number, number, number] = [
      displacementCurrent[0] * 0.1,
      displacementCurrent[1] * 0.1,
      displacementCurrent[2] * 0.1
    ];

    return inducedB;
  }

  /**
   * Calculate Poynting vector S = (1/μ₀) E × B
   */
  static calculatePoyntingVector(
    electricField: [number, number, number],
    magneticField: [number, number, number],
    materials: MaterialProperties[],
    position: [number, number, number]
  ): [number, number, number] {
    const material = this.getMaterialAtPosition(position, materials);
    const mu = this.MU_0 * material.relativePermeability;

    // Cross product E × B
    const crossProduct: [number, number, number] = [
      electricField[1] * magneticField[2] - electricField[2] * magneticField[1],
      electricField[2] * magneticField[0] - electricField[0] * magneticField[2],
      electricField[0] * magneticField[1] - electricField[1] * magneticField[0]
    ];

    const factor = 1 / mu;
    return [
      factor * crossProduct[0],
      factor * crossProduct[1],
      factor * crossProduct[2]
    ];
  }

  /**
   * Calculate electromagnetic wave propagation from dipole antenna
   */
  static calculateDipoleRadiation(
    position: [number, number, number],
    dipole: WaveSource,
    time: number
  ): { electric: [number, number, number]; magnetic: [number, number, number] } {
    const dipolePos = dipole.position;
    const r = [
      position[0] - dipolePos[0],
      position[1] - dipolePos[1],
      position[2] - dipolePos[2]
    ];
    const distance = Math.sqrt(r[0]**2 + r[1]**2 + r[2]**2);

    if (distance < 0.01) return { electric: [0, 0, 0], magnetic: [0, 0, 0] };

    const k = 2 * Math.PI * dipole.frequency / this.C; // wave number
    const omega = 2 * Math.PI * dipole.frequency;
    const retardedTime = time - distance / this.C;

    // Dipole moment vector (along orientation)
    const dipoleLength = dipole.length || 1;
    const p0 = dipole.amplitude * dipoleLength;
    const pDot = -omega * p0 * Math.cos(omega * retardedTime + dipole.phase);
    const pDotDot = omega**2 * p0 * Math.sin(omega * retardedTime + dipole.phase);

    // Unit vectors
    const rHat = [r[0] / distance, r[1] / distance, r[2] / distance];
    const dipoleDir = dipole.orientation;

    // Calculate theta (angle between dipole and observation direction)
    const cosTheta = dipoleDir[0] * rHat[0] + dipoleDir[1] * rHat[1] + dipoleDir[2] * rHat[2];
    const sinTheta = Math.sqrt(1 - cosTheta**2);

    // Far-field approximation (radiation zone)
    if (distance > 10 / k) {
      const radiationFactor = (k**2 * sinTheta) / (4 * Math.PI * this.EPSILON_0 * this.C**2 * distance);
      
      // Electric field (transverse to r, in theta direction)
      const ETheta = radiationFactor * pDotDot;
      
      // Convert to Cartesian coordinates (simplified)
      const electricField: [number, number, number] = [
        ETheta * sinTheta * Math.cos(omega * retardedTime + dipole.phase),
        ETheta * cosTheta * Math.cos(omega * retardedTime + dipole.phase),
        0
      ];

      // Magnetic field B = (1/c) r̂ × E
      const magneticField: [number, number, number] = [
        (rHat[1] * electricField[2] - rHat[2] * electricField[1]) / this.C,
        (rHat[2] * electricField[0] - rHat[0] * electricField[2]) / this.C,
        (rHat[0] * electricField[1] - rHat[1] * electricField[0]) / this.C
      ];

      return { electric: electricField, magnetic: magneticField };
    }

    return { electric: [0, 0, 0], magnetic: [0, 0, 0] };
  }

  /**
   * Apply material effects to field propagation
   */
  static applyMaterialEffects(
    field: [number, number, number],
    fieldType: 'electric' | 'magnetic',
    position: [number, number, number],
    materials: MaterialProperties[]
  ): [number, number, number] {
    const material = this.getMaterialAtPosition(position, materials);

    if (fieldType === 'electric') {
      // Electric field is reduced by relative permittivity
      const factor = 1 / material.relativePermittivity;
      return [field[0] * factor, field[1] * factor, field[2] * factor];
    } else {
      // Magnetic field is modified by relative permeability
      const factor = material.relativePermeability;
      return [field[0] * factor, field[1] * factor, field[2] * factor];
    }
  }

  /**
   * Calculate wave impedance in material
   */
  static calculateWaveImpedance(material: MaterialProperties): number {
    const mu = this.MU_0 * material.relativePermeability;
    const epsilon = this.EPSILON_0 * material.relativePermittivity;
    return Math.sqrt(mu / epsilon);
  }

  /**
   * Calculate wave velocity in material
   */
  static calculateWaveVelocity(material: MaterialProperties): number {
    const mu = this.MU_0 * material.relativePermeability;
    const epsilon = this.EPSILON_0 * material.relativePermittivity;
    return 1 / Math.sqrt(mu * epsilon);
  }

  /**
   * Get material properties at a specific position
   */
  private static getMaterialAtPosition(
    position: [number, number, number],
    materials: MaterialProperties[]
  ): MaterialProperties {
    for (const material of materials) {
      if (this.isPositionInMaterial(position, material)) {
        return material;
      }
    }

    // Return vacuum properties if no material found
    return {
      id: 'vacuum',
      name: 'Vacuum',
      relativePermittivity: 1.0,
      relativePermeability: 1.0,
      conductivity: 0,
      geometry: {
        type: 'sphere',
        position: [0, 0, 0],
        dimensions: [Infinity, 0, 0]
      }
    };
  }

  /**
   * Check if position is inside a material volume
   */
  private static isPositionInMaterial(
    position: [number, number, number],
    material: MaterialProperties
  ): boolean {
    const { geometry } = material;
    const dx = position[0] - geometry.position[0];
    const dy = position[1] - geometry.position[1];
    const dz = position[2] - geometry.position[2];

    switch (geometry.type) {
      case 'sphere':
        const radius = geometry.dimensions[0];
        return (dx**2 + dy**2 + dz**2) <= radius**2;

      case 'box':
        const [width, height, depth] = geometry.dimensions;
        return Math.abs(dx) <= width/2 && 
               Math.abs(dy) <= height/2 && 
               Math.abs(dz) <= depth/2;

      case 'cylinder':
        const [cylRadius, cylHeight] = geometry.dimensions;
        const radialDist = Math.sqrt(dx**2 + dz**2);
        return radialDist <= cylRadius && Math.abs(dy) <= cylHeight/2;

      default:
        return false;
    }
  }

  /**
   * Calculate energy density at a point
   */
  static calculateEnergyDensity(
    electricField: [number, number, number],
    magneticField: [number, number, number],
    materials: MaterialProperties[],
    position: [number, number, number]
  ): number {
    const material = this.getMaterialAtPosition(position, materials);
    const epsilon = this.EPSILON_0 * material.relativePermittivity;
    const mu = this.MU_0 * material.relativePermeability;

    const E2 = electricField[0]**2 + electricField[1]**2 + electricField[2]**2;
    const B2 = magneticField[0]**2 + magneticField[1]**2 + magneticField[2]**2;

    return 0.5 * (epsilon * E2 + B2 / mu);
  }
}