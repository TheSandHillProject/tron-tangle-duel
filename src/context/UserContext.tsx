import React, { createContext, useState, useContext, useEffect } from "react";

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

const API_BASE_URL = "https://your-heroku-app.herokuapp.com"; // Change to your actual backend URL

// Function to fetch the auth token from localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Real API function for logging in
const loginUser = async (email: string, username: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, username }),
  });

  if (!response.ok) {
    throw new Error("Failed to log in");
  }

  const data = await response.json();
  localStorage.setItem("token", data.token); // Store JWT token

  return {
    id: data.user.id,
    email: data.user.email,
    username: data.user.username,
    lastSeen: new Date(data.user.lastSeen),
  };
};

// Real API function for updating lastSeen
const updateLastSeen = async (): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/update_last_seen`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to update last seen");
  }

  const data = await response.json();
  console.log("Updated last seen:", data.lastSeen);
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("tron-user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser({
          ...parsedUser,
          lastSeen: new Date(parsedUser.lastSeen),
        });
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("tron-user");
      }
    }
    setIsLoading(false);
  }, []);

  // Update lastSeen periodically when logged in
  useEffect(() => {
    if (!user) return;

    updateLastSeen().catch(console.error);

    const interval = setInterval(() => {
      updateLastSeen()
        .then(() => {
          setUser((prev) =>
            prev
              ? {
                  ...prev,
                  lastSeen: new Date(),
                }
              : null
          );
        })
        .catch(console.error);
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
    localStorage.removeItem("tron-user");
    localStorage.removeItem("token"); // Clear JWT token
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
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};
