
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useGameContext } from '@/context/GameContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface GameSetupProps {
  onSetupComplete: (gridWidth: number, gridHeight: number, fps: number) => void;
  initialGridWidth: number;
  initialGridHeight: number;
  initialFPS: number;
}

const GameSetup: React.FC<GameSetupProps> = ({ 
  onSetupComplete, 
  initialGridWidth, 
  initialGridHeight, 
  initialFPS 
}) => {
  const { savedFPS } = useGameContext();
  const [gridWidth, setGridWidth] = useState(initialGridWidth);
  const [gridHeight, setGridHeight] = useState(initialGridHeight);
  const [fps, setFps] = useState(savedFPS || initialFPS);
  const [devMode, setDevMode] = useState(false);
  
  // Min and max values for sliders
  const minGridSize = 20;
  const maxGridSize = 80;
  const minFps = 2;
  const maxFps = 20;
  
  const handleStartGame = () => {
    // You could use devMode here or pass it to a context
    // For now we'll just log it
    console.log("Dev mode:", devMode);
    
    onSetupComplete(gridWidth, gridHeight, fps);
  };
  
  return (
    <div className="glass-panel rounded-xl p-6 animate-game-fade-in w-full max-w-md mt-4">
      <h2 className="text-xl font-medium text-tron-text mb-6 text-center">Game Setup</h2>
      
      <div className="space-y-6">
        {/* Grid Width Control */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-tron-text/80">Grid Width: {gridWidth}</label>
            <span className="text-xs text-tron-text/60">{minGridSize}-{maxGridSize}</span>
          </div>
          <Slider
            value={[gridWidth]}
            min={minGridSize}
            max={maxGridSize}
            step={1}
            onValueChange={(value) => setGridWidth(value[0])}
            className="accent-tron-blue"
          />
        </div>
        
        {/* Grid Height Control */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-tron-text/80">Grid Height: {gridHeight}</label>
            <span className="text-xs text-tron-text/60">{minGridSize}-{maxGridSize}</span>
          </div>
          <Slider
            value={[gridHeight]}
            min={minGridSize}
            max={maxGridSize}
            step={1}
            onValueChange={(value) => setGridHeight(value[0])}
            className="accent-tron-blue"
          />
        </div>
        
        {/* FPS Control */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm text-tron-text/80">Speed (FPS): {fps}</label>
            <span className="text-xs text-tron-text/60">{minFps}-{maxFps}</span>
          </div>
          <Slider
            value={[fps]}
            min={minFps}
            max={maxFps}
            step={1}
            onValueChange={(value) => setFps(value[0])}
            className="accent-tron-blue"
          />
          <div className="text-xs text-tron-text/60 text-center mt-1">
            Higher FPS = Faster Game
          </div>
        </div>
        
        {/* Dev Mode Toggle - You can remove this in production */}
        <div className="flex items-center space-x-2 pt-2 pb-2">
          <Switch 
            id="dev-mode" 
            checked={devMode} 
            onCheckedChange={setDevMode} 
            className="data-[state=checked]:bg-tron-blue" 
          />
          <Label htmlFor="dev-mode" className="text-sm text-tron-text/80">
            Development Mode (Mock API)
          </Label>
        </div>
        
        <div className="pt-4">
          <Button
            onClick={handleStartGame}
            className="w-full btn-glow bg-tron-blue/20 text-tron-blue border border-tron-blue/50 hover:bg-tron-blue/30 text-lg py-6"
          >
            Start Game
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameSetup;
