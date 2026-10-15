import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, TokenManager } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => AuthService.getUser());
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMessage, setLoginModalMessage] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      if (TokenManager.getToken()) {
        try {
          const freshUser = await AuthService.getCurrentUser();
          if (isMounted && freshUser) {
            setUser(freshUser);
          }
        } catch (err) {
          console.warn('[Auth] Session validation failed on mount:', err.message);
          if (isMounted) {
            setUser(null);
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
        }
      }
      if (isMounted) {
        setIsLoadingAuth(false);
      }
    }

    verifySession();

    const handleUnauthorized = (e) => {
      if (isMounted) {
        setUser(null);
        const rawMsg = e?.detail?.message;
        const friendlyMsg = (rawMsg && !rawMsg.toLowerCase().includes('missing bearer token'))
          ? rawMsg
          : 'Your session has expired or was revoked. Please sign in again.';
        setLoginModalMessage(friendlyMsg);
        setIsLoginModalOpen(true);
      }
    };

    const handleStateChange = (e) => {
      if (isMounted && !e?.detail?.token) {
        setUser(null);
      }
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    window.addEventListener('auth:state-change', handleStateChange);

    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('auth:state-change', handleStateChange);
    };
  }, []);

  const login = async (email, password) => {
    const data = await AuthService.login(email, password);
    if (data?.user) {
      setUser(data.user);
    }
    setIsLoginModalOpen(false);
    setLoginModalMessage(null);
    return data;
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } finally {
      setUser(null);
      setLoginModalMessage(null);
    }
  };

  const openLoginModal = (message = null) => {
    setLoginModalMessage(message);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setLoginModalMessage(null);
  };

  const value = {
    user,
    isAuthenticated: !!user && !!TokenManager.getToken(),
    isLoadingAuth,
    isLoginModalOpen,
    loginModalMessage,
    openLoginModal,
    closeLoginModal,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
