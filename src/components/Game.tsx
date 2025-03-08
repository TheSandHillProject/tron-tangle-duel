
import React, { useState, useEffect } from 'react';
import PlayerScore from './PlayerScore';
import GameControls from './GameControls';
import GameModeSelector from './GameModeSelector';
import GameSetup from './GameSetup';
import GameCanvas from './GameCanvas';
import GameOverlay from './GameOverlay';
import GameInstructions from './GameInstructions';
import { useGameLogic } from '@/hooks/useGameLogic';

interface GameProps {
  initialGameMode?: 'single' | 'two';
  onGameModeChange?: (mode: 'single' | 'two') => void;
}

const DEFAULT_GRID_WIDTH = 50;
const DEFAULT_GRID_HEIGHT = 50;

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
  
  // Effect to reset game mode when initialGameMode changes
  useEffect(() => {
    setGameMode(initialGameMode);
  }, [initialGameMode]);
  
  // Handle game mode change
  const handleGameModeChange = (mode: 'single' | 'two') => {
    setGameMode(mode);
    
    // Call the parent component's handler if provided
    if (onGameModeChange) {
      onGameModeChange(mode);
    }
  };
  
  // Apply game configuration and start the game
  const applyGameSetup = (width: number, height: number, fps: number) => {
    setGridWidth(width);
    setGridHeight(height);
    setFramesPerSecond(fps);
    
    // Exit setup mode
    setIsSetup(false);
  };
  
  // Get game logic
  const {
    gameState,
    canvasWidth,
    canvasHeight,
    bulletsCollected,
    highScore,
    handleStartNewGame,
    handleResetRound,
    handlePauseGame,
    handleResumeGame,
    handleDeployNeutronBomb
  } = useGameLogic({
    gridWidth,
    gridHeight,
    gameMode,
    framesPerSecond,
    isSetup
  });
  
  // If in setup mode, show the setup screen
  if (isSetup) {
    return (
      <div className="flex flex-col items-center">
        <div className="mb-2 text-center animate-game-fade-in">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tron-blue to-tron-glow font-space">
            BATTLE TRON
          </h1>
        </div>
        
        <GameModeSelector 
          initialGameMode={gameMode} 
          onGameModeChange={handleGameModeChange} 
        />
        
        <GameSetup 
          onSetupComplete={applyGameSetup}
          initialGridWidth={gridWidth}
          initialGridHeight={gridHeight}
          initialFPS={framesPerSecond}
        />
      </div>
    );
  }
  
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
      
      {/* Game mode selector - always show it */}
      <GameModeSelector 
        initialGameMode={gameMode} 
        onGameModeChange={handleGameModeChange} 
      />
      
      {/* Player scores, bullet counts, and timer */}
      <div className="flex justify-center items-center gap-12 mb-4">
        <div className="flex flex-col items-center">
          {gameMode === 'single' ? (
            <>
              <PlayerScore 
                playerName="Player 1" 
                score={bulletsCollected * speedMultiplier} 
                color="blue"
                label="Score" 
              />
              <div className="mt-1 bg-tron-blue/10 px-3 py-1 rounded text-xs text-tron-blue">
                High Score: {highScore}
              </div>
            </>
          ) : (
            <PlayerScore 
              playerName="Player 1" 
              score={gameState.players[0].score} 
              color="blue" 
            />
          )}
          <div className="flex gap-2 mt-1">
            <div className="bg-tron-blue/10 px-2 py-1 rounded text-xs text-tron-blue">
              Bullets: {gameState.players[0].bullets}
            </div>
            {gameMode === 'single' && (
              <div className="bg-tron-blue/10 px-2 py-1 rounded text-xs text-tron-blue">
                NeuTrons: {gameState.players[0].neutronBombs}
              </div>
            )}
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
      
      {/* Game canvas and overlay */}
      <div className="relative">
        <GameOverlay
          gameState={gameState}
          gameMode={gameMode}
          bulletsCollected={bulletsCollected}
          highScore={highScore}
          onResetRound={handleResetRound}
          onResumeGame={handleResumeGame}
        />
        
        {/* Game canvas */}
        <div className="glass-panel rounded-xl p-2 overflow-hidden animate-game-fade-in">
          <GameCanvas 
            gameState={gameState}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
          />
        </div>
      </div>
      
      {/* Game controls */}
      <GameControls 
        isGameOver={gameState.isGameOver}
        isGamePaused={gameState.isGamePaused}
        onStartNewGame={() => {
          if (handleStartNewGame()) {
            setIsSetup(true);
          }
        }}
        onResetRound={handleResetRound}
        onPauseGame={handlePauseGame}
        onResumeGame={handleResumeGame}
        gameMode={gameMode}
        canDeployNeutronBomb={gameMode === 'single' && gameState.players[0].neutronBombs > 0}
        onDeployNeutronBomb={handleDeployNeutronBomb}
      />
      
      {/* Game instructions */}
      <GameInstructions gameMode={gameMode} />
    </div>
  );
};

export default Game;
