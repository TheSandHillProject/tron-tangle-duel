
// Types for our game
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Position = { x: number; y: number };
export type Player = {
  id: number;
  position: Position;
  direction: Direction;
  nextDirection: Direction;
  color: string;
  score: number;
  trail: Position[];
  isAlive: boolean;
};

export type GameState = {
  players: Player[];
  gridSize: { width: number; height: number };
  cellSize: number;
  isGameOver: boolean;
  isGamePaused: boolean;
  winner: number | null;
  round: number;
};

// Initialize players
export const initializePlayers = (gridSize: { width: number; height: number }): Player[] => {
  // Player 1 starts from the left side, moving right
  const player1: Player = {
    id: 1,
    position: { x: Math.floor(gridSize.width * 0.25), y: Math.floor(gridSize.height / 2) },
    direction: 'RIGHT',
    nextDirection: 'RIGHT',
    color: 'player-blue',
    score: 0,
    trail: [],
    isAlive: true,
  };

  // Player 2 starts from the right side, moving left
  const player2: Player = {
    id: 2,
    position: { x: Math.floor(gridSize.width * 0.75), y: Math.floor(gridSize.height / 2) },
    direction: 'LEFT',
    nextDirection: 'LEFT',
    color: 'player-orange',
    score: 0,
    trail: [],
    isAlive: true,
  };

  return [player1, player2];
};

// Initial game state
export const initialGameState = (
  gridWidth: number = 40,
  gridHeight: number = 30,
  cellSize: number = 15
): GameState => {
  const gridSize = { width: gridWidth, height: gridHeight };
  return {
    players: initializePlayers(gridSize),
    gridSize,
    cellSize,
    isGameOver: false,
    isGamePaused: false,
    winner: null,
    round: 1,
  };
};

// Update player position based on direction
export const updatePlayerPosition = (player: Player): Position => {
  // Apply the next direction as the current direction
  player.direction = player.nextDirection;

  const { x, y } = player.position;
  switch (player.direction) {
    case 'UP':
      return { x, y: y - 1 };
    case 'DOWN':
      return { x, y: y + 1 };
    case 'LEFT':
      return { x: x - 1, y };
    case 'RIGHT':
      return { x: x + 1, y };
    default:
      return { x, y };
  }
};

// Check if position is out of bounds
export const isOutOfBounds = (position: Position, gridSize: { width: number; height: number }): boolean => {
  return (
    position.x < 0 || 
    position.x >= gridSize.width || 
    position.y < 0 || 
    position.y >= gridSize.height
  );
};

// Check if position collides with a trail
export const checkCollision = (position: Position, trails: Position[][]): boolean => {
  return trails.some(trail => 
    trail.some(pos => pos.x === position.x && pos.y === position.y)
  );
};

// Check if position is equal to another position
export const arePositionsEqual = (pos1: Position, pos2: Position): boolean => {
  return pos1.x === pos2.x && pos1.y === pos2.y;
};

// Reset the game for a new round
export const resetRound = (gameState: GameState): GameState => {
  const newPlayers = initializePlayers(gameState.gridSize);
  
  // Preserve scores from previous round
  newPlayers[0].score = gameState.players[0].score;
  newPlayers[1].score = gameState.players[1].score;
  
  return {
    ...gameState,
    players: newPlayers,
    isGameOver: false,
    winner: null,
  };
};

// Reset the entire game
export const resetGame = (gridWidth: number = 40, gridHeight: number = 30, cellSize: number = 15): GameState => {
  return initialGameState(gridWidth, gridHeight, cellSize);
};

// Get opposite direction
export const getOppositeDirection = (direction: Direction): Direction => {
  switch (direction) {
    case 'UP': return 'DOWN';
    case 'DOWN': return 'UP';
    case 'LEFT': return 'RIGHT';
    case 'RIGHT': return 'LEFT';
  }
};

// Check if direction change is valid (can't go directly opposite)
export const isValidDirectionChange = (currentDirection: Direction, newDirection: Direction): boolean => {
  return getOppositeDirection(currentDirection) !== newDirection;
};
