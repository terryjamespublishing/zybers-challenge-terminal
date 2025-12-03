import React, { useState, useEffect, useCallback } from 'react';

interface CircuitPuzzleProps {
  onSolved: () => void;
  difficulty?: 1 | 2 | 3;
}

// Wire piece types and their connection directions
type WireType = 'straight' | 'corner' | 'tee' | 'cross' | 'empty' | 'blocked' | 'source' | 'target';
type Direction = 'up' | 'down' | 'left' | 'right';

interface WirePiece {
  type: WireType;
  rotation: 0 | 90 | 180 | 270;
  powered: boolean;
  locked?: boolean;
}

// Get connections for a wire piece based on type and rotation
const getConnections = (piece: WirePiece): Direction[] => {
  const baseConnections: Record<WireType, Direction[]> = {
    straight: ['up', 'down'],
    corner: ['up', 'right'],
    tee: ['up', 'left', 'right'],
    cross: ['up', 'down', 'left', 'right'],
    empty: [],
    blocked: [],
    source: ['right'],  // Power exits to the right only
    target: ['left'],   // Power enters from the left only
  };

  const rotateDirection = (dir: Direction, rotation: number): Direction => {
    const dirs: Direction[] = ['up', 'right', 'down', 'left'];
    const idx = dirs.indexOf(dir);
    const rotations = rotation / 90;
    return dirs[(idx + rotations) % 4];
  };

  return baseConnections[piece.type].map(d => rotateDirection(d, piece.rotation));
};

// Check if two adjacent cells are connected
const areConnected = (piece1: WirePiece, piece2: WirePiece, direction: Direction): boolean => {
  const opposite: Record<Direction, Direction> = {
    up: 'down',
    down: 'up',
    left: 'right',
    right: 'left',
  };

  const conn1 = getConnections(piece1);
  const conn2 = getConnections(piece2);

  return conn1.includes(direction) && conn2.includes(opposite[direction]);
};

// Determine the correct wire type and rotation for a path cell based on entry/exit directions
const getWireForPath = (
  entryDir: Direction | null,
  exitDir: Direction | null
): { type: WireType; rotation: 0 | 90 | 180 | 270 } => {
  // Map of direction pairs to wire configurations
  // Entry and exit directions from the perspective of the cell
  const opposite: Record<Direction, Direction> = {
    up: 'down', down: 'up', left: 'right', right: 'left'
  };

  // Convert to connection directions (which sides of the cell connect)
  const connections: Direction[] = [];
  if (entryDir) connections.push(opposite[entryDir]); // Entry from left means cell connects left
  if (exitDir) connections.push(exitDir); // Exit to right means cell connects right

  // Sort for consistent comparison
  const sorted = connections.sort().join(',');

  // Corner: connects two adjacent sides
  // Straight: connects two opposite sides
  const configs: Record<string, { type: WireType; rotation: 0 | 90 | 180 | 270 }> = {
    'down,right': { type: 'corner', rotation: 90 },   // └
    'down,left': { type: 'corner', rotation: 180 },   // ┘
    'left,up': { type: 'corner', rotation: 270 },     // ┐
    'right,up': { type: 'corner', rotation: 0 },      // ┌
    'left,right': { type: 'straight', rotation: 90 }, // ─
    'down,up': { type: 'straight', rotation: 0 },     // │
  };

  return configs[sorted] || { type: 'cross', rotation: 0 };
};

