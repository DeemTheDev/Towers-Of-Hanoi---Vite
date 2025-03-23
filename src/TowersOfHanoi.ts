import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Disk } from './Disk';
import { Tower } from './Tower';
import { Confetti } from './Confetti';
import { ITower, IGameState, LeaderboardEntry, Move } from './types';


export class TowersOfHanoi {
  // Three.js objects
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  
  // Game objects
  private towers: ITower[];
  private basePlate: THREE.Mesh;
  private confetti: Confetti[];
  
  // Lighting objects
  private spotLight!: THREE.SpotLight;
  private pointLight!: THREE.PointLight;
  private hemiLight!: THREE.HemisphereLight;
  
  // Materials
  private floorMat!: THREE.MeshStandardMaterial;
  
  // Game state
  private state: IGameState;

  // Undo Button State 
  private undoButton: HTMLElement;
  
  // DOM elements
  private movesLabel: HTMLElement;
  private resetButton: HTMLElement;
  private diskSlider: HTMLInputElement;
  private diskValue: HTMLElement;
  private timerLabel: HTMLElement;
  private timerInterval: number | null = null;
  
  // Leaderboard elements
  private leaderboardButton: HTMLElement | null;
  private closeLeaderboardButton: HTMLElement;
  private scoreSubmissionOverlay: HTMLElement;
  private leaderboardOverlay: HTMLElement;
  private submitScoreButton: HTMLElement;
  private cancelSubmissionButton: HTMLElement;
  private playerNameInput: HTMLInputElement;
  private submissionTimeSpan: HTMLElement;
  private submissionMovesSpan: HTMLElement;
  private leaderboardBody: HTMLElement;

  // Victory Modal Elements
  private victoryModal: HTMLElement;
  private victoryTitle: HTMLElement;
  private victoryTime: HTMLElement;
  private victoryMoves: HTMLElement;
  private victoryLevel: HTMLElement;
  private victoryMessage: HTMLElement;
  private nextLevelButton: HTMLElement;
  private replayLevelButton: HTMLElement;


  
  // Lighting parameters
  private params = {
    shadows: true,
    exposure: 1.5,  // Higher exposure for brighter scene
    spotLightIntensity: 3.0,
    pointLightPower: 50000, // Higher power for brighter lighting
    hemiIntensity: 0.6  // More ambient light
  };
  
  constructor(container: HTMLElement) {
    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000); // Pure black background
    
