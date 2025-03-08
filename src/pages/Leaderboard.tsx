
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Clock, Calendar, Users, Trophy } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import { useUserContext } from '@/context/UserContext';
import BackToHome from '@/components/BackToHome';
import { 
  useLeaderboardData, 
  useLeaderboardStats, 
  useUserRanking,
  type LeaderboardEntry 
} from '@/services/leaderboardService';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  userCount: number;
  userRanking: { rank: number; score: number } | null;
  type: 'daily' | 'weekly' | 'monthly';
  isLoading: boolean;
  isUserRankingLoading: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ 
  entries, 
  userCount, 
  userRanking,
  type, 
  isLoading,
  isUserRankingLoading
}) => {
  const { user } = useUserContext();

  const getBgColor = () => {
    switch (type) {
      case 'daily': return 'bg-tron-blue/10 border-tron-blue/30';
      case 'weekly': return 'bg-tron-orange/10 border-tron-orange/30';
      case 'monthly': return 'bg-purple-500/10 border-purple-500/30';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'daily': return 'text-tron-blue';
      case 'weekly': return 'text-tron-orange';
      case 'monthly': return 'text-purple-500';
    }
  };

  const getShadowColor = () => {
    switch (type) {
      case 'daily': return 'shadow-[0_0_10px_rgba(12,208,255,0.3)]';
      case 'weekly': return 'shadow-[0_0_10px_rgba(255,153,0,0.3)]';
      case 'monthly': return 'shadow-[0_0_10px_rgba(168,85,247,0.3)]';
    }
  };

  const getSeparatorColor = () => {
    switch (type) {
      case 'daily': return 'bg-tron-blue/50';
      case 'weekly': return 'bg-tron-orange/50';
      case 'monthly': return 'bg-purple-500/50';
    }
  };

  return (
    <div className={`rounded-xl ${getBgColor()} p-5 border ${getShadowColor()}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-4 text-sm font-medium px-4 py-2">
          <div className="text-left">Rank</div>
          <div className="col-span-2 text-left">Player</div>
          <div className="text-right">Score</div>
        </div>
        <div className="space-y-2">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 items-center px-4 py-3 rounded-lg bg-black/20">
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-6 w-32 col-span-2" />
                <Skeleton className="h-6 w-20 ml-auto" />
              </div>
            ))
          ) : (
            entries.map((entry) => (
              <div
                key={entry.id}
                className={`grid grid-cols-4 items-center px-4 py-3 rounded-lg bg-black/20 hover:bg-black/40 transition-colors`}
              >
                <div className="flex items-center text-left">
                  <span className={`font-bold ${getTextColor()}`}>#{entry.rank}</span>
                </div>
                <div className="col-span-2 text-left font-medium">{entry.username}</div>
                <div className={`text-right font-mono font-bold ${getTextColor()}`}>{entry.score.toLocaleString()}</div>
              </div>
            ))
          )}
        </div>

        {/* Separator with themed color */}
        <div className="py-2">
          <Separator className={`${getSeparatorColor()} h-0.5`} />
        </div>

        {/* User's personal ranking */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-4 py-1">
            <span className={`text-sm font-medium ${getTextColor()}`}>
              <Trophy size={14} className="inline mr-1" />
              Your Ranking
            </span>
          </div>

          {isUserRankingLoading || !user ? (
            <div className="grid grid-cols-4 items-center px-4 py-3 rounded-lg bg-black/20">
              <Skeleton className="h-6 w-8" />
              <Skeleton className="h-6 w-32 col-span-2" />
              <Skeleton className="h-6 w-20 ml-auto" />
            </div>
          ) : userRanking ? (
            <div className={`grid grid-cols-4 items-center px-4 py-3 rounded-lg bg-black/30 ${getShadowColor()} border-t border-b border-${type === 'daily' ? 'tron-blue' : type === 'weekly' ? 'tron-orange' : 'purple-500'}/30`}>
              <div className="flex items-center text-left">
                <span className={`font-bold ${getTextColor()}`}>#{userRanking.rank}</span>
              </div>
              <div className="col-span-2 text-left font-medium">You</div>
              <div className={`text-right font-mono font-bold ${getTextColor()}`}>{userRanking.score.toLocaleString()}</div>
            </div>
          ) : (
            <div className="text-center py-3 text-sm text-tron-text/70">
              Play a game to see your ranking!
            </div>
          )}
        </div>
        
        <div className={`mt-4 flex justify-center items-center gap-2 text-sm font-medium ${getTextColor()}`}>
          <Users size={14} />
          {isLoading ? (
            <Skeleton className="h-5 w-16" />
          ) : (
            <span>{userCount.toLocaleString()} unique {type} players</span>
          )}
        </div>
      </div>
    </div>
  );
};

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const { lastGameMode } = useGameContext();
  const { user } = useUserContext();
  
  // Fetch leaderboard data
  const dailyData = useLeaderboardData('daily');
  const weeklyData = useLeaderboardData('weekly');
  const monthlyData = useLeaderboardData('monthly');
  
  // Fetch leaderboard stats
  const dailyStats = useLeaderboardStats('daily');
  const weeklyStats = useLeaderboardStats('weekly');
  const monthlyStats = useLeaderboardStats('monthly');
  
  // Fetch user rankings
  const dailyUserRanking = useUserRanking(user?.id, 'daily');
  const weeklyUserRanking = useUserRanking(user?.id, 'weekly');
  const monthlyUserRanking = useUserRanking(user?.id, 'monthly');
  
  const singlePlayerRoute = lastGameMode === 'single' ? "/game/single" : "/game/single";
  const twoPlayerRoute = lastGameMode === 'two' ? "/game/two" : "/game/two";

  return (
    <div className="min-h-screen flex flex-col items-center bg-tron-background py-12 px-4">
      <div className="w-full max-w-4xl flex flex-col items-center animate-game-fade-in">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-tron-blue to-purple-500 font-space mb-8">
          LEADERBOARD
        </h1>

        <div className="flex items-center gap-6 mb-8">
          <Link 
            to={singlePlayerRoute}
            className="px-3 py-1.5 rounded-lg bg-tron-blue/10 text-tron-blue/80 hover:bg-tron-blue/20 transition-all"
          >
            Single Player
          </Link>
          
          <Link 
            to={twoPlayerRoute}
            className="px-3 py-1.5 rounded-lg bg-tron-orange/10 text-tron-orange/80 hover:bg-tron-orange/20 transition-all"
          >
            Two Players
          </Link>
          
          <Link 
            to="/leaderboard" 
            className="px-3 py-1.5 rounded-lg bg-purple-500 text-white font-medium shadow-[0_0_10px_rgba(168,85,247,0.5)]"
          >
            Leaderboard
          </Link>
        </div>
        
        <div className="w-full">
          <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-3 mb-8">
              <TabsTrigger 
                value="daily"
                className="data-[state=active]:bg-tron-blue/20 data-[state=active]:text-tron-blue data-[state=active]:shadow-[0_0_10px_rgba(12,208,255,0.5)]"
              >
                <Award className="mr-2 h-4 w-4" />
                Daily
              </TabsTrigger>
              <TabsTrigger 
                value="weekly"
                className="data-[state=active]:bg-tron-orange/20 data-[state=active]:text-tron-orange data-[state=active]:shadow-[0_0_10px_rgba(255,153,0,0.5)]"
              >
                <Clock className="mr-2 h-4 w-4" />
                Weekly
              </TabsTrigger>
              <TabsTrigger 
                value="monthly"
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-500 data-[state=active]:shadow-[0_0_10px_rgba(168,85,247,0.5)]"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Monthly
              </TabsTrigger>
            </TabsList>
            <TabsContent value="daily">
              <LeaderboardTable 
                entries={dailyData.data || []} 
                userCount={dailyStats.data?.uniqueUsers || 0} 
                userRanking={dailyUserRanking.data || null}
                type="daily" 
                isLoading={dailyData.isLoading || dailyStats.isLoading}
                isUserRankingLoading={dailyUserRanking.isLoading}
              />
            </TabsContent>
            <TabsContent value="weekly">
              <LeaderboardTable 
                entries={weeklyData.data || []} 
                userCount={weeklyStats.data?.uniqueUsers || 0} 
                userRanking={weeklyUserRanking.data || null}
                type="weekly" 
                isLoading={weeklyData.isLoading || weeklyStats.isLoading}
                isUserRankingLoading={weeklyUserRanking.isLoading}
              />
            </TabsContent>
            <TabsContent value="monthly">
              <LeaderboardTable 
                entries={monthlyData.data || []} 
                userCount={monthlyStats.data?.uniqueUsers || 0} 
                userRanking={monthlyUserRanking.data || null}
                type="monthly" 
                isLoading={monthlyData.isLoading || monthlyStats.isLoading}
                isUserRankingLoading={monthlyUserRanking.isLoading}
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <BackToHome />

        <footer className="mt-auto pt-8 pb-4 text-xs text-tron-text/50">
        <p className="text-center">
          &copy; 2025 Fermi Strategies, Inc. All Rights Reserved.
        </p>
      </footer>
      </div>
    </div>
  );
};

export default Leaderboard;
