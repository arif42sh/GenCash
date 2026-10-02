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
      const storedAvatar = await storage.getItem('@gencash_avatar_uri');

      let currentUser = storedUser ? JSON.parse(storedUser) : {
        id: '1',
        name: 'Tanvir Ahmed',
        phone: '+880 1711-111111',
        email: 'tanvir@gencash.com',
      };

      if (storedAvatar) {
        currentUser.avatar = storedAvatar;
      }

      setUser(currentUser);

      if (storedToken) {
        setToken(storedToken);
        // Refresh wallet & profile in background
        await fetchWalletData();
      }
    } catch (e) {
      console.warn('Failed to restore session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates) => {
    try {
      const updated = {
        ...(user || {
          id: '1',
          name: 'Tanvir Ahmed',
          phone: '+880 1711-111111',
          email: 'tanvir@gencash.com',
        }),
        ...updates,
      };

      setUser(updated);
      await storage.setItem('@gencash_user', JSON.stringify(updated));

      if (updates.avatar !== undefined) {
        if (updates.avatar) {
          await storage.setItem('@gencash_avatar_uri', updates.avatar);
        } else {
          await storage.removeItem('@gencash_avatar_uri');
        }
      }

      return updated;
    } catch (err) {
      console.warn('Failed to update user profile in context:', err);
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
        updateUser,
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
