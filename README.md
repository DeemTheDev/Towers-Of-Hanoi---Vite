# 🎮 Towers of Hanoi 3D

![License](https://img.shields.io/github/license/DeemTheDev/Towers-Of-Hanoi---Vite?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

An interactive 3D implementation of the classic Towers of Hanoi puzzle game built with Three.js and TypeScript.

<p align="center">
  <img src="screenshot.png" alt="Towers of Hanoi 3D Screenshot" width="700">
</p>

## ✨ Features

- 🎲 Interactive 3D gameplay with beautiful graphics and lighting
- 🎯 Progressive difficulty levels (3-7 disks)
- ⏱️ Timer to track your solving speed
- 🔢 Move counter with optimal move count
- 🔄 Undo functionality to correct mistakes
- 🏆 Leaderboard system to track top scores
- 🎊 Victory celebrations with confetti and animations
- 📱 Responsive design for all screen sizes

## 🚀 Tech Stack

- **[TypeScript](https://www.typescriptlang.org/)** - For type safety and enhanced development experience
- **[Three.js](https://threejs.org/)** - For 3D rendering and scene management
- **[Vite](https://vitejs.dev/)** - For blazing fast build and development experience

## 🏗️ Project Structure

```
/
├── public/             # Static assets
├── src/
│   ├── Confetti.ts     # Confetti animation for celebrations
│   ├── Disk.ts         # Disk object implementation
│   ├── Tower.ts        # Tower object implementation
│   ├── TowersOfHanoi.ts # Main game logic
│   ├── types.d.ts      # TypeScript type definitions
│   ├── main.ts         # Entry point
│   └── style.css       # Global styles
├── index.html          # Main HTML file
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── vite.config.ts      # Vite configuration
```

## 🎯 Why Vite + TypeScript?

- **Fast Development**: Vite provides lightning-fast hot module replacement and quick build times
- **Type Safety**: TypeScript helps catch errors early and provides better tooling
- **Modern Development**: ES modules for cleaner code organization
- **Performance**: Minimal overhead for optimal runtime performance
- **Scalability**: Easy to extend with additional features

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/DeemTheDev/Towers-Of-Hanoi---Vite.git
cd Towers-Of-Hanoi---Vite
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Building for Production

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory, ready to be deployed.

## 🎮 How to Play

1. The objective is to move the entire stack of disks from the leftmost tower to the rightmost tower.
2. Only one disk can be moved at a time.
3. A larger disk cannot be placed on top of a smaller disk.
4. Click on a tower to select the top disk, then click on another tower to move it.
5. Use the slider to adjust the number of disks (difficulty level).
6. The timer starts when you make your first move.
7. Use the "Undo Move" button to revert a move if you make a mistake.
8. Complete the puzzle to progress to the next level.
9. Only scores from level 7 (maximum difficulty) are recorded on the leaderboard.

## 📚 Educational Value

The Towers of Hanoi puzzle is a classic mathematical problem that demonstrates:

- Recursive problem-solving
- Exponential complexity (optimal solution requires 2^n - 1 moves)
- Binary number representation (each move corresponds to a bit flip)
- Strategic thinking and planning

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- Three.js community for excellent documentation and examples
- Vite team for creating an amazing build tool
- [GPRM](https://gprm.itsvg.in) for the awesome README elements
