import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  signIn as cognitoSignIn,
  signUp as cognitoSignUp,
  confirmSignUp as cognitoConfirmSignUp,
  signOut as cognitoSignOut,
  getCurrentSession,
} from '../services/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  userEmail: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const session = await getCurrentSession();
      if (session) {
        setIsAuthenticated(true);
        const payload = session.getIdToken().decodePayload();
        setUserEmail(payload.email || null);
      }
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await cognitoSignIn(email, password);
    setIsAuthenticated(true);
    const payload = session.getIdToken().decodePayload();
    setUserEmail(payload.email || email);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    await cognitoSignUp(email, password);
  }, []);

  const confirmSignUp = useCallback(async (email: string, code: string) => {
    await cognitoConfirmSignUp(email, code);
  }, []);

  const signOut = useCallback(() => {
    cognitoSignOut();
    setIsAuthenticated(false);
    setUserEmail(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, userEmail, signIn, signUp, confirmSignUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
