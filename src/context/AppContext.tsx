import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { SEED_APPLICATIONS } from '@/data';
import type { Application } from '@/types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: 'super_admin' | 'company_user';
  hiringCompanyId: string | null;
  companyName: string | null;
  uniqueCode: string | null;
  companyLogo: string | null;
}

export interface RegisterCompanyData {
  companyName: string;
  phoneNumber?: string;
  address?: string;
  managerName?: string;
  companyRecord?: string;
  name: string;
  email: string;
  password: string;
}

interface AppCtx {
  user: AuthUser | null;
  loggedIn: boolean;
  authLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (data: RegisterCompanyData) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  viewing: Application | null;
  setViewing: React.Dispatch<React.SetStateAction<Application | null>>;
}

const Ctx = createContext<AppCtx | null>(null);

function toAuthUser(
  u: Record<string, unknown>,
  companyName: string | null = null,
  uniqueCode: string | null = null,
  companyLogo: string | null = null,
): AuthUser {
  return {
    id: u.id as string,
    name: u.name as string,
    email: u.email as string,
    image: (u.image as string) ?? null,
    role: (u.role as AuthUser['role']) ?? 'company_user',
    hiringCompanyId: (u.hiringCompanyId as string) ?? null,
    companyName,
    uniqueCode,
    companyLogo,
  };
}

async function fetchCompanyInfo(companyId: string | null): Promise<{ companyName: string | null; uniqueCode: string | null; companyLogo: string | null }> {
  if (!companyId) return { companyName: null, uniqueCode: null, companyLogo: null };
  try {
    const res = await api.get('/companies/mine');
    const data = res.data?.data;
    return {
      companyName: (data?.companyName as string) ?? null,
      uniqueCode: (data?.uniqueCode as string) ?? null,
      companyLogo: (data?.logo as string) ?? null,
    };
  } catch {
    return { companyName: null, uniqueCode: null, companyLogo: null };
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
          const { companyName, uniqueCode, companyLogo } = await fetchCompanyInfo(u.hiringCompanyId ?? null);
          setUser(toAuthUser(u, companyName, uniqueCode, companyLogo));
        }
      })
      .catch(() => { /* no session — stay logged out */ })
      .finally(() => setAuthLoading(false));
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    const res = await api.post('/auth/sign-in/email', { email, password, rememberMe });
    const u = res.data.user;
    const { companyName, uniqueCode, companyLogo } = await fetchCompanyInfo(u.hiringCompanyId ?? null);
    setUser(toAuthUser(u, companyName, uniqueCode, companyLogo));
  };

  const register = async (data: RegisterCompanyData) => {
    const res = await api.post('/register-company', data);
    const { user: u, company } = res.data;
    // Auto-login after registration
    await login(data.email, data.password);
    void u; void company;
  };

  const refreshProfile = async () => {
    const res = await api.get('/profile/me');
    const u = res.data.data;
    const { companyName, uniqueCode, companyLogo } = await fetchCompanyInfo(u.hiringCompanyId ?? null);
    setUser(toAuthUser(u, companyName, uniqueCode, companyLogo));
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
      register,
      logout,
      refreshProfile,
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
