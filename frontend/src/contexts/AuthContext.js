import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedTour, setHasCompletedTour] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = authAPI.getStoredUser();
    const isAuth = authAPI.isAuthenticated();
    
    if (storedUser && isAuth) {
      setUser(storedUser);
      setIsAuthenticated(true);
      
      // Check if user has completed the tour
      const tourCompleted = localStorage.getItem(`tour_completed_${storedUser.id || storedUser.username}`);
      setHasCompletedTour(tourCompleted === 'true');
    }
    
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      setUser(response.user);
      setIsAuthenticated(true);
      
      // Check if user has completed the tour
      const tourCompleted = localStorage.getItem(`tour_completed_${response.user.id || response.user.username}`);
      setHasCompletedTour(tourCompleted === 'true');
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      setUser(response.user);
      setIsAuthenticated(true);
      
      // New users haven't completed the tour
      setHasCompletedTour(false);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
    setHasCompletedTour(false);
  };

  const updateUser = async () => {
    try {
      const updatedUser = await authAPI.getCurrentUser();
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const completeTour = () => {
    if (user) {
      const userId = user.id || user.username;
      localStorage.setItem(`tour_completed_${userId}`, 'true');
      setHasCompletedTour(true);
    }
  };

  const resetTour = () => {
    if (user) {
      const userId = user.id || user.username;
      localStorage.removeItem(`tour_completed_${userId}`);
      setHasCompletedTour(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    hasCompletedTour,
    login,
    register,
    logout,
    updateUser,
    completeTour,
    resetTour,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};