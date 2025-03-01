
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Game from '@/components/Game';

const GamePage = () => {
  const { mode } = useParams<{ mode: string }>();
  
  // Validate mode parameter
  if (mode !== 'single' && mode !== 'two') {
    return <Navigate to="/" replace />;
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-4xl">
        <Game initialGameMode={mode as 'single' | 'two'} />
      </div>
      
      <footer className="mt-auto pt-8 pb-4 text-xs text-tron-text/50">
        <p className="text-center">
          &copy; 2025 Nic Pavao. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default GamePage;
