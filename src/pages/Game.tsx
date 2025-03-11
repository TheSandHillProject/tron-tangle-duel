
import React, { useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import Game from '@/components/Game';
import { useGameContext } from '@/context/GameContext';
import BackToHome from '@/components/BackToHome';
import { GameProvider } from '@/context/GameContext';

const GamePage = () => {
  const { mode } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  
  // Validate mode parameter
  if (mode !== 'single' && mode !== 'two') {
    return <Navigate to="/" replace />;
  }

  return (
    <GameProvider>
      <div className="min-h-screen flex flex-col items-center py-8 px-4">
        <div className="w-full max-w-4xl">
          <Game 
            initialGameMode={mode as 'single' | 'two'} 
            onGameModeChange={(newMode) => {
              if (newMode !== mode) {
                navigate(`/game/${newMode}`, { replace: true });
              }
            }}
          />
        </div>
        
        <BackToHome />
        
        <footer className="mt-auto pt-8 pb-4 text-xs text-tron-text/50">
          <p className="text-center">
            &copy; 2025 Nic Pavao. All Rights Reserved.
          </p>
        </footer>
      </div>
    </GameProvider>
  );
};

export default GamePage;
