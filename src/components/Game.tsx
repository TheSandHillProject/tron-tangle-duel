
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GameControls from './GameControls';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useGameContext } from '@/context/GameContext';
import { useUserContext } from '@/context/UserContext';
import { submitScore } from '@/services/leaderboardService';
import GameContainer from './GameContainer';
import GameHeader from './GameHeader';
import GameScore from './GameScore';
import GameMain from './GameMain';

interface GameProps {
  initialGameMode?: 'single' | 'two';
  onGameModeChange?: (mode: 'single' | 'two') => void;
}

const DEFAULT_GRID_WIDTH = 50;
const DEFAULT_GRID_HEIGHT = 50;

const Game: React.FC<GameProps> = ({ initialGameMode = 'single', onGameModeChange }) => {
  const { skipSetup, setSkipSetup, setLastGameMode, navigatingFrom, setNavigatingFrom, savedFPS, setSavedFPS } = useGameContext();
  const { user } = useUserContext();
  const navigate = useNavigate();
  
  const [gameMode, setGameMode] = useState<'single' | 'two'>(initialGameMode);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [gridWidth, setGridWidth] = useState<number>(DEFAULT_GRID_WIDTH);
  const [gridHeight, setGridHeight] = useState<number>(DEFAULT_GRID_HEIGHT);
  const [framesPerSecond, setFramesPerSecond] = useState<number>(savedFPS);
  const [isSetup, setIsSetup] = useState<boolean>(true);
  const [lastSubmittedScore, setLastSubmittedScore] = useState<number | null>(null);
  const [isScoreSubmitting, setIsScoreSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (navigatingFrom === '/') {
      setIsSetup(true);
    } else if (navigatingFrom === '/leaderboard') {
      setIsSetup(!skipSetup);
    } else {
      setIsSetup(!skipSetup);
    }
    
    setNavigatingFrom(null);
  }, [skipSetup, navigatingFrom, setNavigatingFrom]);

  useEffect(() => {
    setGameMode(initialGameMode);
    setLastGameMode(initialGameMode);
  }, [initialGameMode, setLastGameMode]);

  const handleGameModeChange = (mode: 'single' | 'two') => {
    setGameMode(mode);
    setLastGameMode(mode);
    
    if (onGameModeChange) {
      onGameModeChange(mode);
    }
  };

  const applyGameSetup = (width: number, height: number, fps: number) => {
    setGridWidth(width);
    setGridHeight(height);
    setFramesPerSecond(fps);
    setSavedFPS(fps); // Save FPS to context
    setIsSetup(false);
    setSkipSetup(true);
  };

  useEffect(() => {
    return () => {
      if (!isSetup) {
        setSkipSetup(true);
      }
    };
  }, [isSetup, setSkipSetup]);

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

  useEffect(() => {
    if (
      gameState.isGameOver && 
      user && 
      gameMode === 'single' && 
      bulletsCollected > 0 &&
      lastSubmittedScore !== bulletsCollected * speedMultiplier &&
      !isScoreSubmitting
    ) {
      const finalScore = bulletsCollected * speedMultiplier;
      
      setIsScoreSubmitting(true);
      
      submitScore(user.id, user.username, finalScore)
        .then(() => {
          setLastSubmittedScore(finalScore);
          setIsScoreSubmitting(false);
        })
        .catch(error => {
          console.error("Failed to submit score:", error);
          setIsScoreSubmitting(false);
        });
    }
  }, [gameState.isGameOver, user, gameMode, bulletsCollected, speedMultiplier, lastSubmittedScore, isScoreSubmitting]);

  return (
    <GameContainer
      gameMode={gameMode}
      onGameModeChange={handleGameModeChange}
      isSetup={isSetup}
      onSetupComplete={applyGameSetup}
      gridWidth={gridWidth}
      gridHeight={gridHeight}
      framesPerSecond={framesPerSecond}
    >
      <div className="flex flex-col items-center">
        <GameHeader 
          gameMode={gameMode} 
          onGameModeChange={handleGameModeChange} 
          round={gameState.round} 
        />
        
        <GameScore 
          players={gameState.players}
          gameMode={gameMode}
          bulletsCollected={bulletsCollected}
          highScore={highScore}
          gravitron={!!gameState.gravitron}
          gravitronCollected={gameState.gravitron?.collected || false}
        />
        
        <GameMain 
          gameState={gameState}
          gameMode={gameMode}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
          bulletsCollected={bulletsCollected}
          highScore={highScore}
          onResetRound={handleResetRound}
          onResumeGame={handleResumeGame}
        />
        
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
          canDeployNeutronBomb={gameMode === 'single' && (gameState.players[0]?.neutronBombs > 0 || false)}
          onDeployNeutronBomb={handleDeployNeutronBomb}
        />
      </div>
    </GameContainer>
  );
};

export default Game;
