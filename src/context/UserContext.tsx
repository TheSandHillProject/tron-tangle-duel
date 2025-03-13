
import React, { createContext, useState, useContext, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  username: string;
  lastSeen: Date;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, username: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock API functions (these would connect to your backend)
const mockLoginUser = async (email: string, username: string): Promise<User> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // In a real implementation, this would validate with the backend
  // and retrieve or create the user
  return {
    id: `user-${Math.floor(Math.random() * 100000)}`,
    email,
    username,
    lastSeen: new Date()
  };
};

const mockUpdateLastSeen = async (userId: string): Promise<void> => {
  // In a real implementation, this would update the lastSeen timestamp on the backend
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Updated last seen for user ${userId}`);
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('tron-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          lastSeen: new Date(parsedUser.lastSeen) // Convert string to Date
        });
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('tron-user');
      }
    }
    setIsLoading(false);
  }, []);

  // Update lastSeen periodically when logged in
  useEffect(() => {
    if (!user) return;
    
    // Update lastSeen when user first logs in
    mockUpdateLastSeen(user.id);
    
    // Then update periodically
    const interval = setInterval(() => {
      mockUpdateLastSeen(user.id);
      // Update local state too
      setUser(prev => prev ? {
        ...prev,
        lastSeen: new Date()
      } : null);
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, username: string) => {
    setIsLoading(true);
    try {
      const newUser = await mockLoginUser(email, username);
      setUser(newUser);
      localStorage.setItem('tron-user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Login failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('tron-user');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