// Generate a very winding path that visits many cells - much harder to trace
// Path MUST start by going RIGHT from source (0,0) and enter target from LEFT
const generatePath = (gridSize: number, blockedCells: Set<string>): { x: number; y: number }[] => {
  const target = { x: gridSize - 1, y: gridSize - 1 };

  // Minimum path length based on difficulty (grid size)
  // Force very winding paths - at least 55% of grid cells
  const minPathLength = Math.floor(gridSize * gridSize * 0.55);

  // Try to find a very winding path using DFS that prefers NOT going toward target
  const findWindingPath = (): { x: number; y: number }[] | null => {
    const visited = new Set<string>();
    const path: { x: number; y: number }[] = [];

    const dfs = (x: number, y: number, depth: number, mustGoRight: boolean): boolean => {
      const key = `${x},${y}`;
      if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return false;
      if (visited.has(key)) return false;
      if (blockedCells.has(key)) return false;

      visited.add(key);
      path.push({ x, y });

      if (x === target.x && y === target.y) {
        // Only accept if path is long enough AND we entered from the left
        const prevCell = path[path.length - 2];
        const enteredFromLeft = prevCell && prevCell.x === target.x - 1 && prevCell.y === target.y;
        return path.length >= minPathLength && enteredFromLeft;
      }

      // If we must go right (first move from source), only allow right
      let directions = [
        { dx: 1, dy: 0 },  // right
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }, // left
        { dx: 0, dy: -1 }, // up
      ];

      if (mustGoRight) {
        directions = [{ dx: 1, dy: 0 }]; // Only right for first move
      } else {
        // Shuffle directions
        for (let i = directions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [directions[i], directions[j]] = [directions[j], directions[i]];
        }

        // Early in the path, AVOID going toward target to force winding
        const toTargetX = target.x - x;
        const toTargetY = target.y - y;
        const distToTarget = Math.abs(toTargetX) + Math.abs(toTargetY);

        // If we're far from target and path is short, prefer going AWAY from target
        if (path.length < minPathLength * 0.7 && distToTarget > gridSize / 2) {
          directions.sort((a, b) => {
            const scoreA = (a.dx * toTargetX > 0 ? -1 : 1) + (a.dy * toTargetY > 0 ? -1 : 1);
            const scoreB = (b.dx * toTargetX > 0 ? -1 : 1) + (b.dy * toTargetY > 0 ? -1 : 1);
            return scoreB - scoreA; // Higher score = away from target
          });
        } else if (path.length >= minPathLength * 0.7) {
          // Once we've wandered enough, head toward target
          // But prefer approaching target from the left
          directions.sort((a, b) => {
            const scoreA = (a.dx * toTargetX > 0 ? 1 : 0) + (a.dy * toTargetY > 0 ? 1 : 0);
            const scoreB = (b.dx * toTargetX > 0 ? 1 : 0) + (b.dy * toTargetY > 0 ? 1 : 0);
            return scoreB - scoreA;
          });
        }
      }

      for (const { dx, dy } of directions) {
        if (dfs(x + dx, y + dy, depth + 1, false)) return true;
      }

      // Backtrack
      path.pop();
      visited.delete(key);
      return false;
    };

    // Start at source (0,0) and MUST go right first
    if (dfs(0, 0, 0, true)) return path;
    return null;
  };

  // Generate multiple paths and pick the longest/most winding one
  let bestPath: { x: number; y: number }[] | null = null;

  for (let attempt = 0; attempt < 20; attempt++) {
    const path = findWindingPath();
    if (path) {
      if (!bestPath || path.length > bestPath.length) {
        bestPath = path;
      }
      // If we found a really winding path, use it
      if (path.length >= minPathLength) break;
    }
  }

  // Fallback: snake pattern if winding path failed
  if (!bestPath) {
    bestPath = [];
    for (let y = 0; y < gridSize; y++) {
      if (y % 2 === 0) {
        for (let x = 0; x < gridSize; x++) {
          const key = `${x},${y}`;
          if (!blockedCells.has(key)) bestPath.push({ x, y });
        }
      } else {
        for (let x = gridSize - 1; x >= 0; x--) {
          const key = `${x},${y}`;
          if (!blockedCells.has(key)) bestPath.push({ x, y });
        }
      }
    }
    // Trim to end at target
    const targetIdx = bestPath.findIndex(p => p.x === target.x && p.y === target.y);
    if (targetIdx >= 0) bestPath = bestPath.slice(0, targetIdx + 1);
  }

  return bestPath;
};

