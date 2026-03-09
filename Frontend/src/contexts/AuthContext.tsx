import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any; user?: AuthUser }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

export type AuthUserRole = 'customer' | 'admin';

export interface AuthUser {
  id: string;
  email: string;
  role: AuthUserRole;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const mapUser = (id: string, email: string | null | undefined): AuthUser => {
    const safeEmail = email ?? '';
    const role: AuthUserRole = safeEmail.toLowerCase().startsWith('admin') ? 'admin' : 'customer';
    return { id, email: safeEmail, role };
  };

  useEffect(() => {
    // Mock auth bootstrap from localStorage
    const stored = localStorage.getItem('lumina_auth_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
      } catch {
        localStorage.removeItem('lumina_auth_user');
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!email || !password) {
      return { error: new Error('Email and password are required') };
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        }
      );
      if (!res.ok) {
        const text = await res.text();
        if (res.status === 409) {
          return { error: { code: 'EMAIL_EXISTS', message: 'EMAIL_EXISTS' } as any };
        }
        return { error: new Error(text || 'Failed to sign up') };
      }
      const data = (await res.json()) as { id: string; email: string };
      const mapped = mapUser(data.id, data.email);
      setUser(mapped);
      localStorage.setItem('lumina_auth_user', JSON.stringify(mapped));
      return { error: null, user: mapped };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      return { error: new Error('Email and password are required') };
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        }
      );
      if (!res.ok) {
        const text = await res.text();
        return { error: new Error(text || 'Failed to sign in') };
      }
      const data = (await res.json()) as { id: string; email: string };
      const mapped = mapUser(data.id, data.email);
      setUser(mapped);
      localStorage.setItem('lumina_auth_user', JSON.stringify(mapped));
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    setUser(null);
    localStorage.removeItem('lumina_auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
