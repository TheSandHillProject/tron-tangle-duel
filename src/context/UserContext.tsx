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

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const login = async (email: string, username: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("https://battletron-backend-199102ffa310.herokuapp.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name: username }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        if (data.message === "There is a different username associated with this account email") {
          alert("Error: The email you entered is linked to a different username.");
        } else if (data.message === "There is a different email associated with this account username") {
          alert("Error: The username you entered is linked to a different email.");
        } else {
          alert("Login failed. Please check your credentials.");
        }
        throw new Error(data.message);
      }
  
      // Store JWT token
      localStorage.setItem("tron-token", data.token);
  
      // Save user state
      const newUser = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.name,
        lastSeen: new Date(data.user.last_seen),
      };
  
      setUser(newUser);
      localStorage.setItem("tron-user", JSON.stringify(newUser));
  
      console.log("Login successful");
    } catch (error) {
      console.error("Login failed:", error.message);
    } finally {
      setIsLoading(false);
    }
  };
  

  const updateLastSeen = async () => {
    const token = localStorage.getItem("tron-token");
    if (!token) return;
  
    try {
      const response = await fetch("https://battletron-backend-199102ffa310.herokuapp.com/user", {
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