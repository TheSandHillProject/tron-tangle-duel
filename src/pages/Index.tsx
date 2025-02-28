
import React from 'react';
import Game from '@/components/Game';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-4xl">
        <Game />
      </div>
      
      <footer className="mt-auto pt-8 pb-4 text-xs text-tron-text/50">
        <p className="text-center">
          &copy; {new Date().getFullYear()} Tron Light Cycles Game
        </p>
      </footer>
    </div>
  );
};

export default Index;
