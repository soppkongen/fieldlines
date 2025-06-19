import { Vector3 } from 'three';

export interface FieldSource {
  position: Vector3 | [number, number, number];
  strength: number;
  type: 'charge' | 'dipole' | 'current' | 'wire' | 'loop' | 'solenoid';
  current?: number;
  radius?: number;
  length?: number;
  turns?: number;
  direction?: [number, number, number];
  frequency?: number;
  phase?: number;
}

export class PhysicsEngine {
  private static readonly COULOMB_CONSTANT = 8.99e9;
  private static readonly EPSILON_0 = 8.854e-12;
  private static readonly MU_0 = 4 * Math.PI * 1e-7;
  private static readonly C = 299792458; // Speed of light
  
  /**
   * Calculate electric field at a given point due to multiple sources
   */
  static calculateElectricField(
    position: [number, number, number], 
    sources: any[], 
    time: number = 0
  ): [number, number, number] {
    let totalField: [number, number, number] = [0, 0, 0];
    
    for (const source of sources) {
      if (!['charge', 'dipole'].includes(source.type)) continue;
      
      const sourcePos = Array.isArray(source.position) ? source.position : source.position.toArray();
      const r = [
        position[0] - sourcePos[0],
        position[1] - sourcePos[1],
        position[2] - sourcePos[2]
      ];
      const distance = Math.sqrt(r[0]*r[0] + r[1]*r[1] + r[2]*r[2]);
      
      // Avoid singularity at source location
      if (distance < 0.01) continue;
      
      let effectiveStrength = source.strength;
      
      // Handle oscillating charges
      if (source.frequency && source.frequency > 0) {
        const phase = source.phase || 0;
        effectiveStrength *= Math.sin(2 * Math.PI * source.frequency * time + phase);
      }
      
      const fieldMagnitude = (this.COULOMB_CONSTANT * effectiveStrength) / (distance * distance);
      const fieldDirection = [r[0] / distance, r[1] / distance, r[2] / distance];
      
      totalField[0] += fieldDirection[0] * fieldMagnitude;
      totalField[1] += fieldDirection[1] * fieldMagnitude;
      totalField[2] += fieldDirection[2] * fieldMagnitude;
    }
    
    return totalField;
  }
  
  /**
   * Calculate magnetic field at a given point due to current sources
   */
  static calculateMagneticField(
    position: [number, number, number], 
    sources: any[], 
    time: number = 0
  ): [number, number, number] {
    let totalField: [number, number, number] = [0, 0, 0];
    
    for (const source of sources) {
      if (!['wire', 'loop', 'solenoid'].includes(source.type)) continue;
      
      const sourcePos = Array.isArray(source.position) ? source.position : source.position.toArray();
      const r = [
        position[0] - sourcePos[0],
        position[1] - sourcePos[1],
        position[2] - sourcePos[2]
      ];
      const distance = Math.sqrt(r[0]*r[0] + r[1]*r[1] + r[2]*r[2]);
      
      if (distance < 0.01) continue;
      
      const current = source.current || 0;
      
      if (source.type === 'wire') {
        // Infinite straight wire: B = (μ₀I)/(2πr)
        const fieldMagnitude = (this.MU_0 * Math.abs(current)) / (2 * Math.PI * distance);
        
        // Direction: perpendicular to both wire and position vector
        const wireDirection = source.direction || [0, 1, 0];
        const crossProduct = [
          wireDirection[1] * r[2] - wireDirection[2] * r[1],
          wireDirection[2] * r[0] - wireDirection[0] * r[2],
          wireDirection[0] * r[1] - wireDirection[1] * r[0]
        ];
        const crossMagnitude = Math.sqrt(crossProduct[0]**2 + crossProduct[1]**2 + crossProduct[2]**2);
        
        if (crossMagnitude > 0) {
          const sign = current > 0 ? 1 : -1;
          totalField[0] += sign * fieldMagnitude * crossProduct[0] / crossMagnitude;
          totalField[1] += sign * fieldMagnitude * crossProduct[1] / crossMagnitude;
          totalField[2] += sign * fieldMagnitude * crossProduct[2] / crossMagnitude;
        }
        
      } else if (source.type === 'loop') {
        // Current loop: simplified dipole approximation
        const radius = source.radius || 1;
        const magneticMoment = Math.PI * radius * radius * current;
        
        // On-axis field approximation
        if (Math.abs(r[0]) < 0.1 && Math.abs(r[2]) < 0.1) {
          const fieldMagnitude = (this.MU_0 * magneticMoment) / (2 * Math.pow(Math.abs(r[1]), 3));
          totalField[1] += current > 0 ? fieldMagnitude : -fieldMagnitude;
        }
        
      } else if (source.type === 'solenoid') {
        // Solenoid: uniform field inside, dipole field outside
        const radius = source.radius || 0.5;
        const length = source.length || 2;
        const turns = source.turns || 50;
        
        const radialDistance = Math.sqrt(r[0]**2 + r[2]**2);
        
        if (radialDistance < radius && Math.abs(r[1]) < length/2) {
          // Inside solenoid: uniform field
          const fieldMagnitude = this.MU_0 * (turns / length) * current;
          totalField[1] += fieldMagnitude;
        } else {
          // Outside solenoid: dipole field approximation
          const magneticMoment = this.MU_0 * turns * Math.PI * radius * radius * current;
          const fieldMagnitude = magneticMoment / (4 * Math.PI * Math.pow(distance, 3));
          
          // Simplified dipole field
          totalField[0] += 3 * fieldMagnitude * r[0] * r[1] / (distance * distance);
          totalField[1] += fieldMagnitude * (3 * r[1] * r[1] / (distance * distance) - 1);
          totalField[2] += 3 * fieldMagnitude * r[2] * r[1] / (distance * distance);
        }
      }
    }
    
    return totalField;
  }
  
