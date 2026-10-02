import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { storage } from '../services/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await storage.getItem('@gencash_token');
      const storedUser = await storage.getItem('@gencash_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // Refresh wallet & profile in background
        await fetchWalletData();
      }
    } catch (e) {
      console.warn('Failed to restore session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWalletData = async () => {
    try {
      const walletData = await api.getWallet();
      setWallet(walletData);
    } catch (e) {
      console.warn('Error fetching wallet:', e);
    }
  };

  const login = async (phone, password) => {
    setAuthError(null);
    try {
      const res = await api.login(phone, password);
      setToken(res.access_token);
      setUser(res.user);

      await storage.setItem('@gencash_token', res.access_token);
      await storage.setItem('@gencash_user', JSON.stringify(res.user));

      // Fetch wallet right after login
      const walletData = await api.getWallet();
      setWallet(walletData);

      return res;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const register = async (name, phone, email, password) => {
    setAuthError(null);
    try {
      const res = await api.register(name, phone, email, password);
      setToken(res.access_token);
      setUser(res.user);

      await storage.setItem('@gencash_token', res.access_token);
      await storage.setItem('@gencash_user', JSON.stringify(res.user));

      const walletData = await api.getWallet();
      setWallet(walletData);

      return res;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (e) {}
    setToken(null);
    setUser(null);
    await storage.removeItem('@gencash_token');
    await storage.removeItem('@gencash_user');
  };

  const refreshWallet = async () => {
    return await fetchWalletData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        token,
        isLoading,
        authError,
        login,
        register,
        logout,
        refreshWallet,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
