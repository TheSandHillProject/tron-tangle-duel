
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PlayerScore from './PlayerScore';
import GameControls from './GameControls';
import GameModeSelector from './GameModeSelector';
import { Button } from '@/components/ui/button';
import { 
  Direction, GameState, Position, Player, Token, Bullet,
  initialGameState, updatePlayerPosition, isOutOfBounds, 
  checkCollision, arePositionsEqual, resetRound, resetGame,
  isValidDirectionChange, generateRandomPosition, updateBulletPosition,
  checkBulletTrailCollision, removeTrailSegment
} from '@/utils/gameUtils';

const GAME_SPEED = 100; // milliseconds between game updates
const GRID_WIDTH = 40;
const GRID_HEIGHT = 30;
const CELL_SIZE = 15;
const BULLET_SPEED = 2; // Bullets move faster than players

const Game: React.FC = () => {
  // Game mode state (single or two player)
  const [gameMode, setGameMode] = useState<'single' | 'two'>('two');
  
  // Game state
  const [gameState, setGameState] = useState<GameState>(() => 
    initialGameState(GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, gameMode === 'single')
  );
  
  // Game ready state (to prevent auto-start)
  const [gameReady, setGameReady] = useState<boolean>(false);
  
  // Countdown state
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Game loop timer reference
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  
  // Canvas reference
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game dimensions
  const canvasWidth = gameState.gridSize.width * gameState.cellSize;
  const canvasHeight = gameState.gridSize.height * gameState.cellSize;
  
  // Handle game mode change
  const handleGameModeChange = (mode: 'single' | 'two') => {
    setGameMode(mode);
    setGameState(initialGameState(GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, mode === 'single'));
    setGameReady(false);
    setCountdown(null);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  };
  
  // Handle keyboard input
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only handle key events if game is ready
    if (!gameReady && countdown === null) return;
    
    const { players } = gameState;
    const [player1, player2] = players;
    
    // Clone the current game state to avoid direct mutation
    const newPlayers = [...players];
    
    // Player 1 controls (WASD)
    if (player1.isAlive) {
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
        // Create bullet from player 1's position going in their direction
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
        // Create bullet from player 2's position going in their direction
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
  }, [gameState, gameMode, gameReady, countdown]);
  
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
    
    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [handleKeyDown, gameMode]);
  
  // Effect to reset game state when game mode changes
  useEffect(() => {
    setGameState(initialGameState(GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, gameMode === 'single'));
    setGameReady(false);
    setCountdown(null);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, [gameMode]);
  
  // Effect for countdown
  useEffect(() => {
    if (countdown !== null) {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(prev => prev !== null ? prev - 1 : null);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // Countdown finished, start the game
        setGameReady(true);
        startGameLoop();
      }
    }
  }, [countdown]);
  
  // Draw game on canvas
  useEffect(() => {
    drawGame();
  }, [gameState, countdown]);
  
  // Start countdown
  const startCountdown = () => {
    setCountdown(3);
  };
  
  // Start game loop
  const startGameLoop = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
    
    gameLoopRef.current = setInterval(() => {
      if (!gameState.isGamePaused && !gameState.isGameOver && gameReady) {
        updateGame();
      }
    }, GAME_SPEED);
  };
  
  // Update game state
  const updateGame = () => {
    setGameState(prevState => {
      // Clone the current state
      const { players, gridSize, tokens, bullets } = prevState;
      const newPlayers = [...players].map(player => ({ ...player }));
      const newTokens = [...tokens];
      const newBullets = [...bullets];
      const occupiedPositions: Position[] = [];
      
      // Check for token collection
      for (let i = 0; i < newPlayers.length; i++) {
        if (!newPlayers[i].isAlive) continue;
        
        // Check if player collected any tokens
        for (let j = 0; j < newTokens.length; j++) {
          if (!newTokens[j].collected && arePositionsEqual(newPlayers[i].position, newTokens[j].position)) {
            // Collect token (mark as collected)
            newTokens[j].collected = true;
            
            // Increment player's bullet count
            newPlayers[i].bullets += 1;
            
            // Generate a new token
            const allPositions = [
              ...newPlayers.map(p => p.position),
              ...newPlayers.flatMap(p => p.trail),
              ...newTokens.filter(t => !t.collected).map(t => t.position)
            ];
            
            const newTokenPosition = generateRandomPosition(gridSize, allPositions);
            newTokens.push({
              position: newTokenPosition,
              collected: false
            });
            
            break;
          }
        }
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
      
      // Filter out inactive bullets and collected tokens
      const activeBullets = newBullets.filter(b => b.active);
      const availableTokens = newTokens.filter(t => !t.collected);
      
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
    
    const { players, gridSize, cellSize, tokens, bullets } = gameState;
    
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
    
    // Draw countdown if active
    if (countdown !== null) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      if (countdown > 0) {
        // Determine color based on game mode
        if (gameMode === 'single' || countdown === 3) {
          // Blue theme (for Player 1 or single player)
          ctx.fillStyle = '#0CD0FF';
          ctx.shadowColor = '#0CD0FF';
        } else if (countdown === 2) {
          // Mix of blue and orange for middle count
          ctx.fillStyle = '#7EB7FF';
          ctx.shadowColor = '#7EB7FF';
        } else {
          // Orange theme (for Player 2 in countdown = 1)
          ctx.fillStyle = '#FF9900';
          ctx.shadowColor = '#FF9900';
        }
        ctx.shadowBlur = 20;
        ctx.fillText(countdown.toString(), canvas.width / 2, canvas.height / 2);
      } else {
        // Draw "GO!" in bright green
        ctx.fillStyle = '#00FF00';
        ctx.shadowColor = '#00FF00';
        ctx.shadowBlur = 20;
        ctx.fillText('GO!', canvas.width / 2, canvas.height / 2);
      }
    }
    
    // Reset shadow
    ctx.shadowBlur = 0;
  };
  
  // Game control handlers
  const handleStartNewGame = () => {
    // Reset entire game
    setGameState(resetGame(GRID_WIDTH, GRID_HEIGHT, CELL_SIZE, gameMode === 'single'));
    setGameReady(false);
    setCountdown(null);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
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
    setGameReady(false);
    setCountdown(null);
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
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
  
  return (
    <div className="flex flex-col items-center">
      {/* Game title and round */}
      <div className="mb-2 text-center animate-game-fade-in">
        <div className="text-xs font-medium text-tron-text/60 tracking-widest uppercase mb-1">
          Round {gameState.round}
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tron-blue to-tron-glow font-space">
          BATTLE TRON
        </h1>
      </div>
      
      {/* Game mode selector */}
      <GameModeSelector gameMode={gameMode} onGameModeChange={handleGameModeChange} />
      
      {/* Player scores, bullet counts, and timer */}
      <div className="flex justify-center items-center gap-12 mb-4">
        <div className="flex flex-col items-center">
          <PlayerScore 
            playerName={gameMode === 'single' ? "Player" : "Player 1"} 
            score={gameState.players[0].score} 
            color="blue" 
          />
          <div className="mt-1 bg-tron-blue/10 px-2 py-1 rounded text-xs text-tron-blue">
            Bullets: {gameState.players[0].bullets}
          </div>
        </div>
        
        {gameMode === 'two' && (
          <>
            <div className="text-center">
              <div className="text-xs text-tron-text/60 font-medium mb-1">VS</div>
            </div>
            
            <div className="flex flex-col items-center">
              <PlayerScore 
                playerName="Player 2" 
                score={gameState.players[1].score} 
                color="orange" 
              />
              <div className="mt-1 bg-tron-orange/10 px-2 py-1 rounded text-xs text-tron-orange">
                Bullets: {gameState.players[1].bullets}
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Game status overlay */}
      <div className="relative">
        {/* Game not ready overlay */}
        {!gameReady && countdown === null && !gameState.isGameOver && !gameState.isGamePaused && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-tron-background/70 backdrop-blur-sm animate-game-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-tron-text">
                Ready to Play?
              </h2>
              <Button 
                onClick={startCountdown}
                className="btn-glow px-6 py-2 bg-tron-blue/20 text-tron-blue border border-tron-blue/50 hover:bg-tron-blue/30 rounded-lg"
              >
                Start Game
              </Button>
            </div>
          </div>
        )}
        
        {/* Existing overlays */}
        {(gameState.isGameOver || gameState.isGamePaused) && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-tron-background/70 backdrop-blur-sm animate-game-fade-in">
            <div className="text-center">
              {gameState.isGameOver && (
                <>
                  <h2 className="text-2xl font-bold mb-4">
                    {gameMode === 'single' ? (
                      <span className="text-tron-text">
                        Game Over!
                      </span>
                    ) : gameState.winner ? (
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
                    {gameMode === 'single' ? 'Play Again' : 'Next Round'}
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
        {gameMode === 'single' ? (
          <div>
            <p className="text-tron-blue font-medium mb-1">Controls</p>
            <ul className="space-y-1">
              <li>W - Move Up</li>
              <li>S - Move Down</li>
              <li>A - Move Left</li>
              <li>D - Move Right</li>
              <li>1 - Shoot Bullet</li>
              <li>Space - Pause/Resume</li>
            </ul>
            <div className="mt-2 pt-2 border-t border-tron-text/10">
              <p className="text-yellow-300 font-medium">Collect yellow tokens to get bullets!</p>
              <p>Use bullets to cut your trail and create shortcuts.</p>
              <p>Try to survive as long as possible!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-tron-blue font-medium mb-1">Player 1</p>
              <ul className="space-y-1">
                <li>W - Move Up</li>
                <li>S - Move Down</li>
                <li>A - Move Left</li>
                <li>D - Move Right</li>
                <li>1 - Shoot Bullet</li>
              </ul>
            </div>
            <div>
              <p className="text-tron-orange font-medium mb-1">Player 2</p>
              <ul className="space-y-1">
                <li>↑ - Move Up</li>
                <li>↓ - Move Down</li>
                <li>← - Move Left</li>
                <li>→ - Move Right</li>
                <li>/ - Shoot Bullet</li>
              </ul>
            </div>
            <div className="col-span-2 mt-2 pt-2 border-t border-tron-text/10">
              <p className="mb-1">Space - Pause/Resume</p>
              <p className="text-yellow-300 font-medium">Collect yellow tokens to get bullets!</p>
              <p>Use bullets to cut your opponent's trail or your own trail.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
