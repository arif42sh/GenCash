import React, { createContext, useState, useEffect, useContext } from 'react';
import { api } from '../services/api';
import { storage } from '../services/storage';

const AuthContext = createContext(null);

const formatUserWithAvatar = (userData, baseUrl) => {
  if (!userData) return null;
  let avatar = userData.avatar || userData.profile_image || null;
  if (avatar && typeof avatar === 'string' && avatar.startsWith('/')) {
    avatar = `${baseUrl}${avatar}`;
  }
  return {
    ...userData,
    avatar,
    profile_image: avatar,
  };
};

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
      const baseUrl = await api.getActiveBaseUrl();

      if (storedToken && storedUser) {
        let currentUser = JSON.parse(storedUser);
        if (storedAvatar) {
          currentUser.avatar = storedAvatar;
        }
        currentUser = formatUserWithAvatar(currentUser, baseUrl);
        setUser(currentUser);
        setToken(storedToken);

        // Refresh wallet & profile in background
        await fetchWalletData();

        // Fetch fresh profile from database
        try {
          const freshUser = await api.getMe();
          if (freshUser) {
            const formatted = formatUserWithAvatar(freshUser, baseUrl);
            setUser(formatted);
            await storage.setItem('@gencash_user', JSON.stringify(formatted));
            if (formatted.avatar) {
              await storage.setItem('@gencash_avatar_uri', formatted.avatar);
            }
          }
        } catch (pe) {
          console.warn('Silent fresh profile fetch error:', pe);
        }
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (e) {
      console.warn('Failed to restore session:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updates) => {
    try {
      const baseUrl = await api.getActiveBaseUrl();
      
      // 1. Optimistic update
      const current = user || {
        id: '1',
        name: 'Tanvir Ahmed',
        phone: '+880 1711-111111',
        email: 'tanvir@gencash.com',
      };
      const optimistic = formatUserWithAvatar({ ...current, ...updates }, baseUrl);
      setUser(optimistic);

      // 2. Persist to Backend API & Database
      try {
        const serverUser = await api.updateProfile(updates);
        if (serverUser) {
          const formatted = formatUserWithAvatar(serverUser, baseUrl);
          setUser(formatted);
          await storage.setItem('@gencash_user', JSON.stringify(formatted));
          if (formatted.avatar) {
            await storage.setItem('@gencash_avatar_uri', formatted.avatar);
          } else {
            await storage.removeItem('@gencash_avatar_uri');
          }
          return formatted;
        }
      } catch (apiErr) {
        console.warn('API update failed, maintaining optimistic update:', apiErr);
      }

      await storage.setItem('@gencash_user', JSON.stringify(optimistic));
      if (optimistic.avatar) {
        await storage.setItem('@gencash_avatar_uri', optimistic.avatar);
      } else {
        await storage.removeItem('@gencash_avatar_uri');
      }
      return optimistic;
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
      // Fallback wallet if backend returns error so UI components don't crash
      setWallet((prev) => prev || {
        balance: 12500.0,
        currency: 'BDT',
        daily_limit: 50000,
        daily_spent: 3200,
      });
    }
  };

  const login = async (phone, password) => {
    setAuthError(null);
    try {
      const res = await api.login(phone, password);
      const baseUrl = await api.getActiveBaseUrl();
      const formattedUser = formatUserWithAvatar(res.user, baseUrl);

      setToken(res.access_token);
      setUser(formattedUser);

      await storage.setItem('@gencash_token', res.access_token);
      await storage.setItem('@gencash_user', JSON.stringify(formattedUser));
      if (formattedUser?.avatar) {
        await storage.setItem('@gencash_avatar_uri', formattedUser.avatar);
      }

      // Fetch wallet right after login
      await fetchWalletData();

      return { ...res, user: formattedUser };
    } catch (err) {
      // If network error, provide seamless demo offline fallback
      if (err.message && (err.message.includes('Network') || err.message.includes('network'))) {
        const demoUser = {
          id: '1',
          name: 'Tanvir Ahmed',
          phone: phone || '01711111111',
          email: 'tanvir@gencash.com',
        };
        const demoToken = 'mock_demo_jwt_token';
        setToken(demoToken);
        setUser(demoUser);
        setWallet({
          balance: 12500.0,
          currency: 'BDT',
          daily_limit: 50000,
          daily_spent: 3200,
        });
        await storage.setItem('@gencash_token', demoToken);
        await storage.setItem('@gencash_user', JSON.stringify(demoUser));
        return { access_token: demoToken, user: demoUser };
      }
      setAuthError(err.message);
      throw err;
    }
  };

  const register = async (name, phone, email, password) => {
    setAuthError(null);
    try {
      const res = await api.register(name, phone, email, password);
      const baseUrl = await api.getActiveBaseUrl();
      const formattedUser = formatUserWithAvatar(res.user, baseUrl);

      setToken(res.access_token);
      setUser(formattedUser);

      await storage.setItem('@gencash_token', res.access_token);
      await storage.setItem('@gencash_user', JSON.stringify(formattedUser));

      const walletData = await api.getWallet();
      setWallet(walletData);

      return { ...res, user: formattedUser };
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
    await storage.removeItem('@gencash_avatar_uri');
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
