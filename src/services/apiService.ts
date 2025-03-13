
/**
 * Service for communicating with the Flask backend
 */

// Update this with your Heroku backend URL
const API_BASE_URL = 'https://your-heroku-app.herokuapp.com';

/**
 * User related API calls
 */
export interface User {
  id: string;
  email: string;
  username: string;
  lastSeen: string; // ISO date string
}

// Login a user - creates if doesn't exist
export const loginUser = async (email: string, username: string): Promise<User> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, username }),
    });
    
    if (!response.ok) {
      throw new Error(`Login failed with status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API login error:', error);
    throw error;
  }
};

// Update last seen timestamp for a user
export const updateLastSeen = async (userId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}/last-seen`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Update last seen failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error('API update last seen error:', error);
    // Don't throw - we don't want to interrupt the user experience for this
  }
};

// For development fallback if API is unavailable
export const mockLoginUser = async (email: string, username: string): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    id: `user-${Math.floor(Math.random() * 100000)}`,
    email,
    username,
    lastSeen: new Date().toISOString()
  };
};

export const mockUpdateLastSeen = async (userId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`Updated last seen for user ${userId}`);
};
