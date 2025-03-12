
import { useQuery } from '@tanstack/react-query';

export interface GraviTronLifetimeEntry {
  id: number;
  username: string;
  count: number;
  rank: number;
  timestamp: string;
}

export interface GraviTronStats {
  totalGravitrons: number;
}

export interface UserGraviTronRanking {
  rank: number;
  count: number;
  totalGravitrons: number;
}

// --------- API GETS functions ---------

const mockFetchLifetimeLeaderboard = async (): Promise<GraviTronLifetimeEntry[]> => {
  // Simulate API delay
  // await new Promise(resolve => setTimeout(resolve, 800));
  
  return [
    { id: 1, username: 'GraviMaster', count: 12, rank: 1, timestamp: new Date().toISOString() },
    { id: 2, username: 'CosmicDestroyer', count: 9, rank: 2, timestamp: new Date().toISOString() },
    { id: 3, username: 'HeatDeath', count: 7, rank: 3, timestamp: new Date().toISOString() },
    { id: 4, username: 'UniverseEnder', count: 5, rank: 4, timestamp: new Date().toISOString() },
    { id: 5, username: 'EventHorizon', count: 3, rank: 5, timestamp: new Date().toISOString() },
  ];
};

const mockGetGraviTronStats = async (): Promise<GraviTronStats> => {
  // Simulate API delay
  // await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    totalGravitrons: 567
  };
};

const mockGetUserGraviTronRanking = async (userId: string): Promise<UserGraviTronRanking> => {
  // Simulate API delay
  
  return {
    rank: 121,
    count: 1,
    totalGravitrons: 567
  };
};

// --------- React Query Hooks ---------

// Pulls the gravitron leaderboard
export const useLifetimeLeaderboard = () => {
  return useQuery({
    queryKey: ['gravitron', 'lifetime'],
    queryFn: () => mockFetchLifetimeLeaderboard(),
    staleTime: 60 * 1000, // 1 minute
  });
};

// Pulls database stats (i.e. how many total gravitrons have been collected)
export const useGraviTronStats = () => {
  return useQuery({
    queryKey: ['gravitron', 'stats'],
    queryFn: () => mockGetGraviTronStats(),
    staleTime: 60 * 1000, // 1 minute
  });
};

// Pulls user ranking and stats for gravitron
export const useUserGraviTronRanking = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['userGraviTron', userId],
    queryFn: () => userId ? mockGetUserGraviTronRanking(userId) : Promise.resolve(null),
    staleTime: 60 * 1000, // 1 minute
    enabled: !!userId, // Only run query if userId exists
  });
};


// --------- API POST functions ---------

export const submitGraviTronScore = async (
  userId: string, 
  username: string, 
  value: number
): Promise<void> => {
  // In a real implementation, this would send the score to your backend
  console.log(`Submitting GraviTron lifetime for ${username} (${userId}): ${value}`);
  await new Promise(resolve => setTimeout(resolve, 300));
};

