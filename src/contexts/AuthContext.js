import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import authService from '../services/authService';

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

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const register = useCallback((userData) => {
    setUser(userData);
  }, []);

  const updateUser = useCallback((updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    authService.updateUser(updatedUser);
    setUser(authService.sanitizeUser(updatedUser));
  }, [user]);

  const isAuthenticated = useMemo(() => !!user, [user]);

  const value = useMemo(() => ({
    user,
    login,
    logout,
    register,
    updateUser,
    isAuthenticated,
    loading
  }), [user, login, logout, register, updateUser, isAuthenticated, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
