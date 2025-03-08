
import React, { createContext, useState, useContext } from 'react';

interface GameContextType {
  skipSetup: boolean;
  setSkipSetup: (skip: boolean) => void;
  lastGameMode: 'single' | 'two' | null;
  setLastGameMode: (mode: 'single' | 'two' | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [skipSetup, setSkipSetup] = useState(false);
  const [lastGameMode, setLastGameMode] = useState<'single' | 'two' | null>(null);

  return (
    <GameContext.Provider value={{ 
      skipSetup, 
      setSkipSetup, 
      lastGameMode, 
      setLastGameMode 
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
