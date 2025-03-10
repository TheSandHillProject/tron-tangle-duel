
import React, { createContext, useState, useContext, useEffect } from 'react';

// Base URL for the API
const API_BASE_URL = 'https://battletron-backend-199102ffa310.herokuapp.com';

interface User {
  id: string;
  email: string;
  username: string;
  lastSeen: Date;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, username: string) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Real API functions that connect to your backend
const loginUser = async (email: string, username: string): Promise<{ user: User, token: string }> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, username }),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  const data = await response.json();
  
  // Transform the response to match our User interface
  return {
    user: {
      id: data.user.id.toString(),
      email: data.user.email,
      username: data.user.username,
      lastSeen: new Date(data.user.lastSeen)
    },
    token: data.token
  };
};

const updateLastSeen = async (): Promise<Date> => {
  const token = localStorage.getItem('tron-token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  const response = await fetch(`${API_BASE_URL}/update_last_seen`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to update last seen timestamp');
  }
  
  const data = await response.json();
  return new Date(data.lastSeen);
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('tron-user');
    const storedToken = localStorage.getItem('tron-token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          lastSeen: new Date(parsedUser.lastSeen) // Convert string to Date
        });
      } catch (error) {
        console.error('Failed to parse stored user', error);
        localStorage.removeItem('tron-user');
        localStorage.removeItem('tron-token');
      }
    }
    setIsLoading(false);
  }, []);

  // Update lastSeen periodically when logged in
  useEffect(() => {
    if (!user) return;
    
    // Update lastSeen when user first logs in
    updateLastSeen().catch(error => {
      console.error('Failed to update last seen timestamp', error);
      // If token is expired or invalid, log the user out
      if (error.message.includes('authentication') || error.message.includes('token')) {
        logout();
      }
    });
    
    // Then update periodically
    const interval = setInterval(() => {
      updateLastSeen()
        .then(lastSeen => {
          // Update local state too
          setUser(prev => prev ? {
            ...prev,
            lastSeen
          } : null);
        })
        .catch(error => {
          console.error('Failed to update last seen timestamp', error);
          // If token is expired or invalid, log the user out
          if (error.message.includes('authentication') || error.message.includes('token')) {
            logout();
          }
        });
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, username: string) => {
    setIsLoading(true);
    try {
      const { user: newUser, token } = await loginUser(email, username);
      setUser(newUser);
      
      // Store both user data and token in localStorage
      localStorage.setItem('tron-user', JSON.stringify(newUser));
      localStorage.setItem('tron-token', token);
    } catch (error) {
      console.error('Login failed', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('tron-user');
    localStorage.removeItem('tron-token');
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
