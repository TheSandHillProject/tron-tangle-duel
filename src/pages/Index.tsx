
import React from 'react';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tron-background py-8 px-4">
      <div className="w-full max-w-4xl flex flex-col items-center animate-game-fade-in">
        <h1 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tron-blue to-tron-glow font-space mb-12">
          BATTLE TRON
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-6 mt-8">
          <Link 
            to="/game/single" 
            className="px-10 py-5 rounded-lg border-2 border-tron-blue text-tron-blue hover:bg-tron-blue/20 
            shadow-neon-blue transition-all duration-300 font-medium font-space text-xl"
          >
            SINGLE PLAYER
          </Link>
          
          <Link 
            to="/game/two" 
            className="px-10 py-5 rounded-lg border-2 border-tron-orange text-tron-orange hover:bg-tron-orange/20
            shadow-neon-orange transition-all duration-300 font-medium font-space text-xl"
          >
            TWO PLAYERS
          </Link>
        </div>
      </div>
      
      <footer className="mt-auto pt-8 pb-4 text-xs text-tron-text/50">
        <p className="text-center">
          &copy; 2025 Nic Pavao. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
