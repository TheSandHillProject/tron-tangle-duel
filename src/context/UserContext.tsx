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

// ---- API Calls ----
const loginUser = async (email: string, username: string): Promise<User> => {
  try {
    const response = await fetch("https://battletron-backend-199102ffa310.herokuapp.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, name: username }),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    const token = data.token;

    // Store JWT in localStorage
    localStorage.setItem("tron-token", token);

    return {
      id: email, // We don't get a user ID from the backend yet, so use email
      email,
      username,
      lastSeen: new Date(),
    };
  } catch (error) {
    console.error("Login request failed", error);
    throw error;
  }
};


export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const updateLastSeen = async () => {
    const token = localStorage.getItem("tron-token");
    if (!token) return;
  
    try {
      const response = await fetch("https://battletron-backend-199102ffa310.herokuapp.com/users", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to update last seen");
      }
  
      const data = await response.json();
      setUser(prev => prev ? { ...prev, lastSeen: new Date(data.last_seen) } : null);
    } catch (error) {
      console.error("Failed to update last seen", error);
    }
  };

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

// ---- API user effects ----

  // Update lastSeen periodically when logged in
  useEffect(() => {
    if (!user) return;
    
    // Update lastSeen when user first logs in
    updateLastSeen();

    
    // Then update periodically
    const interval = setInterval(() => {
      updateLastSeen();
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
      const newUser = await loginUser(email, username);
      setUser(newUser);
      localStorage.setItem("tron-user", JSON.stringify(newUser));
    } catch (error) {
      console.error("Login failed", error);
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
