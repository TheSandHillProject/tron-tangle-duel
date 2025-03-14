
import React from 'react';
import { GameState } from '@/utils/gameUtils';
import GameCanvas from './GameCanvas';
import GameOverlay from './GameOverlay';

interface GameMainProps {
  gameState: GameState;
  gameMode: 'single' | 'two';
  canvasWidth: number;
  canvasHeight: number;
  bulletsCollected: number;
  highScore: number;
  onResetRound: () => void;
  onResumeGame: () => void;
}

const GameMain: React.FC<GameMainProps> = ({
  gameState,
  gameMode,
  canvasWidth,
  canvasHeight,
  bulletsCollected,
  highScore,
  onResetRound,
  onResumeGame
}) => {
  return (
    <div className="relative">
      <GameOverlay
        gameState={gameState}
        gameMode={gameMode}
        bulletsCollected={bulletsCollected}
        highScore={highScore}
        onResetRound={onResetRound}
        onResumeGame={onResumeGame}
      />
      
      <div className="glass-panel rounded-xl p-2 overflow-hidden animate-game-fade-in">
        <GameCanvas 
          gameState={gameState}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />
      </div>
    </div>
  );
};

export default GameMain;
