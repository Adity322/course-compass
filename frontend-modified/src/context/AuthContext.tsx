'use client';

/**
 * AuthContext — global auth state using React Context API.
 * Chosen over Redux/Zustand because the auth state here is simple:
 * just a token + admin info. No complex derived state needed.
 * Context keeps it lightweight with zero extra dependencies.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Admin {
  email: string;
  id: string;
}

interface AuthContextValue {
  token: string | null;
  admin: Admin | null;
  isLoggedIn: boolean;
  login: (token: string, admin: Admin) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);

  // Rehydrate from localStorage on mount (survives page refresh)
  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('adminInfo');
    if (storedToken && storedAdmin) {
      setToken(storedToken);
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  const login = (newToken: string, newAdmin: Admin) => {
    localStorage.setItem('adminToken', newToken);
    localStorage.setItem('adminInfo', JSON.stringify(newAdmin));
    setToken(newToken);
    setAdmin(newAdmin);
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ token, admin, isLoggedIn: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
