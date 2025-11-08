import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { buildApiUrl } from '../config/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  /**
   * Verify if the stored token is still valid
   */
  const verifyToken = useCallback(async (token) => {
    try {
      const response = await fetch(buildApiUrl('/auth/verify'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user);
        return true;
      } else {
        // Token is invalid or expired
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
      return false;
    }
  }, []);

  /**
   * Check authentication status on mount
   */
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        await verifyToken(token);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [verifyToken]);

  /**
   * Login function
   */
  const login = async (username, password) => {
    try {
      const response = await fetch(buildApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user info
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      setIsAuthenticated(true);
      setUser(data.user);
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: 'Login failed. Please try again.' 
      };
    }
  };

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        // Call logout endpoint (optional, for logging purposes)
        await fetch(buildApiUrl('/auth/logout'), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state regardless of API call result
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  /**
   * Change password function
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(buildApiUrl('/auth/change-password'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password change failed');
      }

      return { 
        success: true, 
        message: data.message 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to change password. Please try again.' 
      };
    }
  };

  /**
   * Change username function
   */
  const changeUsername = async (newUsername, password) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(buildApiUrl('/auth/change-username'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newUsername, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Username change failed');
      }

      // Update local storage with new token and user info
      localStorage.setItem('authToken', data.token);
      setUser(data.user);

      return { 
        success: true, 
        message: data.message,
        user: data.user 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to change username. Please try again.' 
      };
    }
  };

  /**
   * Get current auth token
   */
  const getToken = () => {
    return localStorage.getItem('authToken');
  };

  const value = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    changePassword,
    changeUsername,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}