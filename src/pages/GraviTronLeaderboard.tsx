
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import BackToHome from '@/components/BackToHome';
import { Trophy, ArrowLeft, User } from 'lucide-react';
import { useUserContext } from '@/context/UserContext';
import {
  useLifetimeLeaderboard,
  useGraviTronStats,
  useUserGraviTronRanking
} from '@/services/gravitronLeaderboardService';
import { Skeleton } from '@/components/ui/skeleton';
import { useGameContext } from '@/context/GameContext';

const GraviTronLeaderboard = () => {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { setShowGraviTronEndScreen } = useGameContext();
  
  // Fetch data using React Query
  const lifetimeData = useLifetimeLeaderboard();
  const stats = useGraviTronStats();
  const userLifetimeRanking = useUserGraviTronRanking(user?.id);
  
  const handleBackClick = () => {
    // Set the flag to show the gravitron end screen when returning to game
    setShowGraviTronEndScreen(true);
    navigate('/game/single');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-black text-white py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={handleBackClick}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold text-red-500 font-space" style={{textShadow: '0 0 10px #ff0000, 0 0 20px #ff0000'}}>
            GRAVITRON LEADERBOARD
          </h1>
          
          <div className="w-24"></div> {/* Spacer to center the title */}
        </div>
        
        <div className="glass-panel bg-red-950/30 border-red-900/50 rounded-xl p-6 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
          <div className="overflow-hidden rounded-lg border border-red-900/50">
            <table className="w-full text-left">
              <thead className="bg-red-900/30">
                <tr>
                  <th className="p-4 font-medium text-red-200 text-sm">Rank</th>
                  <th className="p-4 font-medium text-red-200 text-sm">User</th>
                  <th className="p-4 font-medium text-red-200 text-sm text-right">GraviTrons Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-900/30">
                {lifetimeData.isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="bg-red-950/20">
                      <td className="p-4"><Skeleton className="h-5 w-8" /></td>
                      <td className="p-4"><Skeleton className="h-5 w-32" /></td>
                      <td className="p-4 text-right"><Skeleton className="h-5 w-12 ml-auto" /></td>
                    </tr>
                  ))
                ) : lifetimeData.data?.map((entry) => (
                  <tr key={entry.id} className="bg-red-950/20 hover:bg-red-950/40 transition-colors">
                    <td className="p-4 font-mono">{entry.rank}</td>
                    <td className="p-4 font-medium">{entry.username}</td>
                    <td className="p-4 text-right font-mono text-red-300">{entry.count}</td>
                  </tr>
                ))}
                
                {user && (
                  <>
                    <tr>
                      <td colSpan={3} className="p-0">
                        <Separator className="h-[2px] bg-red-600/70" />
                      </td>
                    </tr>
                    <tr className="bg-red-950/40 hover:bg-red-950/60 transition-colors">
                      <td className="p-4 font-mono">
                        {userLifetimeRanking.isLoading ? (
                          <Skeleton className="h-5 w-12" />
                        ) : (
                          `#${userLifetimeRanking.data?.rank || '-'}`
                        )}
                      </td>
                      <td className="p-4 font-medium">You</td>
                      <td className="p-4 text-right font-mono text-red-300">
                        {userLifetimeRanking.isLoading ? (
                          <Skeleton className="h-5 w-8 ml-auto" />
                        ) : (
                          userLifetimeRanking.data?.count || '-'
                        )}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
            
            {!user && (
              <div className="text-center py-4 text-red-400/80 bg-red-950/20">
                <User className="h-6 w-6 mx-auto mb-2 text-red-400/60" />
                <p className="text-sm">Sign in to see your ranking</p>
              </div>
            )}
          </div>
          
          {user && (
            <div className="flex justify-center items-center text-sm text-red-400/80 mt-4">
              <Trophy className="h-4 w-4 mr-2 text-red-400/60" />
              <span>
                {stats.isLoading ? (
                  <Skeleton className="h-4 w-32 inline-block" />
                ) : (
                  `${stats.data?.totalGravitrons || 0} total GraviTrons collected`
                )}
              </span>
            </div>
          )}
          
          <div className="mt-6 text-xs text-center text-red-400/60">
            <p>Achieving heat death of the universe places you among the cosmic elite</p>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <BackToHome />
        </div>
      </div>
    </div>
  );
};

export default GraviTronLeaderboard;
