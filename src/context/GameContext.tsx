
// Import React and create context
import React, { createContext, useContext, useState, useEffect } from 'react';

interface GameContextType {
  skipSetup: boolean;
  setSkipSetup: React.Dispatch<React.SetStateAction<boolean>>;
  lastGameMode: 'single' | 'two';
  setLastGameMode: React.Dispatch<React.SetStateAction<'single' | 'two'>>;
  navigatingFrom: string | null;
  setNavigatingFrom: React.Dispatch<React.SetStateAction<string | null>>;
  savedFPS: number;
  setSavedFPS: React.Dispatch<React.SetStateAction<number>>;
  showGraviTronEndScreen: boolean;
  setShowGraviTronEndScreen: React.Dispatch<React.SetStateAction<boolean>>;
}

// Create context with default values
const GameContext = createContext<GameContextType>({
  skipSetup: false,
  setSkipSetup: () => {},
  lastGameMode: 'single',
  setLastGameMode: () => {},
  navigatingFrom: null,
  setNavigatingFrom: () => {},
  savedFPS: 15,
  setSavedFPS: () => {},
  showGraviTronEndScreen: false,
  setShowGraviTronEndScreen: () => {},
});

// Provider component
export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [skipSetup, setSkipSetup] = useState<boolean>(false);
  const [lastGameMode, setLastGameMode] = useState<'single' | 'two'>('single');
  const [navigatingFrom, setNavigatingFrom] = useState<string | null>(null);
  const [savedFPS, setSavedFPS] = useState<number>(15);
  const [showGraviTronEndScreen, setShowGraviTronEndScreen] = useState<boolean>(false);

  // Debug logs to track state changes
  useEffect(() => {
    console.log('GameContext: showGraviTronEndScreen changed to', showGraviTronEndScreen);
  }, [showGraviTronEndScreen]);

  const value = {
    skipSetup,
    setSkipSetup,
    lastGameMode,
    setLastGameMode,
    navigatingFrom,
    setNavigatingFrom,
    savedFPS,
    setSavedFPS,
    showGraviTronEndScreen,
    setShowGraviTronEndScreen,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hook for using the context
export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};
