import React, { useState } from 'react';
import { Button } from './ui/button';
import { HelpCircle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';

interface GameInstructionsProps {
  gameMode: 'single' | 'two';
}

const GameInstructions: React.FC<GameInstructionsProps> = ({ gameMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="mt-4">
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs gap-2 bg-gray-500/20 text-tron-text/70 border-gray-500/30 hover:bg-gray-500/30 hover:text-tron-text transition-colors h-9"
          >
            <HelpCircle className="h-4 w-4" />
            How to Play
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-h-[80vh] overflow-y-auto bg-tron-dark max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-tron-blue font-space">
              How to Play {gameMode === 'single' ? 'Single Player Mode' : 'Two Player Mode'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-tron-text">
              <div>
                <h3 className="font-medium text-tron-blue mb-1">Objective</h3>
                {gameMode === 'single' ? (
                  <p>
                    Collect as many yellow tokens as possible without crashing into walls or your own trail. The longer you survive, the higher your score!
                  </p>
                ) : (
                  <p>
                    Be the last player standing! Force your opponent to crash into walls, their own trail, or yours.
                  </p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-tron-blue mb-1">Controls</h3>
                {gameMode === 'single' ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-tron-text mb-1">Movement:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-tron-text/80">
                        <li>Up Arrow: Move Up</li>
                        <li>Down Arrow: Move Down</li>
                        <li>Left Arrow: Move Left</li>
                        <li>Right Arrow: Move Right</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-tron-text mb-1">Actions:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-tron-text/80">
                        <li>1 Key: Fire Bullet</li>
                        <li>2 Key: Deploy NeuTron Bomb</li>
                        <li>Spacebar: Pause Game</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-tron-text mb-1">Player 1:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-tron-text/80">
                        <li>W: Move Up</li>
                        <li>S: Move Down</li>
                        <li>A: Move Left</li>
                        <li>D: Move Right</li>
                        <li>1 Key: Fire Bullet</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-tron-text mb-1">Player 2:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-tron-text/80">
                        <li>Up Arrow: Move Up</li>
                        <li>Down Arrow: Move Down</li>
                        <li>Left Arrow: Move Left</li>
                        <li>Right Arrow: Move Right</li>
                        <li>/ Key: Fire Bullet</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-tron-blue mb-1">Special Items</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-tron-text/80">
                  <li>
                    <span className="text-yellow-400 font-medium">Yellow Tokens</span>: Collect to gain bullets.
                  </li>
                  {gameMode === 'single' && (
                    <>
                      <li>
                        <span className="text-purple-400 font-medium">Purple NeuTron</span>: Appears when you have 10+ bullets. Collect to convert bullets into a NeuTron Bomb and clear your trail.
                      </li>
                      <li>
                        <span className="text-orange-400 font-medium">Orange HydroTron</span>: Appears after collecting 3 NeuTron Bombs. Collect this token to convert your <a href="https://en.wikipedia.org/wiki/Trinity_(nuclear_test)" target="_blank" rel="noopener noreferrer" className="text-red-500 font-medium hover:text-red-400 transition-colors" style={{ textShadow: '0 0 8px #ea384c, 0 0 12px #ea384c' }}>Trinity</a> of NeuTrons into a stash of HydroTrons.
                      </li>
                    </>
                  )}
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-tron-blue mb-1">Bullets</h3>
                <p className="text-sm text-tron-text/80">
                  {gameMode === 'single' 
                    ? "Use bullets to cut through your own trail to help you escape tight situations."
                    : "Use bullets to cut through trails (including your own). This can help you escape tight situations or trap your opponent."}
                </p>
              </div>
              
              {gameMode === 'single' && (
                <>
                  <div>
                    <h3 className="font-medium text-tron-blue mb-1">NeuTron Bombs</h3>
                    <p className="text-sm text-tron-text/80">
                      Deploy a NeuTron Bomb to spawn an extra token and clear your trail when you're boxed in!
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-tron-blue mb-1">HydroTron Bombs</h3>
                    <p className="text-sm text-tron-text/80">
                      Collect as many HydroTron Bombs as you possibly can. The end of the universe awaits...
                    </p>
                  </div>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="bg-tron-blue hover:bg-tron-blue/80">Got it</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GameInstructions;
