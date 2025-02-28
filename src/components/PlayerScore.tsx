
import React from 'react';

interface PlayerScoreProps {
  playerName: string;
  score: number;
  color: string;
}

const PlayerScore: React.FC<PlayerScoreProps> = ({ playerName, score, color }) => {
  const isBlue = color === 'blue';
  
  return (
    <div className="flex flex-col items-center animate-game-fade-in">
      <div 
        className={`text-sm font-medium mb-1 px-3 py-1 rounded-full ${
          isBlue ? 'text-tron-blue bg-tron-blue/10' : 'text-tron-orange bg-tron-orange/10'
        }`}
      >
        {playerName}
      </div>
      <div 
        className={`text-4xl font-bold ${
          isBlue ? 'text-tron-blue' : 'text-tron-orange'
        } animate-pulse-glow`}
      >
        {score}
      </div>
    </div>
  );
};

export default PlayerScore;
