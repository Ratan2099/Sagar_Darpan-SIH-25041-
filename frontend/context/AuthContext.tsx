'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type Role = 'ADMIN' | 'RESEARCHER' | 'FISHERMAN' | 'GENERAL';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginMock: (role: Role) => void;
  logout: () => void;
  isLoading: boolean;
}

// ─── Mock Users for Demo (no backend required) ────────────────────────────────
export const MOCK_USERS: Record<Role, AuthUser & { password: string }> = {
  ADMIN: {
    id: 'admin-001',
    email: 'admin@sagardarpan.in',
    fullName: 'Dr. Arjun Nair',
    role: 'ADMIN',
    password: 'admin123',
  },
  RESEARCHER: {
    id: 'researcher-001',
    email: 'researcher@sagardarpan.in',
    fullName: 'Dr. Priya Menon',
    role: 'RESEARCHER',
    password: 'research123',
  },
  FISHERMAN: {
    id: 'fisherman-001',
    email: 'fisher@sagardarpan.in',
    fullName: 'Rajan Pillai',
    role: 'FISHERMAN',
    password: 'fish123',
  },
  GENERAL: {
    id: 'general-001',
    email: 'user@sagardarpan.in',
    fullName: 'Ananya Sharma',
    role: 'GENERAL',
    password: 'user123',
  },
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Restore from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('sd_token');
    const storedUser = localStorage.getItem('sd_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      let loggedInUser: AuthUser | null = null;
      let accessToken = 'mock-token';

      if (apiUrl) {
        try {
          const res = await fetch(`${apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (res.ok) {
            const data = await res.json();
            loggedInUser = data.user;
            accessToken = data.token;
          }
        } catch {
          // Fall through to mock
        }
      }

      // Mock fallback
      if (!loggedInUser) {
        const found = Object.values(MOCK_USERS).find(
          (u) => u.email === email && u.password === password
        );
        if (!found) throw new Error('Invalid credentials. Please check your email and password.');
        const { password: _, ...userData } = found;
        loggedInUser = userData;
      }

      setUser(loggedInUser);
      setToken(accessToken);
      localStorage.setItem('sd_token', accessToken);
      localStorage.setItem('sd_user', JSON.stringify(loggedInUser));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginMock = useCallback((role: Role) => {
    const { password: _, ...userData } = MOCK_USERS[role];
    setUser(userData);
    setToken('mock-token');
    localStorage.setItem('sd_token', 'mock-token');
    localStorage.setItem('sd_user', JSON.stringify(userData));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sd_token');
    localStorage.removeItem('sd_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, loginMock, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function getRedirectPath(role: Role): string {
  switch (role) {
    case 'ADMIN': return '/admin';
    case 'RESEARCHER': return '/research';
    case 'FISHERMAN': return '/fisherman';
    default: return '/dashboard';
  }
}
