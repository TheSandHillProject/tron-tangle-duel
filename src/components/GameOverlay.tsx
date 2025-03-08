
import React from 'react';
import { GameState } from '@/utils/gameUtils';

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
  if (!gameState.isGameOver && !gameState.isGamePaused) {
    return null;
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
