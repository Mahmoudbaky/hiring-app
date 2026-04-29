import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { SEED_APPLICATIONS } from '@/data';
import type { Application } from '@/types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'company_user';
  hiringCompanyId: string | null;
  companyName: string | null;
}

interface AppCtx {
  user: AuthUser | null;
  loggedIn: boolean;
  authLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  viewing: Application | null;
  setViewing: React.Dispatch<React.SetStateAction<Application | null>>;
}

const Ctx = createContext<AppCtx | null>(null);

function toAuthUser(u: Record<string, unknown>, companyName: string | null = null): AuthUser {
  return {
    id: u.id as string,
    name: u.name as string,
    email: u.email as string,
    role: (u.role as AuthUser['role']) ?? 'company_user',
    hiringCompanyId: (u.hiringCompanyId as string) ?? null,
    companyName,
  };
}

async function fetchCompanyName(companyId: string | null): Promise<string | null> {
  if (!companyId) return null;
  try {
    const res = await api.get('/companies/mine');
    return (res.data?.data?.companyName as string) ?? null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]                 = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading]   = useState(true);
  const [applications, setApplications] = useState<Application[]>(SEED_APPLICATIONS);
  const [viewing, setViewing]           = useState<Application | null>(null);

  // Restore session from cookie on first load
  useEffect(() => {
    api.get('/auth/get-session')
      .then(async (res) => {
        if (res.data?.user) {
          const u = res.data.user;
          const companyName = await fetchCompanyName(u.hiringCompanyId ?? null);
          setUser(toAuthUser(u, companyName));
        }
      })
      .catch(() => { /* no session — stay logged out */ })
      .finally(() => setAuthLoading(false));
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    const res = await api.post('/auth/sign-in/email', { email, password, rememberMe });
    const u = res.data.user;
    const companyName = await fetchCompanyName(u.hiringCompanyId ?? null);
    setUser(toAuthUser(u, companyName));
  };

  const logout = async () => {
    await api.post('/auth/sign-out');
    setUser(null);
  };

  return (
    <Ctx.Provider value={{
      user,
      loggedIn: !!user,
      authLoading,
      login,
      logout,
      applications, setApplications,
      viewing, setViewing,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
