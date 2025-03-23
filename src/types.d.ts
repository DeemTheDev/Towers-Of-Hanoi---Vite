import { Object3D } from 'three';

export interface IDisk {
  size: number;
  mesh: Object3D;
  update: (x: number, y: number, z: number) => void;
  highlight: (isHighlighted: boolean) => void;
}

export interface ITower {
  index: number;
  position: { x: number; y: number; z: number };
  disks: IDisk[];
  mesh: THREE.Mesh;
  addDisk: (disk: IDisk) => void;
  removeDisk: () => IDisk | undefined;
  getTopDisk: () => IDisk | undefined;
  isEmpty: () => boolean;
}

export interface IConfetti {
  mesh: Object3D;
  velocity: { x: number; y: number; z: number };
  acceleration: { x: number; y: number; z: number };
  update: () => void;
}

// Move interface for undo functionality
export interface Move {
  sourceTowerIndex: number;
  targetTowerIndex: number;
  diskSize: number;
}

export interface IGameState {
  numDisks: number;
  numMoves: number;
  selectedDisk: IDisk | null;
  gameWon: boolean;
  timerStarted: boolean;
  startTime: number;
  elapsedTime: number;
  moveHistory: Move[];
}

interface LeaderboardEntry {
  name: string;
  time: number;
  moves: number;
  date: Date;
}