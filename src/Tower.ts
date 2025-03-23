import * as THREE from 'three';
import { IDisk, ITower } from './types';

export class Tower implements ITower {
  index: number;
  position: { x: number; y: number; z: number };
  disks: IDisk[];
  mesh: THREE.Mesh;
  
  constructor(index: number, x: number, y: number, z: number) {
    this.index = index;
    this.position = { x, y, z };
    this.disks = [];
    
    // Create tower geometry (cylinder) - increased radius slightly
    const geometry = new THREE.CylinderGeometry(7, 7, 300, 32);
    
    // Create an enhanced material with better lighting properties
    const material = new THREE.MeshStandardMaterial({
      color: 0x404040, // Darker, more gunmetal color
      roughness: 0.2,
      metalness: 0.8,
      envMapIntensity: 1.0
    });
    
    // Create the mesh and position it
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(x, y, z);
    this.mesh.userData = { towerIndex: index }; // Store tower index for raycasting
  }
  


  addDisk(disk: IDisk): void {
    const height = this.disks.length * 34 + 15; // Position based on how many disks are already on tower
    disk.update(this.position.x, this.position.y - 140 + height, this.position.z);
    this.disks.push(disk);
  }
  

  removeDisk(): IDisk | undefined {
    return this.disks.pop();
  }
  
  getTopDisk(): IDisk | undefined {
    if (this.disks.length === 0) return undefined;
    return this.disks[this.disks.length - 1];
  }
  
  isEmpty(): boolean {
    return this.disks.length === 0;
  }
}