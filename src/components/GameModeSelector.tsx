
import React from 'react';
import { Link } from 'react-router-dom';

interface GameModeSelectorProps {
  gameMode: 'single' | 'two';
  onGameModeChange: (mode: 'single' | 'two') => void;
}

const GameModeSelector: React.FC<GameModeSelectorProps> = ({ gameMode, onGameModeChange }) => {
  return (
    <div className="flex items-center gap-2 animate-game-fade-in">
      <button 
        onClick={() => onGameModeChange('single')}
        className={`px-3 py-1.5 rounded-lg transition-all ${
          gameMode === 'single' 
            ? 'bg-tron-blue text-white font-medium btn-glow'
            : 'bg-tron-blue/10 text-tron-blue/80 hover:bg-tron-blue/20'
        }`}
      >
        Single Player
      </button>
      
      <button 
        onClick={() => onGameModeChange('two')}
        className={`px-3 py-1.5 rounded-lg transition-all ${
          gameMode === 'two' 
            ? 'bg-tron-orange text-white font-medium btn-glow'
            : 'bg-tron-orange/10 text-tron-orange/80 hover:bg-tron-orange/20'
        }`}
      >
        Two Players
      </button>
      
      <Link 
        to="/leaderboard" 
        className="px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-500/80 hover:bg-purple-500/20 transition-all"
      >
        Leaderboard
      </Link>
    </div>
  );
};

export default GameModeSelector;
