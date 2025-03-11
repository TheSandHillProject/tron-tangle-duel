
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PlayerScore from './PlayerScore';
import GameControls from './GameControls';
import GameModeSelector from './GameModeSelector';
import GameSetup from './GameSetup';
import GameCanvas from './GameCanvas';
import GameOverlay from './GameOverlay';
import GameInstructions from './GameInstructions';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useGameContext } from '@/context/GameContext';
import { useUserContext } from '@/context/UserContext';
import { submitScore } from '@/services/leaderboardService';
import LoginPrompt from './LoginPrompt';
import { toast } from '@/components/ui/use-toast';
import { STABILITY_THRESHOLD } from '@/utils/gameUtils';

interface GameProps {
  initialGameMode?: 'single' | 'two';
  onGameModeChange?: (mode: 'single' | 'two') => void;
}

const DEFAULT_GRID_WIDTH = 50;
const DEFAULT_GRID_HEIGHT = 50;

const Game: React.FC<GameProps> = ({ initialGameMode = 'single', onGameModeChange }) => {
  const { 
    skipSetup, 
    setSkipSetup, 
    setLastGameMode, 
    navigatingFrom, 
    setNavigatingFrom, 
    savedFPS, 
    setSavedFPS,
    setGameTime 
  } = useGameContext();
  const { user, isLoading: isUserLoading } = useUserContext();
  const navigate = useNavigate();
  
  const [gameMode, setGameMode] = useState<'single' | 'two'>(initialGameMode);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [gridWidth, setGridWidth] = useState<number>(DEFAULT_GRID_WIDTH);
  const [gridHeight, setGridHeight] = useState<number>(DEFAULT_GRID_HEIGHT);
  const [framesPerSecond, setFramesPerSecond] = useState<number>(savedFPS);
  const [isSetup, setIsSetup] = useState<boolean>(true);
  const [needsLogin, setNeedsLogin] = useState<boolean>(false);
  const [lastSubmittedScore, setLastSubmittedScore] = useState<number | null>(null);
  
  // Timer state for single player mode
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timerStartTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      setNeedsLogin(true);
    } else {
      setNeedsLogin(false);
    }
  }, [user, isUserLoading]);

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

  // Game timer logic
  useEffect(() => {
    // Start timer when single player game begins
    if (!isSetup && gameMode === 'single' && !gameState.isGameOver && !gameState.isGamePaused) {
      // If timer isn't already running, start it
      if (!timerRef.current) {
        timerStartTimeRef.current = Date.now() - (elapsedTime * 1000); // Adjust for any previous time
        
        timerRef.current = setInterval(() => {
          if (timerStartTimeRef.current) {
            const currentElapsed = Math.floor((Date.now() - timerStartTimeRef.current) / 1000);
            setElapsedTime(currentElapsed);
          }
        }, 1000);
      }
    } else if (timerRef.current && (gameState.isGamePaused || gameState.isGameOver || isSetup || gameMode !== 'single')) {
      // Stop timer if game is paused, over, in setup, or not in single player mode
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // If game is over in single player mode and GraviTron was collected, save the final time
    if (gameState.isGameOver && gameMode === 'single' && gameState.gravitronDeath) {
      setGameTime(elapsedTime);
    }
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isSetup, gameMode, gameState.isGameOver, gameState.isGamePaused, gameState.gravitronDeath, elapsedTime, setGameTime]);

  // Reset timer when starting a new game or round
  useEffect(() => {
    if (isSetup || (gameMode === 'single' && gameState.round === 1 && !gameState.isGameOver)) {
      setElapsedTime(0);
      timerStartTimeRef.current = null;
    }
  }, [isSetup, gameMode, gameState.round, gameState.isGameOver]);

  useEffect(() => {
    if (
      gameState.isGameOver && 
      user && 
      gameMode === 'single' && 
      bulletsCollected > 0 &&
      lastSubmittedScore !== bulletsCollected * speedMultiplier
    ) {
      const finalScore = bulletsCollected * speedMultiplier;
      
      submitScore(user.id, user.username, finalScore)
        .then(() => {
          toast({
            title: "Score Submitted",
            description: `Your score of ${finalScore} has been recorded!`,
            duration: 3000
          });
          setLastSubmittedScore(finalScore);
        })
        .catch(error => {
          console.error("Failed to submit score:", error);
          toast({
            title: "Score Submission Failed",
            description: "There was an error recording your score.",
            variant: "destructive",
            duration: 3000
          });
        });
    }
  }, [gameState.isGameOver, user, gameMode, bulletsCollected, speedMultiplier, lastSubmittedScore]);

  if (needsLogin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tron-blue to-tron-glow font-space text-center mb-8">
            BATTLE TRON
          </h1>
          <LoginPrompt onComplete={() => setNeedsLogin(false)} />
          <div className="mt-8 text-center">
            <Link 
              to="/"
              className="text-gray-400/80 hover:text-gray-300 transition-colors font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSetup) {
    return (
      <div className="flex flex-col items-center">
        <div className="mb-2 text-center animate-game-fade-in">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tron-blue to-tron-glow font-space">
            BATTLE TRON
          </h1>
        </div>
        
        <div className="flex items-center mb-4">
          <GameModeSelector 
            gameMode={gameMode} 
            onGameModeChange={handleGameModeChange} 
          />
        </div>
        
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
      <div className="mb-2 text-center animate-game-fade-in">
        <div className="text-xs font-medium text-tron-text/60 tracking-widest uppercase mb-1">
          Round {gameState.round}
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tron-blue to-tron-glow font-space">
          BATTLE TRON
        </h1>
      </div>
      
      <div className="flex items-center mb-4">
        <GameModeSelector 
          gameMode={gameMode} 
          onGameModeChange={handleGameModeChange} 
        />
      </div>
      
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
              score={gameState.players[0]?.score || 0} 
              color="blue" 
            />
          )}
          <div className="flex gap-2 mt-1">
            <div className={`${gameState.gravitron && !gameState.gravitron.collected && gameMode === 'single' ? 
              (gameState.players[0]?.bullets >= STABILITY_THRESHOLD ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400') : 
              'bg-tron-blue/10 text-tron-blue'} px-2 py-1 rounded text-xs`}>
              Bullets: {gameState.players[0]?.bullets || 0}{gameState.gravitron && !gameState.gravitron.collected && gameMode === 'single' && 
                ` / ${STABILITY_THRESHOLD} ${gameState.players[0]?.bullets >= STABILITY_THRESHOLD ? '(Stable)' : '(Unstable)'}`}
            </div>
            {gameMode === 'single' && (
              <>
                <div className="bg-tron-blue/10 px-2 py-1 rounded text-xs text-tron-blue">
                  NeuTrons: {gameState.players[0]?.neutronBombs || 0}
                </div>
                <div className="bg-tron-blue/10 px-2 py-1 rounded text-xs text-tron-blue">
                  HydroTrons: {gameState.players[0]?.hydroTronsCollected || 0}
                </div>
                <div className="bg-tron-blue/10 px-2 py-1 rounded text-xs text-tron-blue">
                  Time: {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
                </div>
              </>
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
                score={gameState.players[1]?.score || 0} 
                color="orange" 
              />
              <div className="mt-1 bg-tron-orange/10 px-2 py-1 rounded text-xs text-tron-orange">
                Bullets: {gameState.players[1]?.bullets || 0}
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="relative">
        <GameOverlay
          gameState={gameState}
          gameMode={gameMode}
          bulletsCollected={bulletsCollected}
          highScore={highScore}
          onResetRound={handleResetRound}
          onResumeGame={handleResumeGame}
          gameTime={elapsedTime}
        />
        
        <div className="glass-panel rounded-xl p-2 overflow-hidden animate-game-fade-in">
          <GameCanvas 
            gameState={gameState}
            canvasWidth={canvasWidth}
            canvasHeight={canvasHeight}
          />
        </div>
      </div>
      
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
      
      <GameInstructions gameMode={gameMode} />
    </div>
  );
};

export default Game;