    // Add fog for distance fade effect but with less density
    this.scene.fog = new THREE.FogExp2(0x000000, 0.0008);  // Reduced fog density
    
    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );
    this.camera.position.set(0, 250, 700);
    
    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);
    
    // Setup tone mapping and shadows
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = Math.pow(this.params.exposure, 5.0);
    this.renderer.shadowMap.enabled = this.params.shadows;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Initialize orbit controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 200;
    this.controls.maxDistance = 1200;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
    
    // Initialize raycaster for mouse interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    
    // Initialize game objects
    this.towers = [];
    this.confetti = [];
    
    // Initialize game state
    this.state = {
      numDisks: 3,
      numMoves: 0,
      selectedDisk: null,
      gameWon: false,
      timerStarted: false,
      startTime: 0,
      elapsedTime: 0,
      moveHistory: [] // Initialize an empty move history
  };
    
    // Get DOM elements
    this.undoButton = document.getElementById('undo-button') as HTMLElement;
    this.movesLabel = document.getElementById('moves-label') as HTMLElement;
    this.resetButton = document.getElementById('reset-button') as HTMLElement;
    this.diskSlider = document.getElementById('disk-slider') as HTMLInputElement;
    this.diskValue = document.getElementById('disk-value') as HTMLElement;
    this.timerLabel = document.getElementById('timer-label') as HTMLElement;
    
    // Get leaderboard DOM elements
    this.leaderboardButton = document.getElementById('leaderboard-button');
    this.leaderboardOverlay = document.getElementById('leaderboard-overlay') as HTMLElement;
    this.closeLeaderboardButton = document.getElementById('close-leaderboard') as HTMLElement;
    this.scoreSubmissionOverlay = document.getElementById('score-submission-overlay') as HTMLElement;
    this.submitScoreButton = document.getElementById('submit-score') as HTMLElement;
    this.cancelSubmissionButton = document.getElementById('cancel-submission') as HTMLElement;
    this.playerNameInput = document.getElementById('player-name') as HTMLInputElement;
    this.submissionTimeSpan = document.getElementById('submission-time') as HTMLElement;
    this.submissionMovesSpan = document.getElementById('submission-moves') as HTMLElement;
    this.leaderboardBody = document.getElementById('leaderboard-body') as HTMLElement;

    // Get victory modal elements
    this.victoryModal = document.getElementById('victory-modal') as HTMLElement;
    this.victoryTitle = document.getElementById('victory-title') as HTMLElement;
    this.victoryTime = document.getElementById('victory-time') as HTMLElement;
    this.victoryMoves = document.getElementById('victory-moves') as HTMLElement;
    this.victoryLevel = document.getElementById('victory-level') as HTMLElement;
    this.victoryMessage = document.getElementById('victory-message') as HTMLElement;
    this.nextLevelButton = document.getElementById('next-level-button') as HTMLElement;
    this.replayLevelButton = document.getElementById('replay-level-button') as HTMLElement;
    
    // Set up event listeners
    this.setupEventListeners(container);
    
    // Set up leaderboard event listeners
    this.setupLeaderboardEvents();
    
    // Create the floor (before lights so it receives shadows properly)
    this.createFloor();
    
    // Setup lighting
    this.setupLights();
    
    // Create the base plate
    this.basePlate = this.createBasePlate();
    this.scene.add(this.basePlate);
    
    // Initialize the game
    this.resetGame();
    
    // Start animation loop
    this.animate();
  }
  
  private setupEventListeners(container: HTMLElement): void {
    // Mouse click event listener
    container.addEventListener('click', this.onMouseClick.bind(this));
    
    // Mouse move event listener for cursor style
    container.addEventListener('mousemove', this.onMouseMove.bind(this));
    
    // Window resize event listener
    window.addEventListener('resize', this.onWindowResize.bind(this));
    
    // Reset button click listener
    if (this.resetButton) {
    this.resetButton.addEventListener('click', () => this.resetGame());
    }

    // Undo Button Click listener 
    if (this.undoButton) {
    this.undoButton.addEventListener('click', () => this.undoLastMove());
    }

    // Victory modal buttons
    if (this.nextLevelButton) {
      this.nextLevelButton.addEventListener('click', () => {
        this.hideVictoryModal();
        // Increase disk count if not at max
        if (this.state.numDisks < 7) {
          this.state.numDisks++;
          this.diskSlider.value = this.state.numDisks.toString();
          this.diskValue.textContent = this.state.numDisks.toString();
        }
        this.resetGame();
      });
    }
    
    if (this.replayLevelButton) {
      this.replayLevelButton.addEventListener('click', () => {
        this.hideVictoryModal();
        this.resetGame();
      });
    }
    
    // Disk slider change listener
    this.diskSlider.addEventListener('input', () => {
      const value = parseInt(this.diskSlider.value);
      this.diskValue.textContent = value.toString();
      this.state.numDisks = value;
      this.resetGame();
    });

  }

  // Victory Modal method
  private showVictoryModal(): void {
    // Update modal content
    this.victoryTime.textContent = this.formatTime(this.state.elapsedTime);
    this.victoryMoves.textContent = this.state.numMoves.toString();
    this.victoryLevel.textContent = this.state.numDisks.toString();
    
    // Determine if this is the max level
    const isMaxLevel = this.state.numDisks === 7;
    
    // Set title based on level
    this.victoryTitle.textContent = isMaxLevel 
      ? "Master of Hanoi!" 
      : "Level Complete!";
    
    // Set appropriate message
    if (isMaxLevel) {
      this.victoryMessage.innerHTML = `
        <p>Congratulations! You've completed the most difficult level!</p>
        <p>Your score has been recorded on the leaderboard.</p>
        <p>Try again to beat your time, or see if you can solve it in fewer moves!</p>
      `;
      // Hide next level button on max level
      this.nextLevelButton.style.display = 'none';
    } else {
      this.victoryMessage.innerHTML = `
        <p>Well done! You've solved the puzzle with ${this.state.numDisks} disks.</p>
        <p>Ready for a bigger challenge? The next level will have ${this.state.numDisks + 1} disks.</p>
        <p><b>Note:</b> Only scores from completing level 7 will appear on the leaderboard.</p>
      `;
      // Show next level button for non-max levels
      this.nextLevelButton.style.display = 'inline-block';
    }
    
    // Show the modal
    this.victoryModal.classList.remove('hidden');
}

  private hideVictoryModal(): void {
    this.victoryModal.classList.add('hidden');
  }

  
  private setupLeaderboardEvents(): void {
    // Skip if leaderboard button isn't available yet
    if (!this.leaderboardButton) {
      // Try again in a short while (DOM might still be loading)
      setTimeout(() => {
        this.leaderboardButton = document.getElementById('leaderboard-button');
        if (this.leaderboardButton) {
          this.setupLeaderboardEvents();
        }
      }, 100);
      return;
    }
    
    // Open leaderboard when button is clicked
    this.leaderboardButton.addEventListener('click', () => {
      this.showLeaderboard();
    });
    
    // Close leaderboard when close button is clicked
    this.closeLeaderboardButton.addEventListener('click', () => {
      this.leaderboardOverlay.classList.add('hidden');
    });
    
    // Submit score button handler
    this.submitScoreButton.addEventListener('click', () => {
      this.submitHighScore();
    });
    
    // Cancel submission button handler
    this.cancelSubmissionButton.addEventListener('click', () => {
      this.scoreSubmissionOverlay.classList.add('hidden');
    });
  }
  
  private setupLights(): void {
    // Main spotlight that illuminates the game area
    this.spotLight = new THREE.SpotLight(0xffffff, this.params.spotLightIntensity, 2000, Math.PI / 4, 0.5, 2);
    this.spotLight.position.set(0, 400, 400);  // Positioned more from the front
    this.spotLight.target.position.set(0, 0, 0);
    this.spotLight.castShadow = true;
    
    // Configure shadow properties for better quality
    this.spotLight.shadow.mapSize.width = 2048;
    this.spotLight.shadow.mapSize.height = 2048;
    this.spotLight.shadow.camera.near = 100;
    this.spotLight.shadow.camera.far = 1000;
    this.spotLight.shadow.bias = -0.0001;
    
    // Add spotlight target to scene (needed for the spotlight to work properly)
    this.scene.add(this.spotLight.target);
    this.scene.add(this.spotLight);
    
    // Create a point light to illuminate the disks
    this.pointLight = new THREE.PointLight(0xffee88, 1, 800, 2);
    this.pointLight.power = this.params.pointLightPower;
    this.pointLight.position.set(0, 200, 100);  // Lower height, closer to disks
    this.pointLight.castShadow = true;
    
    // Configure shadow properties
    this.pointLight.shadow.mapSize.width = 1024;
    this.pointLight.shadow.mapSize.height = 1024;
    this.pointLight.shadow.camera.near = 10;
    this.pointLight.shadow.camera.far = 1000;
    
    // Add point light to scene
    this.scene.add(this.pointLight);
    
    // Create a hemisphere light for ambient lighting
    this.hemiLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, this.params.hemiIntensity);
    this.scene.add(this.hemiLight);
    
    // Add a fill light from the side to illuminate the towers
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(200, 200, 100);
    fillLight.castShadow = true;
    this.scene.add(fillLight);
    
    // Add a rim light for edge definition
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(-100, 100, -200);
    this.scene.add(rimLight);
    
    // Add a subtle light from below for dramatic effect
    const bottomLight = new THREE.PointLight(0xaa8866, 0.4, 400, 2);
    bottomLight.position.set(0, -50, 150);
    this.scene.add(bottomLight);
  }
  
  private createFloor(): void {
    // Create the floor material with appropriate properties for wood
    this.floorMat = new THREE.MeshStandardMaterial({
      roughness: 0.7,
      color: 0xd2aa6d,
      metalness: 0.1,
      bumpScale: 0.5
    });
    
    // Create a procedural wood texture as fallback
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create wood grain pattern
      ctx.fillStyle = '#d2aa6d';
      ctx.fillRect(0, 0, 512, 512);
      
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * 512;
        const y = 0;
        const width = 2 + Math.random() * 10;
        const height = 512;
        
        ctx.fillStyle = `rgba(160, 120, 70, ${Math.random() * 0.15})`;
        ctx.fillRect(x, y, width, height);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(5, 5);
      
      this.floorMat.map = texture;
      this.floorMat.needsUpdate = true;
    }
    
    // Load floor textures from Three.js examples if available
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'https://threejs.org/examples/textures/hardwood2_diffuse.jpg',
      (map) => {
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.anisotropy = 4;
        map.repeat.set(10, 24);
        map.colorSpace = THREE.SRGBColorSpace;
        this.floorMat.map = map;
        this.floorMat.needsUpdate = true;
      }
    );
    
    // Create floor geometry and mesh
    const floorGeometry = new THREE.PlaneGeometry(3000, 3000);
    const floorMesh = new THREE.Mesh(floorGeometry, this.floorMat);
    floorMesh.receiveShadow = true;
    floorMesh.rotation.x = -Math.PI / 2.0;
    floorMesh.position.y = -160;
    this.scene.add(floorMesh);
  }
  
  private createBasePlate(): THREE.Mesh {
    // Use a more visually appealing base plate
    const geometry = new THREE.BoxGeometry(850, 20, 300);
    
    // Create a wood material
    const material = new THREE.MeshStandardMaterial({
      color: 0x8B4513,
      roughness: 0.7,
      metalness: 0.1,
      bumpScale: 0.2
    });
    
    // Create procedural wood texture
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Create wood grain pattern
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(0, 0, 256, 256);
      
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 256;
        const y = 0;
        const width = 1 + Math.random() * 5;
        const height = 256;
        
        ctx.fillStyle = `rgba(100, 60, 30, ${Math.random() * 0.2})`;
        ctx.fillRect(x, y, width, height);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(3, 1);
      
      material.map = texture;
      material.needsUpdate = true;
    }
    
    const basePlate = new THREE.Mesh(geometry, material);
    basePlate.position.y = -150;
    basePlate.castShadow = true;
    basePlate.receiveShadow = true;
    return basePlate;
  }
  
  private createTowers(): void {
    // Remove existing towers from the scene
    this.towers.forEach(tower => {
      if (tower.mesh) {
        this.scene.remove(tower.mesh);
      }
    });
    
    // Create three new towers
    this.towers = [];
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 250;
      const tower = new Tower(i, x, 0, 0);
      tower.mesh.castShadow = true;
      this.towers.push(tower);
      this.scene.add(tower.mesh);
    }
  }
  
  private createDisks(): void {
    // Create disks and stack them on the first tower
    for (let i = this.state.numDisks; i >= 1; i--) {
      const disk = new Disk(i);
      disk.mesh.castShadow = true;
      disk.mesh.receiveShadow = true;
      this.towers[0].addDisk(disk);
      this.scene.add(disk.mesh);
    }
  }
  
  private resetGame(): void {
    // Reset game state
    this.state.numMoves = 0;
    this.state.selectedDisk = null;
    this.state.gameWon = false;

    // Clear the move history
    this.state.moveHistory = [];

    // Update the undo button state
    this.updateUndoButtonState();

    // Hide the victory modal if it's open
    this.hideVictoryModal();

    // Reset timer
    this.stopTimer();
    this.state.timerStarted = false;
    this.state.elapsedTime = 0;
    this.timerLabel.textContent = 'Time: 00:00';
    
    // Remove existing confetti
    this.confetti.forEach(c => {
      this.scene.remove(c.mesh);
    });
    this.confetti = [];
    
    // Create new towers
    this.createTowers();
    
    // Remove existing disks from the scene
    this.scene.children = this.scene.children.filter(child => {
      return !(child instanceof THREE.Mesh && child.userData.diskSize !== undefined);
    });
    
    // Create new disks
    this.createDisks();
    
    // Update moves label
    this.updateMovesLabel();
  }
  
  private updateMovesLabel(): void {
    const targetMoves = Math.pow(2, this.state.numDisks) - 1;
    this.movesLabel.textContent = `${this.state.numMoves} of ${targetMoves} moves`;
  }
  
  private onMouseMove(event: MouseEvent): void {
    // Calculate normalized mouse coordinates
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Raycasting to check if mouse is over a tower or disk
    this.raycaster.setFromCamera(this.mouse, this.camera);
    
    // Check if we're over a tower or a disk
    const intersects = this.raycaster.intersectObjects(this.scene.children);
    
    if (intersects.length > 0) {
      const firstHit = intersects[0].object;
      if (
        firstHit instanceof THREE.Mesh && 
        (firstHit.userData.towerIndex !== undefined || firstHit.userData.diskSize !== undefined)
      ) {
        document.body.classList.add('can-grab');
        document.body.classList.remove('default');
      } else {
        document.body.classList.remove('can-grab');
        document.body.classList.add('default');
      }
    } else {
      document.body.classList.remove('can-grab');
      document.body.classList.add('default');
    }
  }
  
  private onMouseClick(event: MouseEvent): void {
    // If game won, reset on click
    if (this.state.gameWon) {
      this.resetGame();
      return;
    }
    
    // Calculate normalized mouse coordinates
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
    // Raycasting to detect clicks on towers or disks
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.scene.children);
    
    if (intersects.length > 0) {
      const firstHit = intersects[0].object;
      
      // Check if we clicked on a tower
      if (firstHit instanceof THREE.Mesh && firstHit.userData.towerIndex !== undefined) {
        const towerIndex = firstHit.userData.towerIndex;
        this.handleTowerClick(towerIndex);
      }
      // Check if we clicked on a disk
      else if (firstHit instanceof THREE.Mesh && firstHit.userData.diskSize !== undefined) {
        // Find which tower this disk belongs to
        for (let i = 0; i < this.towers.length; i++) {
          const tower = this.towers[i];
          const topDisk = tower.getTopDisk();
          
          if (topDisk && topDisk.mesh === firstHit) {
            this.handleTowerClick(tower.index);
            break;
          }
        }
      }
    }
  }
  
