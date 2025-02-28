
import React from 'react';
import { Button } from '@/components/ui/button';

interface GameControlsProps {
  isGameOver: boolean;
  isGamePaused: boolean;
  onStartNewGame: () => void;
  onResetRound: () => void;
  onPauseGame: () => void;
  onResumeGame: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  isGameOver,
  isGamePaused,
  onStartNewGame,
  onResetRound,
  onPauseGame,
  onResumeGame,
}) => {
  return (
    <div className="glass-panel rounded-xl p-4 mt-4 flex flex-wrap justify-center gap-3 animate-game-fade-in">
      <Button
        onClick={onStartNewGame}
        className="btn-glow bg-tron-blue/20 text-tron-blue border border-tron-blue/50 hover:bg-tron-blue/30"
      >
        New Game
      </Button>
      
      <Button
        onClick={onResetRound}
        className="btn-glow bg-tron-blue/20 text-tron-blue border border-tron-blue/50 hover:bg-tron-blue/30"
      >
        Reset Round
      </Button>
      
      {!isGameOver && (
        isGamePaused ? (
          <Button
            onClick={onResumeGame}
            className="btn-glow bg-tron-orange/20 text-tron-orange border border-tron-orange/50 hover:bg-tron-orange/30"
          >
            Resume
          </Button>
        ) : (
          <Button
            onClick={onPauseGame}
            className="btn-glow bg-tron-orange/20 text-tron-orange border border-tron-orange/50 hover:bg-tron-orange/30"
          >
            Pause
          </Button>
        )
      )}
    </div>
  );
};

export default GameControls;
