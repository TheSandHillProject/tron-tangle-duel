
import React, { createContext, useState, useContext } from 'react';

interface GameContextType {
  skipSetup: boolean;
  setSkipSetup: (skip: boolean) => void;
  lastGameMode: 'single' | 'two' | null;
  setLastGameMode: (mode: 'single' | 'two' | null) => void;
  navigatingFrom: string | null;
  setNavigatingFrom: (path: string | null) => void;
  savedFPS: number;
  setSavedFPS: (fps: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [skipSetup, setSkipSetup] = useState(false);
  const [lastGameMode, setLastGameMode] = useState<'single' | 'two' | null>(null);
  const [navigatingFrom, setNavigatingFrom] = useState<string | null>(null);
  const [savedFPS, setSavedFPS] = useState<number>(11); // Default FPS is 11

  return (
    <GameContext.Provider value={{ 
      skipSetup, 
      setSkipSetup, 
      lastGameMode, 
      setLastGameMode,
      navigatingFrom,
      setNavigatingFrom,
      savedFPS,
      setSavedFPS
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
