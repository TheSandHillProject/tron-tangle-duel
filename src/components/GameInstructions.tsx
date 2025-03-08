
import React from 'react';

interface GameInstructionsProps {
  gameMode: 'single' | 'two';
}

const GameInstructions: React.FC<GameInstructionsProps> = ({ gameMode }) => {
  return (
    <div className="mt-6 glass-panel rounded-xl p-4 text-sm text-tron-text/80 max-w-md animate-game-fade-in">
      <h3 className="font-medium mb-2 text-tron-text text-center">How to Play</h3>
      {gameMode === 'single' ? (
        <div className="text-center">
          <p className="text-tron-blue font-medium mb-1">Controls</p>
          <ul className="space-y-1">
            <li>↑ - Move Up</li>
            <li>↓ - Move Down</li>
            <li>← - Move Left</li>
            <li>→ - Move Right</li>
            <li>1 - Shoot Bullet</li>
            <li>2 - Deploy NeuTron Bomb</li>
            <li>Space - Pause/Resume</li>
          </ul>
          <div className="mt-2 pt-2 border-t border-tron-text/10">
            <p className="text-yellow-300 font-medium">Collect yellow tokens to get bullets!</p>
            <p>Use bullets to cut your trail and create shortcuts.</p>
            <p className="text-purple-500 font-medium mt-1">With 10 bullets, a purple NeuTron Bomb token appears!</p>
            <p>Collect it and use the 2 key to clear all walls and add an extra bullet on the map.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-tron-blue font-medium mb-1">Player 1</p>
            <ul className="space-y-1">
              <li>W - Move Up</li>
              <li>S - Move Down</li>
              <li>A - Move Left</li>
              <li>D - Move Right</li>
              <li>1 - Shoot Bullet</li>
            </ul>
          </div>
          <div>
            <p className="text-tron-orange font-medium mb-1">Player 2</p>
            <ul className="space-y-1">
              <li>↑ - Move Up</li>
              <li>↓ - Move Down</li>
              <li>← - Move Left</li>
              <li>→ - Move Right</li>
              <li>/ - Shoot Bullet</li>
            </ul>
          </div>
          <div className="col-span-2 mt-2 pt-2 border-t border-tron-text/10">
            <p className="mb-1">Space - Pause/Resume</p>
            <p className="text-yellow-300 font-medium">Collect yellow tokens to get bullets!</p>
            <p>Use bullets to cut your opponent's trail or your own trail.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameInstructions;
