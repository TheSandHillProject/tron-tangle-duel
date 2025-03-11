
import React, { useEffect } from 'react';
import { GameState } from '@/utils/gameUtils';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Award, Trophy } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';

interface GameOverlayProps {
  gameState: GameState;
  gameMode: 'single' | 'two';
  bulletsCollected: number;
  highScore: number;
  onResetRound: () => void;
  onResumeGame: () => void;
}

const GameOverlay: React.FC<GameOverlayProps> = ({
  gameState,
  gameMode,
  bulletsCollected,
  highScore,
  onResetRound,
  onResumeGame
}) => {
  const navigate = useNavigate();
  const { showGraviTronEndScreen, setShowGraviTronEndScreen } = useGameContext();
  
  // Debug logs to track state changes
  useEffect(() => {
    console.log('GameOverlay: showGraviTronEndScreen =', showGraviTronEndScreen);
    console.log('GameOverlay: gameState.gravitronDeath =', gameState.gravitronDeath);
  }, [showGraviTronEndScreen, gameState.gravitronDeath]);
  
  // Show gravitron death screen if returning from leaderboard
  if (showGraviTronEndScreen) {
    // Reset the flag after rendering the screen
    // Using setTimeout to ensure the flag is reset after the component has rendered
    useEffect(() => {
      const timer = setTimeout(() => {
        console.log('Resetting showGraviTronEndScreen flag');
        setShowGraviTronEndScreen(false);
      }, 100);
      return () => clearTimeout(timer);
    }, [setShowGraviTronEndScreen]);
    
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/90 backdrop-blur-sm animate-game-fade-in">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4 text-red-500 animate-pulse">
            Game Over!
          </h2>
          <p className="text-xl text-red-400 mb-8">
            You have achieved heat death.
          </p>
          
          <div className="flex flex-col space-y-4 items-center">
            <button 
              onClick={onResetRound}
              className="btn-glow px-6 py-2 bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30 rounded-lg"
            >
              Play Again
            </button>
            
            <Button
              onClick={() => navigate('/gravitron-leaderboard')}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white border border-red-500/50"
            >
              <Trophy className="h-4 w-4" />
              <span>GraviTron Leaderboard</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!gameState.isGameOver && !gameState.isGamePaused) {
    return null;
  }
  
  // Handle gravitron heat death
  if (gameState.isGameOver && gameState.gravitronDeath) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/90 backdrop-blur-sm animate-game-fade-in">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4 text-red-500 animate-pulse">
            Game Over!
          </h2>
          <p className="text-xl text-red-400 mb-8">
            You have achieved heat death.
          </p>
          
          <div className="flex flex-col space-y-4 items-center">
            <button 
              onClick={onResetRound}
              className="btn-glow px-6 py-2 bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30 rounded-lg"
            >
              Play Again
            </button>
            
            <Button
              onClick={() => navigate('/gravitron-leaderboard')}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white border border-red-500/50"
            >
              <Trophy className="h-4 w-4" />
              <span>GraviTron Leaderboard</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 bg-tron-background/70 backdrop-blur-sm animate-game-fade-in">
      <div className="text-center">
        {gameState.isGameOver && (
          <>
            <h2 className="text-2xl font-bold mb-4">
              {gameMode === 'single' ? (
                <span className="text-tron-text">
                  Game Over!
                  {bulletsCollected > 0 && (
                    <div className="text-lg mt-2">
                      You collected <span className="text-tron-blue">{bulletsCollected}</span> bullets
                      {bulletsCollected >= highScore && highScore > 0 && (
                        <div className="text-tron-blue animate-pulse mt-1">New High Score!</div>
                      )}
                    </div>
                  )}
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
              onClick={onResetRound}
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
              onClick={onResumeGame}
              className="btn-glow px-6 py-2 bg-tron-orange/20 text-tron-orange border border-tron-orange/50 hover:bg-tron-orange/30 rounded-lg"
            >
              Resume
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default GameOverlay;