  /**
   * Calculate Poynting vector S = (1/μ₀) * E × B
   */
  static calculatePoyntingVector(
    electricField: [number, number, number], 
    magneticField: [number, number, number]
  ): [number, number, number] {
    const crossProduct = [
      electricField[1] * magneticField[2] - electricField[2] * magneticField[1],
      electricField[2] * magneticField[0] - electricField[0] * magneticField[2],
      electricField[0] * magneticField[1] - electricField[1] * magneticField[0]
    ];
    
    const factor = 1 / this.MU_0;
    return [
      factor * crossProduct[0],
      factor * crossProduct[1],
      factor * crossProduct[2]
    ];
  }
  
  /**
   * Calculate electric potential at a given point
   */
  static calculateElectricPotential(position: Vector3, sources: FieldSource[]): number {
    let totalPotential = 0;
    
    for (const source of sources) {
      if (source.type !== 'charge') continue;
      
      const sourcePos = Array.isArray(source.position) ? 
        new Vector3(...source.position) : source.position;
      const distance = position.distanceTo(sourcePos);
      
      if (distance < 0.01) continue;
      
      totalPotential += (this.COULOMB_CONSTANT * source.strength) / distance;
    }
    
    return totalPotential;
  }
  
  /**
   * Generate field line points starting from a given position
   */
  static generateFieldLine(
    startPosition: Vector3, 
    sources: FieldSource[], 
    stepSize: number = 0.1, 
    maxSteps: number = 1000
  ): Vector3[] {
    const points: Vector3[] = [];
    let currentPosition = startPosition.clone();
    
    for (let step = 0; step < maxSteps; step++) {
      points.push(currentPosition.clone());
      
      const field = this.calculateElectricField(
        currentPosition.toArray() as [number, number, number], 
        sources
      );
      const fieldVector = new Vector3(...field);
      
      // Stop if field is too weak
      if (fieldVector.length() < 1e-6) break;
      
      // Normalize and step forward
      fieldVector.normalize().multiplyScalar(stepSize);
      currentPosition.add(fieldVector);
      
      // Stop if too far from origin
      if (currentPosition.length() > 50) break;
    }
    
    return points;
  }
  
  /**
   * Generate magnetic field line points
   */
  static generateMagneticFieldLine(
    startPosition: Vector3, 
    sources: any[], 
    sourceType: string,
    stepSize: number = 0.1, 
    maxSteps: number = 500
  ): Vector3[] {
    const points: Vector3[] = [];
    let currentPosition = startPosition.clone();
    
    for (let step = 0; step < maxSteps; step++) {
      points.push(currentPosition.clone());
      
      const field = this.calculateMagneticField(
        currentPosition.toArray() as [number, number, number], 
        sources
      );
      const fieldVector = new Vector3(...field);
      
      // Stop if field is too weak
      if (fieldVector.length() < 1e-12) break;
      
      // For wire sources, create circular field lines
      if (sourceType === 'wire') {
        // Circular motion around wire
        const source = sources[0];
        const sourcePos = new Vector3(...source.position);
        const toSource = currentPosition.clone().sub(sourcePos);
        const wireDir = new Vector3(...(source.direction || [0, 1, 0]));
        
        // Perpendicular to wire direction
        const tangent = new Vector3().crossVectors(wireDir, toSource).normalize();
        tangent.multiplyScalar(stepSize);
        currentPosition.add(tangent);
        
        // Complete circle check
        if (step > 50 && currentPosition.distanceTo(startPosition) < stepSize * 2) {
          points.push(startPosition.clone());
          break;
        }
      } else {
        // Normal field line following
        fieldVector.normalize().multiplyScalar(stepSize);
        currentPosition.add(fieldVector);
      }
      
      // Stop if too far from origin
      if (currentPosition.length() > 20) break;
    }
    
    return points;
  }
  
  /**
   * Calculate force on a test charge at given position
   */
  static calculateForce(position: Vector3, testCharge: number, sources: FieldSource[]): Vector3 {
    const electricField = this.calculateElectricField(
      position.toArray() as [number, number, number], 
      sources
    );
    return new Vector3(...electricField).multiplyScalar(testCharge);
  }
  
  /**
   * Calculate field gradient for visualization
   */
  static calculateFieldGradient(position: Vector3, sources: FieldSource[], delta: number = 0.01): number {
    const centerField = this.calculateElectricField(
      position.toArray() as [number, number, number], 
      sources
    );
    const centerMagnitude = Math.sqrt(centerField[0]**2 + centerField[1]**2 + centerField[2]**2);
    
    const xField = this.calculateElectricField(
      [position.x + delta, position.y, position.z], 
      sources
    );
    const xMagnitude = Math.sqrt(xField[0]**2 + xField[1]**2 + xField[2]**2);
    
    const gradient = (xMagnitude - centerMagnitude) / delta;
    return Math.abs(gradient);
  }
}