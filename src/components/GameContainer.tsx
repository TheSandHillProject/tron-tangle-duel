
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoginPrompt from './LoginPrompt';
import GameSetup from './GameSetup';
import GameModeSelector from './GameModeSelector';
import { useUserContext } from '@/context/UserContext';
import { useGameContext } from '@/context/GameContext';

interface GameContainerProps {
  children: React.ReactNode;
  gameMode: 'single' | 'two';
  onGameModeChange: (mode: 'single' | 'two') => void;
  isSetup: boolean;
  onSetupComplete: (width: number, height: number, fps: number) => void;
  gridWidth: number;
  gridHeight: number;
  framesPerSecond: number;
}

const GameContainer: React.FC<GameContainerProps> = ({
  children,
  gameMode,
  onGameModeChange,
  isSetup,
  onSetupComplete,
  gridWidth,
  gridHeight,
  framesPerSecond
}) => {
  const { user, isLoading: isUserLoading } = useUserContext();
  const [needsLogin, setNeedsLogin] = useState<boolean>(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      setNeedsLogin(true);
    } else {
      setNeedsLogin(false);
    }
  }, [user, isUserLoading]);

  if (needsLogin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center py-8 px-4">
        <div className="w-full max-w-4xl">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tron-blue to-tron-glow font-space text-center mb-8">
            BATTLE TRON
          </h1>
          <LoginPrompt onComplete={() => setNeedsLogin(false)} />
          <div className="mt-8 text-center">
            <Link 
              to="/"
              className="text-gray-400/80 hover:text-gray-300 transition-colors font-medium"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSetup) {
    return (
      <div className="flex flex-col items-center">
        <div className="mb-2 text-center animate-game-fade-in">
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
        
        <GameSetup 
          onSetupComplete={onSetupComplete}
          initialGridWidth={gridWidth}
          initialGridHeight={gridHeight}
          initialFPS={framesPerSecond}
        />
      </div>
    );
  }

  return <>{children}</>;
};

export default GameContainer;
