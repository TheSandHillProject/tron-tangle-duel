import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Award, Clock, Calendar } from 'lucide-react';
import { useGameContext } from '@/context/GameContext';
import BackToHome from '@/components/BackToHome';

interface LeaderboardEntry {
  id: number;
  username: string;
  score: number;
  rank: number;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  userCount: number;
  type: 'daily' | 'weekly' | 'monthly';
}

const mockDailyData: LeaderboardEntry[] = [
  { id: 1, username: "TronMaster", score: 5200, rank: 1 },
  { id: 2, username: "LightCycle", score: 4800, rank: 2 },
  { id: 3, username: "GridRunner", score: 4500, rank: 3 },
  { id: 4, username: "DiscUser", score: 4100, rank: 4 },
  { id: 5, username: "ByteRider", score: 3900, rank: 5 },
];

const mockWeeklyData: LeaderboardEntry[] = [
  { id: 6, username: "NeonRider", score: 12500, rank: 1 },
  { id: 7, username: "CyberHunter", score: 11200, rank: 2 },
  { id: 1, username: "TronMaster", score: 10800, rank: 3 },
  { id: 8, username: "DataStream", score: 9500, rank: 4 },
  { id: 9, username: "ProgramUser", score: 8700, rank: 5 },
];

const mockMonthlyData: LeaderboardEntry[] = [
  { id: 6, username: "NeonRider", score: 42000, rank: 1 },
  { id: 10, username: "VirtualHero", score: 38500, rank: 2 },
  { id: 11, username: "CodeWarrior", score: 36200, rank: 3 },
  { id: 1, username: "TronMaster", score: 35000, rank: 4 },
  { id: 12, username: "GridMaster", score: 33500, rank: 5 },
];

const LeaderboardTable: React.FC<LeaderboardProps> = ({ entries, userCount, type }) => {
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

  return (
    <div className={`rounded-xl ${getBgColor()} p-5 border ${getShadowColor()}`}>
      <div className="space-y-4">
        <div className="grid grid-cols-4 text-sm font-medium px-4 py-2">
          <div className="text-left">Rank</div>
          <div className="col-span-2 text-left">Player</div>
          <div className="text-right">Score</div>
        </div>
        <div className="space-y-2">
          {entries.map((entry) => (
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
          ))}
        </div>
        <div className={`mt-4 text-center text-sm font-medium ${getTextColor()}`}>
          {userCount} unique {type} players
        </div>
      </div>
    </div>
  );
};

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("daily");
  const { lastGameMode } = useGameContext();
  
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
                entries={mockDailyData} 
                userCount={42} 
                type="daily" 
              />
            </TabsContent>
            <TabsContent value="weekly">
              <LeaderboardTable 
                entries={mockWeeklyData} 
                userCount={156} 
                type="weekly" 
              />
            </TabsContent>
            <TabsContent value="monthly">
              <LeaderboardTable 
                entries={mockMonthlyData} 
                userCount={372} 
                type="monthly" 
              />
            </TabsContent>
          </Tabs>
        </div>
        
        <BackToHome />
      </div>
    </div>
  );
};

export default Leaderboard;
