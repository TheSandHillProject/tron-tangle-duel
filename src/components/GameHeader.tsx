
import React from 'react';
import GameModeSelector from './GameModeSelector';

interface GameHeaderProps {
  gameMode: 'single' | 'two';
  onGameModeChange: (mode: 'single' | 'two') => void;
  round: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({ gameMode, onGameModeChange, round }) => {
  return (
    <>
      <div className="mb-2 text-center animate-game-fade-in">
        <div className="text-xs font-medium text-tron-text/60 tracking-widest uppercase mb-1">
          Round {round}
        </div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tron-blue to-tron-glow font-space">
          BATTLE TRON
        </h1>
      </div>
      
      <div className="flex items-center mb-4">
        <GameModeSelector 
          gameMode={gameMode} 
          onGameModeChange={onGameModeChange} 
        />
      </div>
    </>
  );
};

export default GameHeader;
