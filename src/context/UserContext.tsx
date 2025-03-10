
import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";

interface User {
  id: string;
  email: string;
  username: string;
  lastSeen: Date;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, username: string) => Promise<boolean>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// API configuration
const API_BASE_URL = 'https://battletron-backend-199102ffa310.herokuapp.com';

// Real API functions connecting to the Flask backend
const loginUser = async (email: string, username: string): Promise<{ user: User, token: string } | null> => {
  try {
    console.log('Calling login API:', `${API_BASE_URL}/login`);
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username }),
    });

    if (!response.ok) {
      console.error('Login failed:', response.statusText);
      const errorData = await response.json().catch(() => ({}));
      console.error('Error details:', errorData);
      return null;
    }

    const data = await response.json();
    console.log('Login successful:', data);
    
    return {
      user: {
        id: data.user.id.toString(),
        email: data.user.email,
        username: data.user.username,
        lastSeen: new Date(data.user.lastSeen)
      },
      token: data.token
    };
  } catch (error) {
    console.error('API call failed:', error);
    return null;
  }
};

const updateLastSeen = async (userId: string): Promise<Date | null> => {
  try {
    const token = localStorage.getItem('tron-auth-token');
    if (!token) return null;

    console.log('Updating last seen for user:', userId);
    const response = await fetch(`${API_BASE_URL}/update_last_seen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error('Update last seen failed:', response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('Last seen updated:', data);
    return new Date(data.lastSeen);
  } catch (error) {
    console.error('API call failed:', error);
    return null;
  }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('tron-user');
    const storedToken = localStorage.getItem('tron-auth-token');
    
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
        localStorage.removeItem('tron-auth-token');
      }
    }
    setIsLoading(false);
  }, []);

  // Update lastSeen periodically when logged in
  useEffect(() => {
    if (!user) return;
    
    // Update lastSeen when user first logs in
    updateLastSeen(user.id);
    
    // Then update periodically
    const interval = setInterval(async () => {
      const newLastSeen = await updateLastSeen(user.id);
      
      if (newLastSeen) {
        // Update local state
        setUser(prev => prev ? {
          ...prev,
          lastSeen: newLastSeen
        } : null);
      } else {
        // If update fails (possibly due to expired token), log out
        console.warn('Failed to update last seen, logging out');
        logout();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, username: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await loginUser(email, username);
      
      if (!result) {
        toast({
          title: "Login Failed",
          description: "Could not connect to the server. Please try again.",
          variant: "destructive"
        });
        setIsLoading(false);
        return false;
      }
      
      const { user: newUser, token } = result;
      
      // Store token and user in localStorage
      localStorage.setItem('tron-auth-token', token);
      localStorage.setItem('tron-user', JSON.stringify(newUser));
      
      setUser(newUser);
      toast({
        title: "Welcome to the Grid!",
        description: `Logged in as ${newUser.username}`,
      });
      return true;
    } catch (error) {
      console.error('Login failed', error);
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('tron-user');
    localStorage.removeItem('tron-auth-token');
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been disconnected from the Grid.",
    });
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
