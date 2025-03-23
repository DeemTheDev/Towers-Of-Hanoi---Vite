import * as THREE from 'three';
import { IDisk } from './types';

// Colors for the disks - more vibrant and visually distinct
const COLORS = [
  0xff3b30, // red
  0xff9500, // orange
  0xffcc00, // yellow
  0x4cd964, // green
  0x5ac8fa, // blue
  0xd365ff,  // purple
  0x5856d6  // indigo
];

export class Disk implements IDisk {
  size: number;
  mesh: THREE.Mesh;
  originalMaterial: THREE.MeshStandardMaterial;
  highlightMaterial: THREE.MeshStandardMaterial;
  isAnimating: boolean = false;
  animationFrameId: number | null = null;

  constructor(size: number) {
    this.size = size;
    
    // Create disk geometry - increased thickness from 12.5 to 20
    // Also increased tube segments for better quality
    const geometry = new THREE.TorusGeometry(size * 15, 20, 32, 100);
    
    // Create material with the appropriate color and enhanced properties for lighting
    const material = new THREE.MeshStandardMaterial({
      color: COLORS[size - 1],
      roughness: 0.1,   // Very smooth for bright reflections
      metalness: 0.9,   // Very metallic
      emissive: new THREE.Color(COLORS[size - 1]).multiplyScalar(0.3), // More self-illumination
      emissiveIntensity: 0.3
    });
    
    // Create the highlight material with even stronger reflections
    this.highlightMaterial = new THREE.MeshStandardMaterial({
      color: COLORS[size - 1],
      roughness: 0.05, // Extremely reflective when highlighted
      metalness: 0.95,
      emissive: 0x00ffff, // aqua color for highlighting
      emissiveIntensity: 0.7  // Stronger glow
    });
    
    // Create the mesh and position it
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.rotation.x = Math.PI / 2; // Rotate to match the original orientation
    this.mesh.userData = { diskSize: size }; // Store the disk size for raycasting
    
    // Store the original material for toggling highlight
    this.originalMaterial = material;
  }
  
  update(x: number, y: number, z: number): void {
    // Cancel any ongoing animation when updating position
    if (this.isAnimating && this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.isAnimating = false;
      this.animationFrameId = null;
    }
    
    // Update the position
    this.mesh.position.set(x, y, z);
  }
  
  highlight(isHighlighted: boolean): void {
    // Change the material
    this.mesh.material = isHighlighted ? this.highlightMaterial : this.originalMaterial;
    
    // If we're turning on highlighting
    if (isHighlighted) {
      // Record the current position as the base for animation
      const startY = this.mesh.position.y;
      this.isAnimating = true;
      
      // Define animation function
      const animate = () => {
        if (this.mesh.material === this.highlightMaterial && this.isAnimating) {
          const time = Date.now() * 0.003;
          this.mesh.position.y = startY + Math.sin(time) * 5;
          
          // Add rotation animation as well
          this.mesh.rotation.z += 0.01;
          
          // Continue animation
          this.animationFrameId = requestAnimationFrame(animate);
        } else {
          // If no longer highlighted, stop animation but DON'T reset position
          // This prevents position from being reset to the old tower
          this.isAnimating = false;
        }
      };
      
      // Start animation
      animate();
    } else {
      // When turning off highlighting, stop animation but don't change position
      this.isAnimating = false;
    }
  }
}