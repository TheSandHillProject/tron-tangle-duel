
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, loginUser, updateLastSeen, mockLoginUser, mockUpdateLastSeen } from '../services/apiService';
import { toast } from '@/components/ui/use-toast';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, username: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Environment flag to use mock API (for development without backend)
const USE_MOCK_API = false; // Set to true for development without backend

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('tron-user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
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
    const updateFn = USE_MOCK_API ? mockUpdateLastSeen : updateLastSeen;
    updateFn(user.id).catch(error => {
      console.error('Failed to update last seen:', error);
    });
    
    // Then update periodically
    const interval = setInterval(() => {
      updateFn(user.id).catch(error => {
        console.error('Failed to update last seen periodically:', error);
      });
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, username: string) => {
    setIsLoading(true);
    try {
      // Use either the real API or the mock API
      const loginFn = USE_MOCK_API ? mockLoginUser : loginUser;
      const newUser = await loginFn(email, username);
      
      setUser(newUser);
      localStorage.setItem('tron-user', JSON.stringify(newUser));
      
      toast({
        title: "Login Successful",
        description: `Welcome, ${username}!`,
        duration: 3000
      });
    } catch (error) {
      console.error('Login failed', error);
      toast({
        title: "Login Failed",
        description: "Could not connect to the server. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('tron-user');
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      duration: 3000
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
