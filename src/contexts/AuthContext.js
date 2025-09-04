import React, { createContext, useContext, useEffect, useState } from 'react';
import AuthService from '../services/AuthService';

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Debug : Log des changements d'état
  React.useEffect(() => {
    console.log('🔍 AuthContext State:', { isAuthenticated, user: user?.email || user?.name, isLoading });
  }, [isAuthenticated, user, isLoading]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authStatus = await AuthService.checkAuthStatus();
      setIsAuthenticated(authStatus.isAuthenticated);
      setUser(authStatus.user);
    } catch (error) {
      console.error('Erreur vérification auth:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔑 AuthContext.login appelé pour:', email);
      const result = await AuthService.login(email, password);
      console.log('📋 Résultat AuthService.login:', result);
      
      if (result.success) {
        console.log('⚡ Mise à jour AuthContext avec:', result.user);
        setIsAuthenticated(true);
        setUser(result.user);
        console.log('🔄 AuthContext mis à jour:', result.user.email || result.user.name);
      }
      return result;
    } catch (error) {
      console.error('Erreur login:', error);
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      console.log('📝 AuthContext.register appelé pour:', userData.email);
      const result = await AuthService.register(userData);
      console.log('📋 Résultat AuthService.register:', result);
      
      if (result.success) {
        console.log('⚡ Mise à jour AuthContext avec:', result.user);
        setIsAuthenticated(true);
        setUser(result.user);
        console.log('🔄 AuthContext mis à jour (register):', result.user.email || result.user.name);
      }
      return result;
    } catch (error) {
      console.error('Erreur register:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const result = await AuthService.logout();
      if (result.success) {
        setIsAuthenticated(false);
        setUser(null);
      }
      return result;
    } catch (error) {
      console.error('Erreur logout:', error);
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates) => {
    try {
      const result = await AuthService.updateProfile(updates);
      if (result.success) {
        setUser(result.user);
      }
      return result;
    } catch (error) {
      console.error('Erreur update profile:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