const CircuitPuzzle: React.FC<CircuitPuzzleProps> = ({ onSolved, difficulty = 1 }) => {
  // Larger grids for real challenge
  const gridSize = difficulty === 1 ? 7 : difficulty === 2 ? 9 : 11;

  // Initialize puzzle grid with guaranteed solvable configuration
  const [grid, setGrid] = useState<WirePiece[][]>(() => {
    // First, determine blocked cells (obstacles)
    // More blocked cells on harder difficulties
    const numBlocked = difficulty === 1 ? 5 : difficulty === 2 ? 10 : 16;
    const blockedCells = new Set<string>();

    // Never block source, target, or cells immediately adjacent to them
    const protectedCells = new Set([
      '0,0', '1,0', '0,1', // Near source
      `${gridSize-1},${gridSize-1}`, `${gridSize-2},${gridSize-1}`, `${gridSize-1},${gridSize-2}`, // Near target
    ]);

    // Place blocked cells randomly
    let blockAttempts = 0;
    while (blockedCells.size < numBlocked && blockAttempts < 100) {
      const x = Math.floor(Math.random() * gridSize);
      const y = Math.floor(Math.random() * gridSize);
      const key = `${x},${y}`;
      if (!protectedCells.has(key) && !blockedCells.has(key)) {
        blockedCells.add(key);
      }
      blockAttempts++;
    }

    // Generate a valid path from source to target avoiding blocked cells
    const path = generatePath(gridSize, blockedCells);
    const pathSet = new Set(path.map(p => `${p.x},${p.y}`));

    // Remove any blocked cells that ended up on the path (shouldn't happen but safety check)
    for (const p of path) {
      blockedCells.delete(`${p.x},${p.y}`);
    }

    // Create empty grid
    const initialGrid: WirePiece[][] = [];
    for (let y = 0; y < gridSize; y++) {
      const row: WirePiece[] = [];
      for (let x = 0; x < gridSize; x++) {
        const key = `${x},${y}`;
        if (blockedCells.has(key)) {
          row.push({ type: 'blocked', rotation: 0, powered: false, locked: true });
        } else {
          row.push({ type: 'empty', rotation: 0, powered: false });
        }
      }
      initialGrid.push(row);
    }

    // Place wire pieces along the path with correct types and rotations
    for (let i = 0; i < path.length; i++) {
      const { x, y } = path[i];
      const prev = path[i - 1];
      const next = path[i + 1];

      // Determine entry direction (where we came from)
      let entryDir: Direction | null = null;
      if (prev) {
        if (prev.x < x) entryDir = 'left';
        else if (prev.x > x) entryDir = 'right';
        else if (prev.y < y) entryDir = 'up';
        else entryDir = 'down';
      }

      // Determine exit direction (where we're going)
      let exitDir: Direction | null = null;
      if (next) {
        if (next.x > x) exitDir = 'right';
        else if (next.x < x) exitDir = 'left';
        else if (next.y > y) exitDir = 'down';
        else exitDir = 'up';
      }

      // Source and target use special piece types with single connections
      const isSource = x === 0 && y === 0;
      const isTarget = x === gridSize - 1 && y === gridSize - 1;

      if (isSource) {
        // Source: only connects to the RIGHT
        initialGrid[y][x] = {
          type: 'source',
          rotation: 0,
          powered: true,
          locked: true,
        };
      } else if (isTarget) {
        // Target: only connects from the LEFT
        initialGrid[y][x] = {
          type: 'target',
          rotation: 0,
          powered: false,
          locked: true,
        };
      } else {
        // Get the correct wire piece for this path segment
        const { type, rotation } = getWireForPath(entryDir, exitDir);
        initialGrid[y][x] = {
          type,
          rotation,
          powered: false,
          locked: false,
        };
      }
    }

    // Create DECOY paths - partial routes that look like they could be the solution
    // This is the key to making the puzzle much harder
    const createDecoyPaths = () => {
      const decoyCount = difficulty === 1 ? 2 : difficulty === 2 ? 4 : 6;

      for (let d = 0; d < decoyCount; d++) {
        // Start decoy from a random edge
        const startEdge = Math.floor(Math.random() * 4);
        let startX: number, startY: number;

        switch (startEdge) {
          case 0: // Top edge
            startX = Math.floor(Math.random() * (gridSize - 2)) + 1;
            startY = 0;
            break;
          case 1: // Right edge
            startX = gridSize - 1;
            startY = Math.floor(Math.random() * (gridSize - 2)) + 1;
            break;
          case 2: // Bottom edge
            startX = Math.floor(Math.random() * (gridSize - 2)) + 1;
            startY = gridSize - 1;
            break;
          default: // Left edge
            startX = 0;
            startY = Math.floor(Math.random() * (gridSize - 2)) + 1;
            break;
        }

        // Create a partial decoy path
        const decoyLength = Math.floor(gridSize * 0.6);
        let x = startX, y = startY;

        for (let i = 0; i < decoyLength; i++) {
          const key = `${x},${y}`;
          if (pathSet.has(key) || initialGrid[y][x].type === 'blocked') break;
          if (initialGrid[y][x].type !== 'empty') break;

          // Place a wire piece that looks like it could connect
          const types: WireType[] = ['corner', 'straight', 'tee', 'corner'];
          const type = types[Math.floor(Math.random() * types.length)];
          const rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)] as 0 | 90 | 180 | 270;
          initialGrid[y][x] = { type, rotation, powered: false };

          // Move in a random direction
          const dx = [-1, 0, 1][Math.floor(Math.random() * 3)];
          const dy = dx === 0 ? [-1, 1][Math.floor(Math.random() * 2)] : 0;
          x = Math.max(0, Math.min(gridSize - 1, x + dx));
          y = Math.max(0, Math.min(gridSize - 1, y + dy));
        }
      }
    };

    createDecoyPaths();

    // Fill remaining empty cells with deceptive pieces
    // Use MORE T-junctions and crosses to create confusing connection points
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        if (initialGrid[y][x].type === 'empty') {
          // Heavily favor T-junctions and corners - they create more false possibilities
          const rand = Math.random();
          let type: WireType;
          if (rand < 0.35) {
            type = 'tee'; // 35% T-junctions - many connections, confusing
          } else if (rand < 0.65) {
            type = 'corner'; // 30% corners
          } else if (rand < 0.85) {
            type = 'straight'; // 20% straight
          } else {
            type = 'cross'; // 15% crosses - connect everything, very confusing
          }
          const rotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)] as 0 | 90 | 180 | 270;
          initialGrid[y][x] = { type, rotation, powered: false };
        }
      }
    }

    // Scramble rotations of non-locked pieces to create the puzzle
    // Keep scrambling until the puzzle is NOT solved
    const scrambleGrid = () => {
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          if (!initialGrid[y][x].locked) {
            const randomRotation = [0, 90, 180, 270][Math.floor(Math.random() * 4)] as 0 | 90 | 180 | 270;
            initialGrid[y][x].rotation = randomRotation;
          }
        }
      }
    };

    // Check if puzzle is solved (power reaches target)
    const checkIfSolved = (): boolean => {
      const visited = new Set<string>();
      const queue: { x: number; y: number; fromDir: Direction | null }[] = [{ x: 0, y: 0, fromDir: null }];

      while (queue.length > 0) {
        const { x, y, fromDir } = queue.shift()!;
        const key = `${x},${y}`;

        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) continue;
        if (visited.has(key)) continue;

        const piece = initialGrid[y][x];
        if (piece.type === 'empty' || piece.type === 'blocked') continue;

        if (fromDir) {
          const opposite: Record<Direction, Direction> = {
            up: 'down', down: 'up', left: 'right', right: 'left'
          };
          const connections = getConnections(piece);
          if (!connections.includes(opposite[fromDir])) continue;
        }

        visited.add(key);

        if (x === gridSize - 1 && y === gridSize - 1) {
          return true; // Reached target!
        }

        const connections = getConnections(piece);
        const directions: { dir: Direction; dx: number; dy: number }[] = [
          { dir: 'up', dx: 0, dy: -1 },
          { dir: 'down', dx: 0, dy: 1 },
          { dir: 'left', dx: -1, dy: 0 },
          { dir: 'right', dx: 1, dy: 0 },
        ];

        for (const { dir, dx, dy } of directions) {
          if (connections.includes(dir)) {
            queue.push({ x: x + dx, y: y + dy, fromDir: dir });
          }
        }
      }
      return false;
    };

    // Keep scrambling until puzzle is NOT solved (max 50 attempts)
    let scrambleAttempts = 0;
    do {
      scrambleGrid();
      scrambleAttempts++;
    } while (checkIfSolved() && scrambleAttempts < 50);

    return initialGrid;
  });

  const [sparks, setSparks] = useState<{ x: number; y: number; id: number }[]>([]);
  const [solved, setSolved] = useState(false);
  const [powerPath, setPowerPath] = useState<Set<string>>(new Set(['0,0'])); // Source always powered

  // Calculate power flow in real-time - shows ALL connected cells from source
  const calculatePower = useCallback((): { poweredCells: Set<string>; reachedTarget: boolean } => {
    const poweredCells = new Set<string>();
    const visited = new Set<string>();
    let reachedTarget = false;

    // BFS to find all cells connected to the power source
    const bfs = () => {
      const queue: { x: number; y: number; fromDir: Direction | null }[] = [{ x: 0, y: 0, fromDir: null }];

      while (queue.length > 0) {
        const { x, y, fromDir } = queue.shift()!;
        const key = `${x},${y}`;

        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) continue;
        if (visited.has(key)) continue;

        const piece = grid[y][x];
        if (piece.type === 'empty' || piece.type === 'blocked') continue;

        // Check if we can enter from this direction
        if (fromDir) {
          const opposite: Record<Direction, Direction> = {
            up: 'down', down: 'up', left: 'right', right: 'left'
          };
          const connections = getConnections(piece);
          if (!connections.includes(opposite[fromDir])) continue;
        }

        visited.add(key);
        poweredCells.add(key);

        // Check if we reached the target
        if (x === gridSize - 1 && y === gridSize - 1) {
          reachedTarget = true;
        }

        // Add all connected neighbors to queue
        const connections = getConnections(piece);
        const directions: { dir: Direction; dx: number; dy: number }[] = [
          { dir: 'up', dx: 0, dy: -1 },
          { dir: 'down', dx: 0, dy: 1 },
          { dir: 'left', dx: -1, dy: 0 },
          { dir: 'right', dx: 1, dy: 0 },
        ];

        for (const { dir, dx, dy } of directions) {
          if (connections.includes(dir)) {
            queue.push({ x: x + dx, y: y + dy, fromDir: dir });
          }
        }
      }
    };

    bfs();
    return { poweredCells, reachedTarget };
  }, [grid, gridSize]);

  // Real-time power calculation - runs whenever grid changes
  useEffect(() => {
    if (solved) return;

    const { poweredCells, reachedTarget } = calculatePower();
    setPowerPath(poweredCells);

    if (reachedTarget) {
      setSolved(true);
      setTimeout(() => onSolved(), 1500);
    }
  }, [grid, calculatePower, solved, onSolved]);

  // Rotate a wire piece
  const rotatePiece = (x: number, y: number) => {
    if (grid[y][x].locked || solved) return;

    // Add spark effect
    setSparks(prev => [...prev, { x, y, id: Date.now() }]);
    setTimeout(() => {
      setSparks(prev => prev.filter(s => s.id !== Date.now()));
    }, 300);

    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
      const piece = newGrid[y][x];
      piece.rotation = ((piece.rotation + 90) % 360) as 0 | 90 | 180 | 270;
      return newGrid;
    });
  };

  // Render a wire piece
  const renderWire = (piece: WirePiece, x: number, y: number) => {
    const isPowered = powerPath.has(`${x},${y}`);
    const isSource = piece.type === 'source';
    const isTarget = piece.type === 'target';
    const hasSpark = sparks.some(s => s.x === x && s.y === y);
    const isBlocked = piece.type === 'blocked';

    const baseColor = isPowered ? 'rgb(0, 255, 65)' : 'rgb(60, 60, 60)';
    const glowColor = isPowered ? 'rgba(0, 255, 65, 0.8)' : 'transparent';

    // Blocked cells are not clickable
    if (isBlocked) {
      return (
        <div
          key={`${x}-${y}`}
          className="relative border border-red-900/50 cursor-not-allowed"
          style={{
            width: '100%',
            aspectRatio: '1',
            background: 'repeating-linear-gradient(45deg, rgba(80, 0, 0, 0.4), rgba(80, 0, 0, 0.4) 4px, rgba(40, 0, 0, 0.6) 4px, rgba(40, 0, 0, 0.6) 8px)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-red-500/60 text-xs">✕</span>
          </div>
        </div>
      );
    }

    return (
      <div
        key={`${x}-${y}`}
        className={`relative border border-primary/20 cursor-pointer transition-all duration-200 ${
          piece.locked ? 'cursor-not-allowed' : 'hover:bg-primary/10'
        }`}
        style={{
          width: '100%',
          aspectRatio: '1',
          background: isSource
            ? 'radial-gradient(circle, rgba(0, 255, 65, 0.4) 0%, rgba(0, 100, 0, 0.3) 70%)'
            : isTarget
            ? isPowered
              ? 'radial-gradient(circle, rgba(0, 255, 65, 0.4) 0%, rgba(0, 100, 0, 0.3) 70%)'
              : 'radial-gradient(circle, rgba(0, 200, 255, 0.3) 0%, transparent 70%)'
            : 'rgba(0, 10, 0, 0.8)',
          boxShadow: isPowered ? `inset 0 0 20px ${glowColor}` : 'none',
        }}
        onClick={() => rotatePiece(x, y)}
      >
        {/* Wire SVG */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `rotate(${piece.rotation}deg)`,
            transition: 'transform 0.2s ease-out',
          }}
        >
          {piece.type === 'straight' && (
            <line
              x1="50" y1="0" x2="50" y2="100"
              stroke={baseColor}
              strokeWidth="8"
              style={{
                filter: isPowered ? `drop-shadow(0 0 5px ${glowColor})` : 'none',
              }}
            />
          )}
          {piece.type === 'corner' && (
            <path
              d="M 50 0 L 50 50 L 100 50"
              fill="none"
              stroke={baseColor}
              strokeWidth="8"
              strokeLinecap="round"
              style={{
                filter: isPowered ? `drop-shadow(0 0 5px ${glowColor})` : 'none',
              }}
            />
          )}
          {piece.type === 'tee' && (
            <>
              <line x1="0" y1="50" x2="100" y2="50" stroke={baseColor} strokeWidth="8" />
              <line x1="50" y1="0" x2="50" y2="50" stroke={baseColor} strokeWidth="8" />
            </>
          )}
          {piece.type === 'cross' && (
            <>
              <line x1="0" y1="50" x2="100" y2="50" stroke={baseColor} strokeWidth="8" />
              <line x1="50" y1="0" x2="50" y2="100" stroke={baseColor} strokeWidth="8" />
            </>
          )}
          {/* Source: single line going RIGHT from center */}
          {piece.type === 'source' && (
            <line
              x1="50" y1="50" x2="100" y2="50"
              stroke={baseColor}
              strokeWidth="10"
              strokeLinecap="round"
              style={{
                filter: isPowered ? `drop-shadow(0 0 8px ${glowColor})` : 'none',
              }}
            />
          )}
          {/* Target: single line coming from LEFT to center */}
          {piece.type === 'target' && (
            <line
              x1="0" y1="50" x2="50" y2="50"
              stroke={baseColor}
              strokeWidth="10"
              strokeLinecap="round"
              style={{
                filter: isPowered ? `drop-shadow(0 0 8px ${glowColor})` : 'none',
              }}
            />
          )}

          {/* Center node */}
          <circle
            cx="50" cy="50" r="10"
            fill={isPowered ? 'rgb(0, 255, 65)' : 'rgb(40, 40, 40)'}
            stroke={baseColor}
            strokeWidth="2"
            style={{
              filter: isPowered ? `drop-shadow(0 0 8px ${glowColor})` : 'none',
            }}
          />
        </svg>

        {/* Source/Target icons */}
        {isSource && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-primary text-xs font-bold electrical-flicker" style={{ textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41' }}>PWR</div>
            {/* Source crackling sparks */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="source-spark source-spark-1" />
              <div className="source-spark source-spark-2" />
              <div className="source-spark source-spark-3" />
              <div className="source-spark source-spark-4" />
            </div>
          </div>
        )}
        {isTarget && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`text-xs font-bold ${isPowered ? 'text-primary electrical-flicker' : 'text-accent'}`} style={isPowered ? { textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41' } : {}}>
              VALVE
            </div>
            {/* Target crackling when powered */}
            {isPowered && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="target-spark target-spark-1" />
                <div className="target-spark target-spark-2" />
                <div className="target-spark target-spark-3" />
              </div>
            )}
          </div>
        )}

        {/* Spark effect on click */}
        {hasSpark && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-primary/30 animate-ping" />
          </div>
        )}

        {/* Electrical crackling effect on powered wires */}
        {isPowered && !isSource && !isTarget && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Flickering glow */}
            <div
              className="absolute inset-0 electrical-flicker"
              style={{
                background: 'radial-gradient(circle, rgba(0, 255, 65, 0.3) 0%, transparent 70%)',
              }}
            />
            {/* Traveling sparks */}
            <div className="spark spark-1" />
            <div className="spark spark-2" />
            <div className="spark spark-3" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Title */}
      <div className="text-center mb-4">
        <div className="text-primary text-xl tracking-widest mb-2">
          GAS CONTROL MAINFRAME
        </div>
        <div className="text-primary/60 text-sm">
          CLICK TO ROTATE WIRES • CONNECT PWR → VALVE • GREEN = POWERED
        </div>
      </div>

      {/* Circuit grid - sized to fit on screen */}
      <div
        className="mx-auto border-2 border-primary p-2"
        style={{
          width: '100%',
          maxWidth: gridSize <= 7 ? '400px' : gridSize <= 9 ? '500px' : '580px',
          background: 'rgba(0, 10, 0, 0.9)',
          boxShadow: '0 0 30px rgba(0, 255, 65, 0.2), inset 0 0 20px rgba(0, 255, 65, 0.1)',
        }}
      >
        {/* Scanlines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.1) 2px, rgba(0, 0, 0, 0.1) 4px)',
          }}
        />

        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          }}
        >
          {grid.map((row, y) =>
            row.map((piece, x) => renderWire(piece, x, y))
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
          <span className="text-primary/70">Powered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-600 rounded-full" />
          <span className="text-primary/70">Unpowered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-900/50 rounded" style={{ background: 'repeating-linear-gradient(45deg, rgba(80, 0, 0, 0.6), rgba(80, 0, 0, 0.6) 2px, rgba(40, 0, 0, 0.8) 2px, rgba(40, 0, 0, 0.8) 4px)' }} />
          <span className="text-primary/70">Blocked</span>
        </div>
      </div>

      {/* Solved overlay */}
      {solved && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none">
          <div className="text-center">
            <div className="text-primary text-3xl font-bold animate-pulse mb-2">
              CIRCUIT COMPLETE
            </div>
            <div className="text-accent text-xl">
              VALVE CLOSING...
            </div>
          </div>
        </div>
      )}

      {/* Electrical crackling animation styles */}
      <style>{`
        @keyframes electrical-flicker {
          0%, 100% { opacity: 0.3; }
          10% { opacity: 0.8; }
          20% { opacity: 0.4; }
          30% { opacity: 1; }
          40% { opacity: 0.5; }
          50% { opacity: 0.9; }
          60% { opacity: 0.3; }
          70% { opacity: 0.7; }
          80% { opacity: 0.4; }
          90% { opacity: 0.8; }
        }

        @keyframes spark-travel-1 {
          0% { left: -10%; top: 50%; opacity: 1; }
          50% { left: 50%; top: 30%; opacity: 1; }
          100% { left: 110%; top: 50%; opacity: 0; }
        }

        @keyframes spark-travel-2 {
          0% { left: 50%; top: -10%; opacity: 1; }
          50% { left: 70%; top: 50%; opacity: 1; }
          100% { left: 50%; top: 110%; opacity: 0; }
        }

        @keyframes spark-travel-3 {
          0% { left: 110%; top: 50%; opacity: 1; }
          50% { left: 50%; top: 70%; opacity: 1; }
          100% { left: -10%; top: 50%; opacity: 0; }
        }

        .electrical-flicker {
          animation: electrical-flicker 0.15s infinite;
        }

        .spark {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #00ff41;
          border-radius: 50%;
          box-shadow: 0 0 6px 2px rgba(0, 255, 65, 0.9),
                      0 0 12px 4px rgba(0, 255, 65, 0.5),
                      0 0 18px 6px rgba(0, 255, 65, 0.3);
        }

        .spark-1 {
          animation: spark-travel-1 0.8s infinite linear;
          animation-delay: 0s;
        }

        .spark-2 {
          animation: spark-travel-2 0.6s infinite linear;
          animation-delay: 0.2s;
        }

        .spark-3 {
          animation: spark-travel-3 0.7s infinite linear;
          animation-delay: 0.4s;
        }

        /* Source cell crackling - more intense */
        @keyframes source-crackle-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
          10% { transform: translate(15px, -5px) scale(1.5); opacity: 1; }
          20% { transform: translate(20px, 5px) scale(0.8); opacity: 0.8; }
          30% { opacity: 0; }
        }

        @keyframes source-crackle-2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
          15% { transform: translate(10px, 10px) scale(1.2); opacity: 1; }
          30% { transform: translate(18px, 8px) scale(0.6); opacity: 0.6; }
          40% { opacity: 0; }
        }

        @keyframes source-crackle-3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
          20% { transform: translate(12px, -8px) scale(1.8); opacity: 1; }
          35% { transform: translate(22px, -3px) scale(0.5); opacity: 0.5; }
          45% { opacity: 0; }
        }

        @keyframes source-crackle-4 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
          25% { transform: translate(8px, 12px) scale(1.3); opacity: 1; }
          40% { transform: translate(16px, 6px) scale(0.7); opacity: 0.7; }
          50% { opacity: 0; }
        }

        .source-spark {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 3px;
          height: 3px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 4px 2px #00ff41,
                      0 0 8px 4px rgba(0, 255, 65, 0.8),
                      0 0 12px 6px rgba(0, 255, 65, 0.4);
        }

        .source-spark-1 { animation: source-crackle-1 0.4s infinite; }
        .source-spark-2 { animation: source-crackle-2 0.5s infinite 0.1s; }
        .source-spark-3 { animation: source-crackle-3 0.45s infinite 0.2s; }
        .source-spark-4 { animation: source-crackle-4 0.55s infinite 0.15s; }

        /* Target cell crackling when powered - sparks coming in from left */
        @keyframes target-crackle-1 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
          10% { transform: translate(-15px, -5px) scale(1.5); opacity: 1; }
          20% { transform: translate(-8px, 2px) scale(1); opacity: 0.8; }
          30% { transform: translate(0, 0) scale(0.5); opacity: 0; }
        }

        @keyframes target-crackle-2 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
          15% { transform: translate(-12px, 8px) scale(1.3); opacity: 1; }
          30% { transform: translate(-5px, 3px) scale(0.8); opacity: 0.6; }
          40% { opacity: 0; }
        }

        @keyframes target-crackle-3 {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0; }
          20% { transform: translate(-18px, -3px) scale(1.6); opacity: 1; }
          35% { transform: translate(-6px, 0px) scale(0.6); opacity: 0.5; }
          45% { opacity: 0; }
        }

        .target-spark {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 4px;
          height: 4px;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 0 6px 3px #00ff41,
                      0 0 12px 6px rgba(0, 255, 65, 0.8),
                      0 0 20px 10px rgba(0, 255, 65, 0.4);
        }

        .target-spark-1 { animation: target-crackle-1 0.35s infinite; }
        .target-spark-2 { animation: target-crackle-2 0.4s infinite 0.12s; }
        .target-spark-3 { animation: target-crackle-3 0.38s infinite 0.25s; }
      `}</style>
    </div>
  );
};

export default CircuitPuzzle;
