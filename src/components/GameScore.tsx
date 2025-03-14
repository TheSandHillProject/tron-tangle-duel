
import React from 'react';
import { Player } from '@/utils/gameUtils';
import PlayerScore from './PlayerScore';
import { STABILITY_THRESHOLD } from '@/utils/gameUtils';
import FeedbackDialog from './FeedbackDialog';
import GameInstructions from './GameInstructions';

interface GameScoreProps {
  players: Player[];
  gameMode: 'single' | 'two';
  bulletsCollected: number;
  highScore: number;
  gravitron: boolean;
  gravitronCollected: boolean;
}

const GameScore: React.FC<GameScoreProps> = ({ 
  players, 
  gameMode, 
  bulletsCollected, 
  highScore,
  gravitron,
  gravitronCollected
}) => {
  const player1 = players[0] || { bullets: 0, neutronBombs: 0, hydroTronsCollected: 0, score: 0 };
  const player2 = players[1];
  
  return (
    <div className="flex justify-between items-center w-full mb-4">
      <GameInstructions gameMode={gameMode} />
      
      <div className="flex justify-center items-center gap-12">
        <div className="flex flex-col items-center">
          {gameMode === 'single' ? (
            <>
              <PlayerScore 
                playerName="Player 1" 
                score={bulletsCollected * 1} // Multiply by speedMultiplier if added later 
                color="blue"
                label="Score" 
              />
              <div className="mt-1 bg-tron-blue/10 px-3 py-1 rounded text-xs text-tron-blue">
                High Score: {highScore}
              </div>
            </>
          ) : (
            <PlayerScore 
              playerName="Player 1" 
              score={player1.score || 0} 
              color="blue" 
            />
          )}
          <div className="flex gap-2 mt-1">
            <div className={`${gravitron && !gravitronCollected && gameMode === 'single' ? 
              (player1.bullets >= STABILITY_THRESHOLD ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400') : 
              'bg-tron-blue/10 text-tron-blue'} px-2 py-1 rounded text-xs`}>
              Bullets: {player1.bullets || 0}{gravitron && !gravitronCollected && gameMode === 'single' && 
                ` / ${STABILITY_THRESHOLD} ${player1.bullets >= STABILITY_THRESHOLD ? '(Stable)' : '(Unstable)'}`}
            </div>
            {gameMode === 'single' && (
              <>
                <div className="bg-tron-blue/10 px-2 py-1 rounded text-xs text-tron-blue">
                  NeuTrons: {player1.neutronBombs || 0}
                </div>
                <div className="bg-tron-blue/10 px-2 py-1 rounded text-xs text-tron-blue">
                  HydroTrons: {player1.hydroTronsCollected || 0}
                </div>
              </>
            )}
          </div>
        </div>
        
        {gameMode === 'two' && player2 && (
          <>
            <div className="text-center">
              <div className="text-xs text-tron-text/60 font-medium mb-1">VS</div>
            </div>
            
            <div className="flex flex-col items-center">
              <PlayerScore 
                playerName="Player 2" 
                score={player2.score || 0} 
                color="orange" 
              />
              <div className="mt-1 bg-tron-orange/10 px-2 py-1 rounded text-xs text-tron-orange">
                Bullets: {player2.bullets || 0}
              </div>
            </div>
          </>
        )}
      </div>
      
      <FeedbackDialog />
    </div>
  );
};

export default GameScore;
