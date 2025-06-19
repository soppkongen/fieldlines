import { Vector3 } from 'three';

export interface FieldSource {
  position: Vector3;
  strength: number;
  type: 'charge' | 'dipole' | 'current';
}

export class PhysicsEngine {
  private static readonly COULOMB_CONSTANT = 8.99e9;
  private static readonly EPSILON_0 = 8.854e-12;
  
  /**
   * Calculate electric field at a given point due to multiple sources
   */
  static calculateElectricField(position: Vector3, sources: FieldSource[]): Vector3 {
    const totalField = new Vector3();
    
    for (const source of sources) {
      if (source.type !== 'charge') continue;
      
      const r = position.clone().sub(source.position);
      const distance = r.length();
      
      // Avoid singularity at source location
      if (distance < 0.01) continue;
      
      const fieldMagnitude = (this.COULOMB_CONSTANT * source.strength) / (distance * distance);
      const fieldDirection = r.normalize();
      
      totalField.add(fieldDirection.multiplyScalar(fieldMagnitude));
    }
    
    return totalField;
  }
  
  /**
   * Calculate magnetic field at a given point due to current sources
   */
  static calculateMagneticField(position: Vector3, sources: FieldSource[]): Vector3 {
    const totalField = new Vector3();
    
    for (const source of sources) {
      if (source.type !== 'current') continue;
      
      // Simplified magnetic field calculation for straight current
      const r = position.clone().sub(source.position);
      const distance = r.length();
      
      if (distance < 0.01) continue;
      
      // Biot-Savart law approximation
      const fieldMagnitude = (source.strength) / (distance * distance);
      const fieldDirection = r.cross(new Vector3(0, 1, 0)).normalize();
      
      totalField.add(fieldDirection.multiplyScalar(fieldMagnitude));
    }
    
    return totalField;
  }
  
  /**
   * Calculate electric potential at a given point
   */
  static calculateElectricPotential(position: Vector3, sources: FieldSource[]): number {
    let totalPotential = 0;
    
    for (const source of sources) {
      if (source.type !== 'charge') continue;
      
      const distance = position.distanceTo(source.position);
      
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
      
      const field = this.calculateElectricField(currentPosition, sources);
      
      // Stop if field is too weak
      if (field.length() < 1e-6) break;
      
      // Normalize and step forward
      field.normalize().multiplyScalar(stepSize);
      currentPosition.add(field);
      
      // Stop if too far from origin
      if (currentPosition.length() > 50) break;
    }
    
    return points;
  }
  
  /**
   * Calculate force on a test charge at given position
   */
  static calculateForce(position: Vector3, testCharge: number, sources: FieldSource[]): Vector3 {
    const electricField = this.calculateElectricField(position, sources);
    return electricField.multiplyScalar(testCharge);
  }
  
  /**
   * Calculate field gradient for visualization
   */
  static calculateFieldGradient(position: Vector3, sources: FieldSource[], delta: number = 0.01): number {
    const centerField = this.calculateElectricField(position, sources);
    
    const xField = this.calculateElectricField(
      position.clone().add(new Vector3(delta, 0, 0)), 
      sources
    );
    
    const gradient = (xField.length() - centerField.length()) / delta;
    return Math.abs(gradient);
  }
}