private handleTowerClick(towerIndex: number): void {
  const tower = this.towers[towerIndex];
  
  if (!this.state.selectedDisk) {
    // No disk selected, try to select the top disk of the clicked tower
    const topDisk = tower.getTopDisk();
    
    if (topDisk) {
      this.state.selectedDisk = topDisk;
      topDisk.highlight(true);
    }
  } else {
    // A disk is already selected, try to move it to the clicked tower
    const topDisk = tower.getTopDisk();
    const selectedDiskSize = this.state.selectedDisk.size;
    
    // Check if the move is valid (can't place larger disk on smaller one)
    if (topDisk && topDisk.size < selectedDiskSize) {
      // Invalid move, deselect the disk
      this.state.selectedDisk.highlight(false);
      this.state.selectedDisk = null;
      return;
    }
    
    // Valid move, find the tower that has the selected disk
    for (let i = 0; i < this.towers.length; i++) {
      const sourceTower = this.towers[i];
      if (sourceTower.disks.includes(this.state.selectedDisk)) {
        // Start the timer if this is the first move
        if (!this.state.timerStarted) {
          this.startTimer();
        }
        
        // Turn off highlight before moving
        this.state.selectedDisk.highlight(false);
        
        // Record the move before executing it
        const move: Move = {
          sourceTowerIndex: sourceTower.index,
          targetTowerIndex: tower.index,
          diskSize: selectedDiskSize
        };
        this.state.moveHistory.push(move);
        
        // Remove the disk from source tower
        sourceTower.removeDisk();
        
        // Add the disk to the destination tower
        tower.addDisk(this.state.selectedDisk);
        
        // Deselect the disk
        this.state.selectedDisk = null;
        
        // Increment move counter
        this.state.numMoves++;
        this.updateMovesLabel();
        
        // Enable the undo button since we now have a move to undo
        this.updateUndoButtonState();
        
        // Check if the game is won (all disks on the third tower)
        if (this.towers[2].disks.length === this.state.numDisks) {
          this.gameWon();
        }
        
        break;
      }
    }
  }
}
  

