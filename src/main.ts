import './style.css';
import { TowersOfHanoi } from './TowersOfHanoi.ts';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get the container element
  const container = document.getElementById('game-container');
  
  // Add loading indicator
  if (container) {
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loading';
    loadingElement.textContent = 'Loading...';
    loadingElement.style.position = 'absolute';
    loadingElement.style.top = '50%';
    loadingElement.style.left = '50%';
    loadingElement.style.transform = 'translate(-50%, -50%)';
    loadingElement.style.fontSize = '24px';
    loadingElement.style.color = 'white';
    container.appendChild(loadingElement);
    
    // Initialize the game after a short delay to allow the DOM to update
    setTimeout(() => {
      // Remove loading indicator
      container.removeChild(loadingElement);
      
      // Create the game
      new TowersOfHanoi(container);
    }, 100);
  } else {
    console.error('Game container not found');
  }
});