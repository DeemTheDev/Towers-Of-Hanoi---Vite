import * as THREE from 'three';
import { IConfetti } from './types';

// Colors for the confetti
const COLORS = [
  0xff0000, // red
  0xffa500, // orange
  0xffff00, // yellow
  0x008000, // green
  0x0000ff, // blue
  0x800080  // purple
];

export class Confetti implements IConfetti {
  mesh: THREE.Mesh;
  velocity: { x: number; y: number; z: number };
  acceleration: { x: number; y: number; z: number };
  rotationSpeed: { x: number; y: number; z: number };
  
  constructor() {
    // Create confetti geometry (using a plane geometry as in the original)
    const size = Math.random() * 5 + 5;
    const geometry = new THREE.PlaneGeometry(size, size);
    
    // Create material with a random color from the array
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const material = new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide
    });
    
    // Create the mesh and set a random position
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(
      Math.random() * 800 - 400,
      Math.random() * 300,
      Math.random() * 300 - 150
    );
    
    // Set random rotation
    this.mesh.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
    
    // Set random velocity, acceleration, and rotation speed for animation
    this.velocity = {
      x: Math.random() * 2 - 1,
      y: Math.random() * -2 - 3, // Falling downward
      z: Math.random() * 2 - 1
    };
    
    this.acceleration = {
      x: 0,
      y: 0.05, // Gravity
      z: 0
    };
    
    this.rotationSpeed = {
      x: Math.random() * 0.1 - 0.05,
      y: Math.random() * 0.1 - 0.05,
      z: Math.random() * 0.1 - 0.05
    };
  }
  
  update(): void {
    // Stop updating if the confetti has reached the base
    if (this.mesh.position.y < -150) return;
    
    // Apply acceleration to velocity
    this.velocity.x += this.acceleration.x;
    this.velocity.y += this.acceleration.y;
    this.velocity.z += this.acceleration.z;
    
    // Apply velocity to position
    this.mesh.position.x += this.velocity.x;
    this.mesh.position.y += this.velocity.y;
    this.mesh.position.z += this.velocity.z;
    
    // Apply rotation
    this.mesh.rotation.x += this.rotationSpeed.x;
    this.mesh.rotation.y += this.rotationSpeed.y;
    this.mesh.rotation.z += this.rotationSpeed.z;
  }
}