// Method to update the undo button state (enabled/disabled)
private updateUndoButtonState(): void {
  if (this.state.moveHistory.length > 0 && !this.state.gameWon) {
    this.undoButton.removeAttribute('disabled');
    this.undoButton.classList.remove('disabled');
  } else {
    this.undoButton.setAttribute('disabled', 'true');
    this.undoButton.classList.add('disabled');
  }
}

// Add the undo functionality method
private undoLastMove(): void {
  // Check if there are moves to undo
  if (this.state.moveHistory.length === 0 || this.state.gameWon) {
    return;
  }
  
  // Get the last move
  const lastMove = this.state.moveHistory.pop();

  if (!lastMove) {
  return;
  }
  
  // Get the source and target towers from the last move
  const sourceTower = this.towers[lastMove.targetTowerIndex];
  const targetTower = this.towers[lastMove.sourceTowerIndex];
  
  // Get the disk to move (top disk of source tower)
  const disk = sourceTower.removeDisk();
  
  if (!disk) {
    console.error('Error: No disk to undo');
    return;
  }
  
  // Add the disk back to the target tower
  targetTower.addDisk(disk);
  
  // Decrement the move counter
  this.state.numMoves--;
  this.updateMovesLabel();
  
  // Update the undo button state
  this.updateUndoButtonState();
}


 // Win Method 
  private gameWon(): void {

    this.state.gameWon = true;
    
    // Stop the timer when the game is won
    this.stopTimer();
    
    // Store the completion time for potential leaderboard
    const completionTime = this.state.elapsedTime;
    
    // Create 3D confetti celebration (as before)
    for (let i = 0; i < 1000; i++) {
      const confetti = new Confetti();
      this.confetti.push(confetti);
      this.scene.add(confetti.mesh);
    }
    
    // Check for high score if at max level
    if (this.state.numDisks === 7) {
      this.checkHighScore(completionTime);
    }
    
    // Show victory modal after a short delay
    setTimeout(() => {
      this.showVictoryModal();
    }, 1000);
}
  
  private onWindowResize(): void {
    const container = this.renderer.domElement.parentElement;
    if (!container) return;
    
    // Update camera aspect ratio
    this.camera.aspect = container.clientWidth / container.clientHeight;
    this.camera.updateProjectionMatrix();
    
    // Update renderer size
    this.renderer.setSize(container.clientWidth, container.clientHeight);
  }
  
  private animate(): void {
    requestAnimationFrame(this.animate.bind(this));
    
    // Update controls
    this.controls.update();
    
    // Update confetti
    if (this.state.gameWon) {
      this.confetti.forEach(c => c.update());
    }
    
    // Animate the point light position for dynamic lighting
    const time = Date.now() * 0.0005;
    this.pointLight.position.y = Math.cos(time) * 20 + 200;
    this.pointLight.position.x = Math.sin(time) * 30;
    this.pointLight.position.z = Math.sin(time * 0.7) * 20;
    
    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }
  
  // Timer methods
  private startTimer(): void {
    if (!this.state.timerStarted) {
      this.state.timerStarted = true;
      this.state.startTime = Date.now();
      
      // Update the timer display every 100ms
      this.timerInterval = window.setInterval(() => {
        this.updateTimer();
      }, 100);
    }
  }
  
  private updateTimer(): void {
    if (this.state.timerStarted && !this.state.gameWon) {
      this.state.elapsedTime = Date.now() - this.state.startTime;
      this.timerLabel.textContent = `Time: ${this.formatTime(this.state.elapsedTime)}`;
    }
  }
  
  private formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    // Add leading zeros
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    
    return `${formattedMinutes}:${formattedSeconds}`;
  }
  
  private stopTimer(): void {
    if (this.timerInterval !== null) {
      window.clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
  
  // Leaderboard methods
  private showLeaderboard(): void {
    // Load and display leaderboard entries
    this.displayLeaderboard();
    
    // Show the leaderboard overlay
    this.leaderboardOverlay.classList.remove('hidden');
  }
  
  private displayLeaderboard(): void {
    // Clear existing entries
    this.leaderboardBody.innerHTML = '';
    
    // Get leaderboard entries from localStorage
    const entries = this.getLeaderboardEntries();
    
    if (entries.length === 0) {
      // No entries yet
      const noEntriesRow = document.createElement('tr');
      noEntriesRow.innerHTML = '<td colspan="5">No high scores yet. Complete level 7 to set a record!</td>';
      this.leaderboardBody.appendChild(noEntriesRow);
      return;
    }
    
    // Sort entries by time (fastest first)
    entries.sort((a, b) => a.time - b.time);
    
    // Display top 10 entries
    const entriesToShow = entries.slice(0, 10);
    
    entriesToShow.forEach((entry, index) => {
      const row = document.createElement('tr');
      
      // Format the date
      const date = new Date(entry.date);
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.name}</td>
        <td>${this.formatTime(entry.time)}</td>
        <td>${entry.moves}</td>
        <td>${formattedDate}</td>
      `;
      
      this.leaderboardBody.appendChild(row);
    });
  }
  
  private getLeaderboardEntries(): LeaderboardEntry[] {
    // Get entries from localStorage
    const entriesJson = localStorage.getItem('hanoiLeaderboard');
    
    if (!entriesJson) {
      return [];
    }
    
    try {
      return JSON.parse(entriesJson);
    } catch (e) {
      console.error('Error parsing leaderboard entries:', e);
      return [];
    }
  }
  
  // The leaderboard data is stored under the key 'hanoiLeaderboard' in the browser's localStorage.
  private saveLeaderboardEntries(entries: LeaderboardEntry[]): void {
    // Save entries to localStorage
    localStorage.setItem('hanoiLeaderboard', JSON.stringify(entries));
  }
  
  private checkHighScore(completionTime: number): void {
    // Only check for high scores at the maximum level
    if (this.state.numDisks !== 7) {
      return;
    }
    
    // Get current leaderboard entries
    const entries = this.getLeaderboardEntries();
    
    // Determine if this is a high score
    const isHighScore = 
      entries.length < 10 || // Less than 10 entries, automatic high score
      entries.some(entry => entry.time > completionTime); // Better than at least one existing entry
    
    if (isHighScore) {
      // Show the high score submission form
      this.showScoreSubmissionForm(completionTime);
    } else {
      // Show max level completion message
      setTimeout(() => {
        const notification = document.createElement('div');
        notification.classList.add('max-level-notification');
        notification.innerHTML = `
          <h3>Congratulations!</h3>
          <p>You completed the maximum level with all 7 disks!</p>
          <p>Time: ${this.formatTime(completionTime)}</p>
          <p>Moves: ${this.state.numMoves}</p>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 5000);
      }, 2000);
    }
  }
  
  private showScoreSubmissionForm(completionTime: number): void {
    // Set the completion details
    this.submissionTimeSpan.textContent = this.formatTime(completionTime);
    this.submissionMovesSpan.textContent = this.state.numMoves.toString();
    
    // Clear any previous name input
    this.playerNameInput.value = '';
    
    // Show the form
    this.scoreSubmissionOverlay.classList.remove('hidden');
  }
  
  private submitHighScore(): void {
    // Get the player name (use "Anonymous" if empty)
    const playerName = this.playerNameInput.value.trim() || 'Anonymous';
    
    // Create a new leaderboard entry
    const newEntry: LeaderboardEntry = {
      name: playerName,
      time: this.state.elapsedTime,
      moves: this.state.numMoves,
      date: new Date()
    };
    
    // Get current entries
    const entries = this.getLeaderboardEntries();
    
    // Add the new entry
    entries.push(newEntry);
    
    // Sort by time (fastest first) and keep top 10
    entries.sort((a, b) => a.time - b.time);
    const topEntries = entries.slice(0, 10);
    
    // Save the updated leaderboard
    this.saveLeaderboardEntries(topEntries);
    
    // Hide the submission form
    this.scoreSubmissionOverlay.classList.add('hidden');
    
    // Show the updated leaderboard
    this.showLeaderboard();
  }
}