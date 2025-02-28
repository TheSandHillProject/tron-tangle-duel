
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import PlayerScore from './PlayerScore';
import GameControls from './GameControls';
import { 
  Direction, GameState, Position, Player,
  initialGameState, updatePlayerPosition, isOutOfBounds, 
  checkCollision, arePositionsEqual, resetRound, resetGame,
  isValidDirectionChange
} from '@/utils/gameUtils';

const GAME_SPEED = 100; // milliseconds between game updates
const GRID_WIDTH = 40;
const GRID_HEIGHT = 30;
const CELL_SIZE = 15;

const Game: React.FC = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>(
    initialGameState(GRID_WIDTH, GRID_HEIGHT, CELL_SIZE)
  );
  
  // Game loop timer reference
  const gameLoopRef = useRef<number | null>(null);
  
  // Canvas reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game dimensions
  const canvasWidth = gameState.gridSize.width * gameState.cellSize;
  const canvasHeight = gameState.gridSize.height * gameState.cellSize;
  
  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const { players } = gameState;
    const [player1, player2] = players;
    
    // Clone the current game state to avoid direct mutation
    const newPlayers = [...players];
    
    // Player 1 controls (WASD)
    if (!player1.isAlive) return;
    
    if (e.key === 'w' && isValidDirectionChange(player1.direction, 'UP')) {
      newPlayers[0] = { ...player1, nextDirection: 'UP' };
    } else if (e.key === 's' && isValidDirectionChange(player1.direction, 'DOWN')) {
      newPlayers[0] = { ...player1, nextDirection: 'DOWN' };
    } else if (e.key === 'a' && isValidDirectionChange(player1.direction, 'LEFT')) {
      newPlayers[0] = { ...player1, nextDirection: 'LEFT' };
    } else if (e.key === 'd' && isValidDirectionChange(player1.direction, 'RIGHT')) {
      newPlayers[0] = { ...player1, nextDirection: 'RIGHT' };
    }
    
    // Player 2 controls (Arrow keys)
    if (!player2.isAlive) return;
    
    if (e.key === 'ArrowUp' && isValidDirectionChange(player2.direction, 'UP')) {
      newPlayers[1] = { ...player2, nextDirection: 'UP' };
    } else if (e.key === 'ArrowDown' && isValidDirectionChange(player2.direction, 'DOWN')) {
      newPlayers[1] = { ...player2, nextDirection: 'DOWN' };
    } else if (e.key === 'ArrowLeft' && isValidDirectionChange(player2.direction, 'LEFT')) {
      newPlayers[1] = { ...player2, nextDirection: 'LEFT' };
    } else if (e.key === 'ArrowRight' && isValidDirectionChange(player2.direction, 'RIGHT')) {
      newPlayers[1] = { ...player2, nextDirection: 'RIGHT' };
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
  }, [gameState]);
  
  // Initialize game
  useEffect(() => {
    // Add keyboard event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Start game loop
    startGameLoop();
    
    // Display initial toast
    toast.info("Player 1: WASD keys | Player 2: Arrow keys | Space: Pause", {
      duration: 5000,
    });
    
    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [handleKeyDown]);
  
  // Draw game on canvas
  useEffect(() => {
    drawGame();
  }, [gameState]);
  
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
      const { players, gridSize } = prevState;
      const newPlayers = [...players].map(player => ({ ...player }));
      
      // Update each player
      for (let i = 0; i < newPlayers.length; i++) {
        if (!newPlayers[i].isAlive) continue;
        
        // Add current position to trail
        newPlayers[i].trail = [...newPlayers[i].trail, { ...newPlayers[i].position }];
        
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
        
        // 3. Head-on collision with other player
        for (let j = 0; j < newPlayers.length; j++) {
          if (i !== j && newPlayers[j].isAlive && arePositionsEqual(newPosition, newPlayers[j].position)) {
            // Both players collide, both die
            newPlayers[i].isAlive = false;
            newPlayers[j].isAlive = false;
            break;
          }
        }
        
        // Update player position if still alive
        if (newPlayers[i].isAlive) {
          newPlayers[i].position = newPosition;
        }
      }
      
      // Check game over conditions
      const alivePlayers = newPlayers.filter(p => p.isAlive);
      let isGameOver = false;
      let winner: number | null = null;
      
      if (alivePlayers.length === 0) {
        // Draw - no players alive
        isGameOver = true;
        winner = null;
        toast.info("It's a draw!");
      } else if (alivePlayers.length === 1) {
        // One player wins
        isGameOver = true;
        winner = alivePlayers[0].id;
        
        // Update winner's score
        const winnerIndex = newPlayers.findIndex(p => p.id === winner);
        if (winnerIndex !== -1) {
          newPlayers[winnerIndex].score += 1;
          toast.success(`Player ${winner} wins this round!`);
        }
      }
      
      return {
        ...prevState,
        players: newPlayers,
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
    
    const { players, gridSize, cellSize } = gameState;
    
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
    
    // Reset shadow
    ctx.shadowBlur = 0;
  };
  
  // Game control handlers
  const handleStartNewGame = () => {
    // Reset entire game
    setGameState(resetGame(GRID_WIDTH, GRID_HEIGHT, CELL_SIZE));
    toast.success("New game started!");
  };
  
  const handleResetRound = () => {
    // Reset current round
    setGameState(prevState => {
      const newState = resetRound(prevState);
      return {
        ...newState,
        round: prevState.round + 1
      };
    });
    toast.info("Round reset!");
  };
  
  const handlePauseGame = () => {
    setGameState(prevState => ({
      ...prevState,
      isGamePaused: true
    }));
    toast.info("Game paused");
  };
  
  const handleResumeGame = () => {
    setGameState(prevState => ({
      ...prevState,
      isGamePaused: false
    }));
    toast.info("Game resumed");
  };
  
  return (
    <div className="flex flex-col items-center">
      {/* Game title and round */}
      <div className="mb-2 text-center animate-game-fade-in">
        <div className="text-xs font-medium text-tron-text/60 tracking-widest uppercase mb-1">
          Round {gameState.round}
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tron-blue to-tron-glow">
          TRON LIGHT CYCLES
        </h1>
      </div>
      
      {/* Player scores */}
      <div className="flex justify-center items-center gap-12 mb-4">
        <PlayerScore 
          playerName="Player 1" 
          score={gameState.players[0].score} 
          color="blue" 
        />
        
        <div className="text-center">
          <div className="text-xs text-tron-text/60 font-medium mb-1">VS</div>
        </div>
        
        <PlayerScore 
          playerName="Player 2" 
          score={gameState.players[1].score} 
          color="orange" 
        />
      </div>
      
      {/* Game status overlay */}
      <div className="relative">
        {(gameState.isGameOver || gameState.isGamePaused) && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-tron-background/70 backdrop-blur-sm animate-game-fade-in">
            <div className="text-center">
              {gameState.isGameOver && (
                <>
                  <h2 className="text-2xl font-bold mb-4">
                    {gameState.winner ? (
                      <span className={gameState.winner === 1 ? 'text-tron-blue' : 'text-tron-orange'}>
                        Player {gameState.winner} Wins!
                      </span>
                    ) : (
                      <span className="text-tron-text">It's a Draw!</span>
                    )}
                  </h2>
                  <button 
                    onClick={handleResetRound}
                    className="btn-glow px-6 py-2 bg-tron-blue/20 text-tron-blue border border-tron-blue/50 hover:bg-tron-blue/30 rounded-lg"
                  >
                    Next Round
                  </button>
                </>
              )}
              
              {gameState.isGamePaused && !gameState.isGameOver && (
                <>
                  <h2 className="text-2xl font-bold mb-4 text-tron-text">Game Paused</h2>
                  <button 
                    onClick={handleResumeGame}
                    className="btn-glow px-6 py-2 bg-tron-orange/20 text-tron-orange border border-tron-orange/50 hover:bg-tron-orange/30 rounded-lg"
                  >
                    Resume
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Game canvas */}
        <div className="glass-panel rounded-xl p-2 overflow-hidden animate-game-fade-in">
          <canvas 
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="rounded"
          />
        </div>
      </div>
      
      {/* Game controls */}
      <GameControls 
        isGameOver={gameState.isGameOver}
        isGamePaused={gameState.isGamePaused}
        onStartNewGame={handleStartNewGame}
        onResetRound={handleResetRound}
        onPauseGame={handlePauseGame}
        onResumeGame={handleResumeGame}
      />
      
      {/* Game instructions */}
      <div className="mt-6 glass-panel rounded-xl p-4 text-sm text-tron-text/80 max-w-md animate-game-fade-in">
        <h3 className="font-medium mb-2 text-tron-text">How to Play</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-tron-blue font-medium mb-1">Player 1</p>
            <ul className="space-y-1">
              <li>W - Move Up</li>
              <li>S - Move Down</li>
              <li>A - Move Left</li>
              <li>D - Move Right</li>
            </ul>
          </div>
          <div>
            <p className="text-tron-orange font-medium mb-1">Player 2</p>
            <ul className="space-y-1">
              <li>↑ - Move Up</li>
              <li>↓ - Move Down</li>
              <li>← - Move Left</li>
              <li>→ - Move Right</li>
            </ul>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-tron-text/10">
          <p>Space - Pause/Resume</p>
        </div>
      </div>
    </div>
  );
};

export default Game;
