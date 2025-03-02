
import React from 'react';

interface SpeedControlProps {
  speedMultiplier: number;
  onSpeedChange: (value: number) => void;
}

const SpeedControl: React.FC<SpeedControlProps> = ({ speedMultiplier, onSpeedChange }) => {
  // Speed options
  const speedOptions = [1, 2, 3, 4];
  
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(event.target.value, 10);
    onSpeedChange(newSpeed);
  };
  
  return (
    <div className="glass-panel rounded-xl p-3 mb-4 animate-game-fade-in w-full max-w-md">
      <div className="flex items-center justify-between">
        <div className="text-sm text-tron-text/80 mr-3 whitespace-nowrap">Speed: {speedMultiplier}x</div>
        <div className="w-full flex-1">
          <input 
            type="range" 
            min="1" 
            max="4" 
            step="1" 
            value={speedMultiplier}
            onChange={handleChange}
            className="w-full accent-tron-blue bg-tron-blue/20"
          />
        </div>
        <div className="flex space-x-2 ml-3">
          {speedOptions.map(speed => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${
                speedMultiplier === speed 
                  ? 'bg-tron-blue text-black' 
                  : 'bg-tron-blue/20 text-tron-blue hover:bg-tron-blue/30'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpeedControl;
