
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

export interface UserRanking {
  rank: number;
  score: number;
  timestamp: string;
}

// These would be real API calls in production
const mockFetchLeaderboard = async (period: 'daily' | 'weekly' | 'monthly'): Promise<LeaderboardEntry[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Generate some random data based on the period
  const baseEntries = [
    { id: 1, username: "TronMaster", score: 52, rank: 1 },
    { id: 2, username: "LightCycle", score: 48, rank: 2 },
    { id: 3, username: "GridRunner", score: 45, rank: 3 },
    { id: 4, username: "DiscUser", score: 41, rank: 4 },
    { id: 5, username: "ByteRider", score: 39, rank: 5 },
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
    daily: 1042,
    weekly: 12891,
    monthly: 37203
  };
  
  return {
    uniqueUsers: userCounts[period]
  };
};

const mockGetUserRanking = async (userId: string, period: 'daily' | 'weekly' | 'monthly'): Promise<UserRanking> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Generate a random ranking for the user based on the period
  // In a real implementation, this would fetch the user's actual ranking from your backend
  const totalUsers = period === 'daily' ? 1042 : period === 'weekly' ? 12891 : 37203;
  const randomRank = Math.floor(Math.random() * (totalUsers - 6)) + 6; // Ensure rank is after top 5
  
  // Scale scores based on time period like in the leaderboard
  const baseScore = Math.floor(Math.random() * 30) + 10; // Random score between 10 and 39
  const multiplier = period === 'daily' ? 1 : period === 'weekly' ? 3 : 8;
  
  return {
    rank: randomRank,
    score: baseScore * multiplier,
    timestamp: new Date().toISOString()
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

export const useUserRanking = (userId: string | undefined, period: 'daily' | 'weekly' | 'monthly') => {
  return useQuery({
    queryKey: ['userRanking', userId, period],
    queryFn: () => userId ? mockGetUserRanking(userId, period) : Promise.resolve(null),
    staleTime: 60 * 1000, // 1 minute
    enabled: !!userId, // Only run query if userId exists
  });
};
