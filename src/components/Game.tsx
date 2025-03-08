import React, { useState, useEffect, useRef, useCallback } from 'react';
import PlayerScore from './PlayerScore';
import GameControls from './GameControls';
import GameModeSelector from './GameModeSelector';
import SpeedControl from './SpeedControl';
import GameSetup from './GameSetup';
import { 
  Direction, GameState, Position, Player, Token, Bullet, PurpleBullet, HydroTron,
  initialGameState, updatePlayerPosition, isOutOfBounds, 
  checkCollision, arePositionsEqual, resetRound, resetGame,
  isValidDirectionChange, generateRandomPosition, updateBulletPosition,
  checkBulletTrailCollision, removeTrailSegment, generatePurpleBulletPosition,
  generateHydroTronPosition
} from '@/utils/gameUtils';

interface GameProps {
  initialGameMode?: 'single' | 'two';
  onGameModeChange?: (mode: 'single' | 'two') => void;
}

const BASE_GAME_SPEED = 100; // base milliseconds between game updates
const DEFAULT_GRID_WIDTH = 50;
const DEFAULT_GRID_HEIGHT = 50;
const DEFAULT_CELL_SIZE = 12;
const BULLET_SPEED = 2; // Bullets move faster than players
const NEUTRON_BOMB_THRESHOLD = 10; // Bullets required to generate a purple bullet

