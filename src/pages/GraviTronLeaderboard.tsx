
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BackToHome from '@/components/BackToHome';
import { Trophy, Clock, ArrowLeft } from 'lucide-react';

// Mock data for gravitron leaderboard
const mockLifetimeData = [
  { id: 1, username: 'GraviMaster', count: 12, rank: 1 },
  { id: 2, username: 'CosmicDestroyer', count: 9, rank: 2 },
  { id: 3, username: 'HeatDeath', count: 7, rank: 3 },
  { id: 4, username: 'UniverseEnder', count: 5, rank: 4 },
  { id: 5, username: 'EventHorizon', count: 3, rank: 5 },
];

const mockTimeData = [
  { id: 1, username: 'SpeedRunner', time: '0:42', rank: 1 },
  { id: 2, username: 'LightSpeed', time: '0:58', rank: 2 },
  { id: 3, username: 'QuickTron', time: '1:03', rank: 3 },
  { id: 4, username: 'FastCollapse', time: '1:15', rank: 4 },
  { id: 5, username: 'RapidEnd', time: '1:21', rank: 5 },
];

const GraviTronLeaderboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lifetime');
  
  return (
    <div className="min-h-screen flex flex-col bg-black text-white py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-300 font-space">
            GRAVITRON LEADERBOARD
          </h1>
          
          <div className="w-24"></div> {/* Spacer to center the title */}
        </div>
        
        <div className="glass-panel bg-red-950/30 border-red-900/50 rounded-xl p-6 shadow-[0_0_15px_rgba(220,38,38,0.3)]">
          <Tabs defaultValue="lifetime" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-red-950/50">
              <TabsTrigger value="lifetime" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
                <Trophy className="mr-2 h-4 w-4" />
                Lifetime GraviTrons
              </TabsTrigger>
              <TabsTrigger value="fastest" className="data-[state=active]:bg-red-800 data-[state=active]:text-white">
                <Clock className="mr-2 h-4 w-4" />
                Fastest Collection
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="lifetime" className="mt-0">
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
                    {mockLifetimeData.map((entry) => (
                      <tr key={entry.id} className="bg-red-950/20 hover:bg-red-950/40 transition-colors">
                        <td className="p-4 font-mono">{entry.rank}</td>
                        <td className="p-4 font-medium">{entry.username}</td>
                        <td className="p-4 text-right font-mono text-red-300">{entry.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
            
            <TabsContent value="fastest" className="mt-0">
              <div className="overflow-hidden rounded-lg border border-red-900/50">
                <table className="w-full text-left">
                  <thead className="bg-red-900/30">
                    <tr>
                      <th className="p-4 font-medium text-red-200 text-sm">Rank</th>
                      <th className="p-4 font-medium text-red-200 text-sm">User</th>
                      <th className="p-4 font-medium text-red-200 text-sm text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-900/30">
                    {mockTimeData.map((entry) => (
                      <tr key={entry.id} className="bg-red-950/20 hover:bg-red-950/40 transition-colors">
                        <td className="p-4 font-mono">{entry.rank}</td>
                        <td className="p-4 font-medium">{entry.username}</td>
                        <td className="p-4 text-right font-mono text-red-300">{entry.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
          
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
