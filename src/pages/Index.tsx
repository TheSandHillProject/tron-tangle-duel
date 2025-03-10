
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGameContext } from '@/context/GameContext';
import { useUserContext } from '@/context/UserContext';
import LoginPrompt from '@/components/LoginPrompt';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const Index = () => {
  const { setNavigatingFrom, setSkipSetup } = useGameContext();
  const { user, isLoading, logout } = useUserContext();
  const [showLogin, setShowLogin] = useState(false);
  
  const handleNavigate = () => {
    setNavigatingFrom('/');
    setSkipSetup(false); // Always show setup when coming from homepage
  };
  
  // Show login screen if not logged in and button clicked
  const handleGameButtonClick = () => {
    if (!user && !showLogin) {
      setShowLogin(true);
      return false; // Prevent navigation
    }
    handleNavigate();
    return true; // Allow navigation
  };

  const handleLogout = () => {
    logout();
    setShowLogin(false);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-tron-background">
        <div className="text-tron-blue animate-pulse">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-tron-background py-8 px-4">
      <div className="w-full max-w-4xl flex flex-col items-center animate-game-fade-in">
        <h1 className="text-6xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tron-blue to-tron-glow font-space mb-12">
          BATTLE TRON
        </h1>
        
        {showLogin && !user ? (
          <LoginPrompt onComplete={() => setShowLogin(false)} />
        ) : (
          <>
            {user && (
              <div className="mb-8 bg-tron-blue/10 px-4 py-2 rounded-lg text-tron-blue flex items-center justify-between w-full max-w-md">
                <span>Welcome, <span className="font-medium">{user.username}</span>!</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-tron-blue hover:bg-tron-blue/20"
                >
                  <LogOut size={16} className="mr-1" /> Sign Out
                </Button>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-6 mt-8">
              <Link 
                to="/game/single" 
                className="px-10 py-5 rounded-lg border-2 border-tron-blue text-tron-blue hover:bg-tron-blue/20 
                shadow-neon-blue transition-all duration-300 font-medium font-space text-xl"
                onClick={(e) => !handleGameButtonClick() && e.preventDefault()}
              >
                SINGLE PLAYER
              </Link>
              
              <Link 
                to="/game/two" 
                className="px-10 py-5 rounded-lg border-2 border-tron-orange text-tron-orange hover:bg-tron-orange/20
                shadow-neon-orange transition-all duration-300 font-medium font-space text-xl"
                onClick={(e) => !handleGameButtonClick() && e.preventDefault()}
              >
                TWO PLAYERS
              </Link>
              
              <Link 
                to="/leaderboard" 
                className="px-10 py-5 rounded-lg border-2 border-purple-500 text-purple-500 hover:bg-purple-500/20
                shadow-[0_0_5px_theme('colors.purple.500'),_0_0_10px_theme('colors.purple.500')] transition-all duration-300 font-medium font-space text-xl"
              >
                LEADERBOARD
              </Link>
            </div>
          </>
        )}

        {/* Game instructions */}
        <div className="mt-12 glass-panel rounded-xl p-4 text-sm text-tron-text/80 max-w-md animate-game-fade-in">
          <h3 className="font-medium mb-2 text-tron-text text-center">How to Play</h3>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-tron-blue font-medium mb-1">Player 1</p>
              <ul className="space-y-1">
                <li>↑ - Move Up*</li>
                <li>↓ - Move Down*</li>
                <li>← - Move Left*</li>
                <li>→ - Move Right*</li>
                <li>1 - Shoot Bullet</li>
              </ul>
              <p className="text-xs mt-1">*In 2-player mode, use WASD</p>
            </div>
            <div>
              <p className="text-tron-orange font-medium mb-1">Player 2</p>
              <ul className="space-y-1">
                <li>↑ - Move Up</li>
                <li>↓ - Move Down</li>
                <li>← - Move Left</li>
                <li>→ - Move Right</li>
                <li>/ - Shoot Bullet</li>
              </ul>
            </div>
            <div className="col-span-2 mt-2 pt-2 border-t border-tron-text/10">
              <p className="mb-1">Space - Pause/Resume</p>
              <p className="text-yellow-300 font-medium">Collect yellow tokens to get bullets!</p>
              <p>Use bullets to cut your opponent's trail or your own trail.</p>
            </div>
          </div>
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
