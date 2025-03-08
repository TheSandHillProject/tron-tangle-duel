
import { useQuery } from '@tanstack/react-query';

export interface LeaderboardEntry {
  id: number;
  username: string;
  score: number;
  rank: number;
  timestamp: string;
}

export interface LeaderboardStats {
  uniqueUsers: number;
}

// These would be real API calls in production
const mockFetchLeaderboard = async (period: 'daily' | 'weekly' | 'monthly'): Promise<LeaderboardEntry[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate some random data based on the period
  const baseEntries = [
    { id: 1, username: "TronMaster", score: 5200, rank: 1 },
    { id: 2, username: "LightCycle", score: 4800, rank: 2 },
    { id: 3, username: "GridRunner", score: 4500, rank: 3 },
    { id: 4, username: "DiscUser", score: 4100, rank: 4 },
    { id: 5, username: "ByteRider", score: 3900, rank: 5 },
  ];
  
  // Multiply scores based on time period
  const multiplier = period === 'daily' ? 1 : period === 'weekly' ? 3 : 8;
  
  return baseEntries.map(entry => ({
    ...entry,
    score: entry.score * multiplier,
    timestamp: new Date().toISOString()
  }));
};

const mockGetLeaderboardStats = async (period: 'daily' | 'weekly' | 'monthly'): Promise<LeaderboardStats> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return mock stats based on period
  const userCounts = {
    daily: 42,
    weekly: 156,
    monthly: 372
  };
  
  return {
    uniqueUsers: userCounts[period]
  };
};

export const submitScore = async (userId: string, username: string, score: number): Promise<void> => {
  // In a real implementation, this would send the score to your backend
  console.log(`Submitting score for ${username} (${userId}): ${score}`);
  await new Promise(resolve => setTimeout(resolve, 300));
};

// React Query hooks for the leaderboard
export const useLeaderboardData = (period: 'daily' | 'weekly' | 'monthly') => {
  return useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => mockFetchLeaderboard(period),
    staleTime: 60 * 1000, // 1 minute
  });
};

export const useLeaderboardStats = (period: 'daily' | 'weekly' | 'monthly') => {
  return useQuery({
    queryKey: ['leaderboardStats', period],
    queryFn: () => mockGetLeaderboardStats(period),
    staleTime: 60 * 1000, // 1 minute
  });
};