const Game: React.FC<GameProps> = ({ initialGameMode = 'two', onGameModeChange }) => {
  // Game mode state (single or two player)
  const [gameMode, setGameMode] = useState<'single' | 'two'>(initialGameMode);
  
  // Speed multiplier (1x, 2x, 3x, 4x)
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  
  // Grid configuration
  const [gridWidth, setGridWidth] = useState<number>(DEFAULT_GRID_WIDTH);
  const [gridHeight, setGridHeight] = useState<number>(DEFAULT_GRID_HEIGHT);
  const [framesPerSecond, setFramesPerSecond] = useState<number>(2); // Default is 2 FPS
  
  // Setup state - true when configuring game, false when playing
  const [isSetup, setIsSetup] = useState<boolean>(true);
  
  // Calculate actual game speed based on FPS (milliseconds per frame)
  const GAME_SPEED = Math.round(1000 / framesPerSecond);
  
  // Game state
  const [gameState, setGameState] = useState<GameState>(() => 
    initialGameState(gridWidth, gridHeight, DEFAULT_CELL_SIZE, gameMode === 'single')
  );
  
  // High score for single player mode (max bullets collected)
  const [highScore, setHighScore] = useState<number>(0);
  
  // Bullets collected in current round for single player
  const [bulletsCollected, setBulletsCollected] = useState<number>(0);
  
  // Game loop timer reference
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  
  // Canvas reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game dimensions
  const canvasWidth = gameState.gridSize.width * gameState.cellSize;
  const canvasHeight = gameState.gridSize.height * gameState.cellSize;
  
  // Apply game configuration and start the game
  const applyGameSetup = (width: number, height: number, fps: number) => {
    setGridWidth(width);
    setGridHeight(height);
    setFramesPerSecond(fps);
    
    // Initialize game state with new grid size
    setGameState(initialGameState(width, height, DEFAULT_CELL_SIZE, gameMode === 'single'));
    
    // Exit setup mode
    setIsSetup(false);
    
    // Reset bullets collected for single player
    if (gameMode === 'single') {
      setBulletsCollected(0);
    }
  };
  
  // Handle game mode change
  const handleGameModeChange = (mode: 'single' | 'two') => {
    setGameMode(mode);
    setGameState(initialGameState(gridWidth, gridHeight, DEFAULT_CELL_SIZE, mode === 'single'));
    
    // Reset bullets collected for single player
    if (mode === 'single') {
      setBulletsCollected(0);
    }
    
    // Call the parent component's handler if provided
    if (onGameModeChange) {
      onGameModeChange(mode);
    }
  };
  
  // Effect to reset game state when initialGameMode changes
  useEffect(() => {
    setGameMode(initialGameMode);
    setGameState(initialGameState(gridWidth, gridHeight, DEFAULT_CELL_SIZE, initialGameMode === 'single'));
    
    // Reset bullets collected for single player
    if (initialGameMode === 'single') {
      setBulletsCollected(0);
    }
  }, [initialGameMode]);
  
  // Load high score from localStorage on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('tronHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
  }, []);
  
  // Handle neutron bomb deployment
  const handleDeployNeutronBomb = () => {
    setGameState(prevState => {
      // Only works in single player mode
      if (gameMode !== 'single') return prevState;
      
      const player = prevState.players[0];
      
      // Player must be alive and have at least one neutron bomb
      if (!player.isAlive || player.neutronBombs <= 0) return prevState;
      
      // Clone current game state
      const newPlayers = [...prevState.players];
      
      // Update player - decrease neutron bomb count by 1
      newPlayers[0] = {
        ...player,
        neutronBombs: player.neutronBombs - 1,
        // Clear the player's trail
        trail: []
      };
      
      // Add an extra token to the game
      let newTokens = [...prevState.tokens];
      
      // Get all occupied positions
      const occupiedPositions = [
        ...newPlayers.map(p => p.position),
        ...newTokens.map(t => t.position)
      ];
      
      // Generate a position for the new token
      const newTokenPosition = generateRandomPosition(
        prevState.gridSize,
        occupiedPositions
      );
      
      // Add new token
      newTokens.push({
        position: newTokenPosition,
        collected: false
      });
      
      // Return updated game state
      return {
        ...prevState,
        players: newPlayers,
        tokens: newTokens
      };
    });
  };
  
  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // If in setup mode, don't handle game controls
    if (isSetup) return;
    
    // Prevent default browser scrolling when using arrow keys, space, or WASD
    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 's', 'a', 'd', '1', '2'].includes(e.key)
    ) {
      e.preventDefault();
    }
    
    const { players } = gameState;
    const [player1, player2] = players;
    
    // Clone the current game state to avoid direct mutation
    const newPlayers = [...players];
    
    // Single player mode - use arrow keys for player 1
    if (gameMode === 'single' && player1.isAlive) {
      if (e.key === 'ArrowUp' && isValidDirectionChange(player1.direction, 'UP')) {
        newPlayers[0] = { ...player1, nextDirection: 'UP' };
      } else if (e.key === 'ArrowDown' && isValidDirectionChange(player1.direction, 'DOWN')) {
        newPlayers[0] = { ...player1, nextDirection: 'DOWN' };
      } else if (e.key === 'ArrowLeft' && isValidDirectionChange(player1.direction, 'LEFT')) {
        newPlayers[0] = { ...player1, nextDirection: 'LEFT' };
      } else if (e.key === 'ArrowRight' && isValidDirectionChange(player1.direction, 'RIGHT')) {
        newPlayers[0] = { ...player1, nextDirection: 'RIGHT' };
      } 
      // Player 1 shoot (1 key in both modes)
      else if (e.key === '1' && player1.bullets > 0) {
        handlePlayerShoot(1);
        return;
      }
      // Player 1 use Neutron Bomb (2 key in single player mode)
      else if (e.key === '2' && player1.neutronBombs > 0) {
        handleDeployNeutronBomb();
        return;
      }
    }
    // Two player mode - use WASD for player 1
    else if (gameMode === 'two' && player1.isAlive) {
      if (e.key === 'w' && isValidDirectionChange(player1.direction, 'UP')) {
        newPlayers[0] = { ...player1, nextDirection: 'UP' };
      } else if (e.key === 's' && isValidDirectionChange(player1.direction, 'DOWN')) {
        newPlayers[0] = { ...player1, nextDirection: 'DOWN' };
      } else if (e.key === 'a' && isValidDirectionChange(player1.direction, 'LEFT')) {
        newPlayers[0] = { ...player1, nextDirection: 'LEFT' };
      } else if (e.key === 'd' && isValidDirectionChange(player1.direction, 'RIGHT')) {
        newPlayers[0] = { ...player1, nextDirection: 'RIGHT' };
      } 
      // Player 1 shoot (1 key)
      else if (e.key === '1' && player1.bullets > 0) {
        handlePlayerShoot(1);
        return;
      }
    }
    
    // Player 2 controls (Arrow keys) - only in two-player mode
    if (gameMode === 'two' && player2 && player2.isAlive) {
      if (e.key === 'ArrowUp' && isValidDirectionChange(player2.direction, 'UP')) {
        newPlayers[1] = { ...player2, nextDirection: 'UP' };
      } else if (e.key === 'ArrowDown' && isValidDirectionChange(player2.direction, 'DOWN')) {
        newPlayers[1] = { ...player2, nextDirection: 'DOWN' };
      } else if (e.key === 'ArrowLeft' && isValidDirectionChange(player2.direction, 'LEFT')) {
        newPlayers[1] = { ...player2, nextDirection: 'LEFT' };
      } else if (e.key === 'ArrowRight' && isValidDirectionChange(player2.direction, 'RIGHT')) {
        newPlayers[1] = { ...player2, nextDirection: 'RIGHT' };
      } 
      // Player 2 shoot (/ key)
      else if (e.key === '/' && player2.bullets > 0) {
        handlePlayerShoot(2);
        return;
      }
    }
    
    // Pause game on spacebar
    if (e.key === ' ' && !gameState.isGameOver) {
      setGameState(prevState => ({
        ...prevState,
        isGamePaused: !prevState.isGamePaused
      }));
      return;
    }
    
    // Update game state with new player directions
    setGameState(prevState => ({
      ...prevState,
      players: newPlayers
    }));
  }, [gameState, gameMode, isSetup]);
  
  // Handle player shooting
  const handlePlayerShoot = (playerId: number) => {
    setGameState(prevState => {
      const playerIndex = playerId - 1;
      const player = prevState.players[playerIndex];
      
      // Only shoot if player has bullets
      if (player.bullets <= 0) return prevState;
      
      // Create a copy of the players array
      const newPlayers = [...prevState.players];
      
      // Create a new bullet
      const newBullet: Bullet = {
        position: { ...player.position },
        direction: player.direction,
        playerId: player.id,
        active: true
      };
      
      // Reduce player's bullet count
      newPlayers[playerIndex] = {
        ...player,
        bullets: player.bullets - 1
      };
      
      // Add the bullet to the game state
      return {
        ...prevState,
        players: newPlayers,
        bullets: [...prevState.bullets, newBullet]
      };
    });
  };
  
  // Initialize game
  useEffect(() => {
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Start game loop if not in setup mode
    if (!isSetup) {
      startGameLoop();
    }
    
    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [handleKeyDown, gameMode, isSetup]);
  
  // Effect to reset game state when game mode changes
  useEffect(() => {
    setGameState(initialGameState(gridWidth, gridHeight, DEFAULT_CELL_SIZE, gameMode === 'single'));
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    if (!isSetup) {
      startGameLoop();
    }
    
    // Reset bullets collected for single player
    if (gameMode === 'single') {
      setBulletsCollected(0);
    }
  }, [gameMode, gridWidth, gridHeight, isSetup]);
  
  // Draw game on canvas
  useEffect(() => {
    if (!isSetup) {
      drawGame();
    }
  }, [gameState, isSetup]);
  
  // Start game loop
  const startGameLoop = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    gameLoopRef.current = setInterval(() => {
      if (!gameState.isGamePaused && !gameState.isGameOver) {
        updateGame();
      }
    }, GAME_SPEED);
  };
  
  // Update game state
  const updateGame = () => {
    setGameState(prevState => {
      // Clone the current state
      const { players, gridSize, tokens, bullets, purpleBullet, hydroTrons } = prevState;
      const newPlayers = [...players].map(player => ({ ...player }));
      const newTokens = [...tokens];
      const newBullets = [...bullets];
      const newHydroTrons = [...hydroTrons];
      const occupiedPositions: Position[] = [];
      let tokensCollectedThisUpdate = 0;
      let purpleBulletCollected = false;
      let newPurpleBullet = purpleBullet;
      
      // Check if we need to spawn HydroTron tokens (in single player mode only)
      if (gameMode === 'single' && newPlayers[0].neutronBombs >= 2) {
        // Calculate how many HydroTron tokens should exist
        const desiredHydroTronCount = Math.floor(newPlayers[0].neutronBombs / 2);
        
        // If we don't have enough, add more
        if (newHydroTrons.length < desiredHydroTronCount) {
          // Generate positions for placing new HydroTron tokens
          const allPositions = [
            ...newPlayers.map(p => p.position),
            ...newPlayers.flatMap(p => p.trail),
            ...newTokens.filter(t => !t.collected).map(t => t.position),
            ...newHydroTrons.map(h => h.position)
          ];
          
          if (newPurpleBullet && !newPurpleBullet.collected) {
            allPositions.push(newPurpleBullet.position);
          }
          
          // Add new HydroTron tokens until we have the desired count
          while (newHydroTrons.length < desiredHydroTronCount) {
            const newPosition = generateHydroTronPosition(gridSize, allPositions);
            newHydroTrons.push({
              position: newPosition,
              collected: false
            });
            allPositions.push(newPosition);
          }
        }
      }
      
      // Check if we need to spawn a purple bullet (in single player mode only)
      if (gameMode === 'single' && 
          newPlayers[0].bullets >= NEUTRON_BOMB_THRESHOLD && 
          !newPurpleBullet) {
        // Generate positions for placing the purple bullet
        const allPositions = [
          ...newPlayers.map(p => p.position),
          ...newPlayers.flatMap(p => p.trail),
          ...newTokens.filter(t => !t.collected).map(t => t.position)
        ];
        
        // Place purple bullet
        newPurpleBullet = {
          position: generatePurpleBulletPosition(gridSize, allPositions),
          collected: false
        };
      }
      
      // Check for token collection, purple bullet collection, and HydroTron collection
      for (let i = 0; i < newPlayers.length; i++) {
        if (!newPlayers[i].isAlive) continue;
        
        // Check if player collected any tokens
        for (let j = 0; j < newTokens.length; j++) {
          if (!newTokens[j].collected && arePositionsEqual(newPlayers[i].position, newTokens[j].position)) {
            // Collect token (mark as collected)
            newTokens[j].collected = true;
            
            // Increment player's bullet count
            newPlayers[i].bullets += 1;
            
            // For single player mode, track bullets collected
            if (gameMode === 'single' && i === 0) {
              tokensCollectedThisUpdate += 1;
            }
            
            // Generate a new token
            const allPositions = [
              ...newPlayers.map(p => p.position),
              ...newPlayers.flatMap(p => p.trail),
              ...newTokens.filter(t => !t.collected).map(t => t.position)
            ];
            
            if (newPurpleBullet && !newPurpleBullet.collected) {
              allPositions.push(newPurpleBullet.position);
            }
            
            const newTokenPosition = generateRandomPosition(gridSize, allPositions);
            newTokens.push({
              position: newTokenPosition,
              collected: false
            });
            
            break;
          }
        }
        
        // Check if player collected the purple bullet
        if (newPurpleBullet && !newPurpleBullet.collected && 
            arePositionsEqual(newPlayers[i].position, newPurpleBullet.position)) {
          
          // Only works in single player mode
          if (gameMode === 'single' && i === 0) {
            // Mark purple bullet as collected
            newPurpleBullet.collected = true;
            purpleBulletCollected = true;
            
            // Decrease player's bullet count and add a neutron bomb
            newPlayers[i].bullets -= NEUTRON_BOMB_THRESHOLD;
            newPlayers[i].neutronBombs += 1;
          }
        }
        
        // Check if player collected any HydroTron tokens
        for (let j = 0; j < newHydroTrons.length; j++) {
          if (!newHydroTrons[j].collected && 
              arePositionsEqual(newPlayers[i].position, newHydroTrons[j].position)) {
            // Only works in single player mode
            if (gameMode === 'single' && i === 0) {
              // Mark HydroTron as collected
              newHydroTrons[j].collected = true;
              
              // Decrease neutron bombs by 2 when collecting a HydroTron
              newPlayers[i].neutronBombs = Math.max(0, newPlayers[i].neutronBombs - 2);
              
              // Add an extra token to the game
              const allPositions = [
                ...newPlayers.map(p => p.position),
                ...newPlayers.flatMap(p => p.trail),
                ...newTokens.map(t => t.position),
                ...newHydroTrons.map(h => h.position)
              ];
              
              if (newPurpleBullet && !newPurpleBullet.collected) {
                allPositions.push(newPurpleBullet.position);
              }
              
              const newTokenPosition = generateRandomPosition(gridSize, allPositions);
              newTokens.push({
                position: newTokenPosition,
                collected: false
              });
              
              // Add another token for good measure
              const anotherTokenPosition = generateRandomPosition(gridSize, [...allPositions, newTokenPosition]);
              newTokens.push({
                position: anotherTokenPosition,
                collected: false
              });
              
              break;
            }
          }
        }
      }
      
      // Update bullets collected counter for single player mode
      if (gameMode === 'single' && tokensCollectedThisUpdate > 0) {
        setBulletsCollected(prev => {
          const newTotal = prev + tokensCollectedThisUpdate;
          
          // Update high score if needed
          if (newTotal > highScore) {
            setHighScore(newTotal);
            localStorage.setItem('tronHighScore', newTotal.toString());
          }
          
          return newTotal;
        });
      }
      
      // Update each player
      for (let i = 0; i < newPlayers.length; i++) {
        if (!newPlayers[i].isAlive) continue;
        
        // Add current position to trail
        newPlayers[i].trail = [...newPlayers[i].trail, { ...newPlayers[i].position }];
        occupiedPositions.push({ ...newPlayers[i].position });
        
        // Calculate new position
        const newPosition = updatePlayerPosition(newPlayers[i]);
        
        // Check for collisions
        // 1. Wall collision
        if (isOutOfBounds(newPosition, gridSize)) {
          newPlayers[i].isAlive = false;
          continue;
        }
        
        // 2. Trail collision (including self)
        const allTrails = newPlayers.map(p => p.trail);
        if (checkCollision(newPosition, allTrails)) {
          newPlayers[i].isAlive = false;
          continue;
        }
        
        // 3. Head-on collision with other player (only in two-player mode)
        if (gameMode === 'two') {
          for (let j = 0; j < newPlayers.length; j++) {
            if (i !== j && newPlayers[j].isAlive && arePositionsEqual(newPosition, newPlayers[j].position)) {
              // Both players collide, both die
              newPlayers[i].isAlive = false;
              newPlayers[j].isAlive = false;
              break;
            }
          }
        }
        
        // Update player position if still alive
        if (newPlayers[i].isAlive) {
          newPlayers[i].position = newPosition;
        }
      }
      
      // Update bullets
      for (let b = 0; b < newBullets.length; b++) {
        if (!newBullets[b].active) continue;
        
        // Update bullet position
        for (let step = 0; step < BULLET_SPEED; step++) {
          // Only process active bullets
          if (!newBullets[b].active) break;
          
          const newPosition = updateBulletPosition(newBullets[b]);
          
          // Check if bullet is out of bounds
          if (isOutOfBounds(newPosition, gridSize)) {
            newBullets[b].active = false;
            break;
          }
          
          // Check if bullet hit a player's trail
          let hitPlayerIndex = -1;
          let hitTrailIndex = -1;
          
          for (let p = 0; p < newPlayers.length; p++) {
            // Allow players to hit their own trail now (removing this skip check)
            // if (newPlayers[p].id === newBullets[b].playerId) continue;
            
            const trailHitIndex = checkBulletTrailCollision(newPosition, newPlayers[p].trail);
            if (trailHitIndex !== -1) {
              hitPlayerIndex = p;
              hitTrailIndex = trailHitIndex;
              break;
            }
          }
          
          // If bullet hit a trail
          if (hitPlayerIndex !== -1 && hitTrailIndex !== -1) {
            // Cut the trail from the hit point
            newPlayers[hitPlayerIndex].trail = removeTrailSegment(
              newPlayers[hitPlayerIndex].trail, 
              hitTrailIndex
            );
            
            // Deactivate the bullet
            newBullets[b].active = false;
            break;
          }
          
          // Update bullet position if still active
          if (newBullets[b].active) {
            newBullets[b].position = newPosition;
          }
        }
      }
      
      // Filter out inactive bullets, collected tokens, and collected HydroTrons
      const activeBullets = newBullets.filter(b => b.active);
      const availableTokens = newTokens.filter(t => !t.collected);
      const availableHydroTrons = newHydroTrons.filter(h => !h.collected);
      
      // Check game over conditions
      const alivePlayers = newPlayers.filter(p => p.isAlive);
      let isGameOver = false;
      let winner: number | null = null;
      
      if (alivePlayers.length === 0) {
        // Draw - no players alive (only possible in two-player mode)
        isGameOver = true;
        winner = null;
      } else if (gameMode === 'two' && alivePlayers.length === 1) {
        // One player wins (in two-player mode)
        isGameOver = true;
        winner = alivePlayers[0].id;
        
        // Update winner's score
        const winnerIndex = newPlayers.findIndex(p => p.id === winner);
        if (winnerIndex !== -1) {
          newPlayers[winnerIndex].score += 1;
        }
      } else if (gameMode === 'single' && alivePlayers.length === 0) {
        // Game over in single-player mode
        isGameOver = true;
      }
      
      return {
        ...prevState,
        players: newPlayers,
        tokens: availableTokens.length > 0 ? availableTokens : prevState.tokens,
        bullets: activeBullets,
        purpleBullet: purpleBulletCollected ? null : newPurpleBullet,
        hydroTrons: availableHydroTrons,
        isGameOver,
        winner
      };
    });
  };
  
  // Draw game on canvas
  const drawGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { players, gridSize, cellSize, tokens, bullets, purpleBullet, hydroTrons } = gameState;
    
    // Clear canvas
    ctx.fillStyle = '#0B1622';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    ctx.strokeStyle = 'rgba(26, 42, 58, 0.3)';
    ctx.lineWidth = 0.5;
    
    // Draw vertical grid lines
    for (let x = 0; x <= gridSize.width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize, 0);
      ctx.lineTo(x * cellSize, gridSize.height * cellSize);
      ctx.stroke();
    }
    
    // Draw horizontal grid lines
    for (let y = 0; y <= gridSize.height; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * cellSize);
      ctx.lineTo(gridSize.width * cellSize, y * cellSize);
      ctx.stroke();
    }
    
    // Draw tokens
    tokens.forEach(token => {
      if (token.collected) return;
      
      // Draw token
      ctx.fillStyle = '#FFFF00';
      ctx.shadowColor = '#FFFF00';
      ctx.shadowBlur = 10;
      
      // Draw circular token
      ctx.beginPath();
      ctx.arc(
        token.position.x * cellSize + cellSize / 2,
        token.position.y * cellSize + cellSize / 2,
        cellSize / 2 - 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
    
    // Draw purple bullet if it exists
    if (purpleBullet && !purpleBullet.collected) {
      ctx.fillStyle = '#BB00FF'; // Purple color
      ctx.shadowColor = '#BB00FF';
      ctx.shadowBlur = 15;
      
      // Draw circular purple bullet (slightly larger than normal tokens)
      ctx.beginPath();
      ctx.arc(
        purpleBullet.position.x * cellSize + cellSize / 2,
        purpleBullet.position.y * cellSize + cellSize / 2,
        cellSize / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Add a pulsing effect
      ctx.strokeStyle = '#BB00FF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        purpleBullet.position.x * cellSize + cellSize / 2,
        purpleBullet.position.y * cellSize + cellSize / 2,
        cellSize / 2 + 2 + Math.sin(Date.now() / 200) * 2,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    
    // Draw HydroTron tokens
    hydroTrons.forEach(hydroTron => {
      if (hydroTron.collected) return;
      
      ctx.fillStyle = '#F2FCE2'; // Soft green
      ctx.shadowColor = '#F2FCE2';
      ctx.shadowBlur = 15;
      
      // Draw circular HydroTron token
      ctx.beginPath();
      ctx.arc(
        hydroTron.position.x * cellSize + cellSize / 2,
        hydroTron.position.y * cellSize + cellSize / 2,
        cellSize / 2 - 1,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Add a pulsing effect with a green glow
      ctx.strokeStyle = '#4DFF4D';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(
        hydroTron.position.x * cellSize + cellSize / 2,
        hydroTron.position.y * cellSize + cellSize / 2,
        cellSize / 2 + 3 + Math.sin(Date.now() / 150) * 2,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    });
    
    // Draw player trails
    players.forEach(player => {
      // Set trail color based on player
      if (player.id === 1) {
        ctx.fillStyle = '#0CD0FF';
        ctx.shadowColor = '#0CD0FF';
      } else {
        ctx.fillStyle = '#FF9900';
        ctx.shadowColor = '#FF9900';
      }
      
      ctx.shadowBlur = 5;
      
      // Draw trail
      player.trail.forEach(pos => {
        ctx.fillRect(
          pos.x * cellSize + 1, 
          pos.y * cellSize + 1, 
          cellSize - 2, 
          cellSize - 2
        );
      });
      
      // Draw current position (head) if player is alive
      if (player.isAlive) {
        // Make head slightly brighter
        if (player.id === 1) {
          ctx.fillStyle = '#4FDFFF';
          ctx.shadowColor = '#4FDFFF';
        } else {
          ctx.fillStyle = '#FFBB4D';
          ctx.shadowColor = '#FFBB4D';
        }
        
        ctx.shadowBlur = 10;
        
        ctx.fillRect(
          player.position.x * cellSize, 
          player.position.y * cellSize, 
          cellSize, 
          cellSize
        );
      }
    });
    
    // Draw bullets
    bullets.forEach(bullet => {
      if (!bullet.active) return;
      
      // Set bullet color based on player
      if (bullet.playerId === 1) {
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#0CD0FF';
      } else {
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FF9900';
      }
      
      ctx.shadowBlur = 15;
      
      // Draw circular bullet
      ctx.beginPath();
      ctx.arc(
        bullet.position.x * cellSize + cellSize / 2,
        bullet.position.y * cellSize + cellSize / 2,
        cellSize / 3,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
    
    // Reset shadow
    ctx.shadowBlur = 0;
  };
  
  // Game control handlers
  const handleStartNewGame = () => {
    // Reset entire game and go back to setup
    setIsSetup(true);
    setGameState(resetGame(gridWidth, gridHeight, DEFAULT_CELL_SIZE, gameMode === 'single'));
    
    // Reset bullets collected for single player
    if (gameMode === 'single') {
      setBulletsCollected(0);
    }
  };
  
  const handleResetRound = () => {
    // Reset current round
    setGameState(prevState => {
      const newState = resetRound(prevState, gameMode === 'single');
      return {
        ...newState,
        round: prevState.round + 1
      };
    });
    
    // Reset bullets collected for single player
    if (gameMode === 'single') {
      setBulletsCollected(0);
    }
  };
  
  const handlePauseGame = () => {
    setGameState(prevState => ({
      ...prevState,
      isGamePaused: true
    }));
  };
  
  const handleResumeGame = () => {
    setGameState(prevState => ({
      ...prevState,
      isGamePaused: false
    }));
  };
  
  const handleSpeedChange = (newSpeed: number) => {
    setSpeedMultiplier(newSpeed);
    
    // Restart game loop with new speed
    if (gameLoopRef.current) {
      clearInterval(
