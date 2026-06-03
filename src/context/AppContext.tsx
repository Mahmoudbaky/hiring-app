import { createContext, useContext, useEffect, useState } from 'react';
import api from '@/lib/api';
import { SEED_APPLICATIONS } from '@/data';
import type { Application } from '@/types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: 'super_admin' | 'company_user' | 'client_company_user';
  hiringCompanyId: string | null;
  clientCompanyId: string | null;
  companyName: string | null;
  uniqueCode: string | null;
  companyLogo: string | null;
  companyAddress: string | null;
  companyPhone: string | null;
  companyManagerName: string | null;
  companyCreatedAt: string | null;
}

export interface RegisterCompanyData {
  companyType?: 'hiring' | 'client';
  companyName: string;
  phoneNumber?: string;
  address?: string;
  managerName?: string;
  companyRecord?: string;
  name: string;
  email: string;
  password: string;
  userPhoneNumber?: string;
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

interface CompanyInfo {
  companyName: string | null;
  uniqueCode: string | null;
  companyLogo: string | null;
  companyAddress: string | null;
  companyPhone: string | null;
  companyManagerName: string | null;
  companyCreatedAt: string | null;
}

const emptyCompanyInfo: CompanyInfo = {
  companyName: null,
  uniqueCode: null,
  companyLogo: null,
  companyAddress: null,
  companyPhone: null,
  companyManagerName: null,
  companyCreatedAt: null,
};

function toAuthUser(
  u: Record<string, unknown>,
  company: Partial<CompanyInfo> = {},
): AuthUser {
  return {
    id: u.id as string,
    name: u.name as string,
    email: u.email as string,
    image: (u.image as string) ?? null,
    role: (u.role as AuthUser['role']) ?? 'company_user',
    hiringCompanyId: (u.hiringCompanyId as string) ?? null,
    clientCompanyId: (u.clientCompanyId as string) ?? null,
    companyName: company.companyName ?? null,
    uniqueCode: company.uniqueCode ?? null,
    companyLogo: company.companyLogo ?? null,
    companyAddress: company.companyAddress ?? null,
    companyPhone: company.companyPhone ?? null,
    companyManagerName: company.companyManagerName ?? null,
    companyCreatedAt: company.companyCreatedAt ?? null,
  };
}

function mapCompanyData(d: Record<string, unknown>): CompanyInfo {
  return {
    companyName: (d?.companyName as string) ?? null,
    uniqueCode: (d?.uniqueCode as string) ?? null,
    companyLogo: (d?.logo as string) ?? null,
    companyAddress: (d?.address as string) ?? null,
    companyPhone: (d?.phoneNumber as string) ?? null,
    companyManagerName: (d?.managerName as string) ?? null,
    companyCreatedAt: (d?.createdAt as string) ?? null,
  };
}

async function fetchCompanyInfo(
  role: string,
  hiringCompanyId: string | null,
  clientCompanyId: string | null,
): Promise<CompanyInfo> {
  if (role === 'client_company_user' && clientCompanyId) {
    const res = await api.get('/client-applicants/company/mine');
    return mapCompanyData(res.data?.data ?? {});
  }
  if (hiringCompanyId) {
    const res = await api.get('/companies/mine');
    return mapCompanyData(res.data?.data ?? {});
  }
  return emptyCompanyInfo;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]                 = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading]   = useState(true);
  const [applications, setApplications] = useState<Application[]>(SEED_APPLICATIONS);
  const [viewing, setViewing]           = useState<Application | null>(null);

  useEffect(() => {
    api.get('/auth/get-session')
      .then(async (res) => {
        if (res.data?.user) {
          const u = res.data.user;
          try {
            const company = await fetchCompanyInfo(
              u.role ?? 'company_user',
              u.hiringCompanyId ?? null,
              u.clientCompanyId ?? null,
            );
            setUser(toAuthUser(u, company));
          } catch {
            await api.post('/auth/sign-out').catch(() => {});
          }
        }
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    const res = await api.post('/auth/sign-in/email', { email, password, rememberMe });
    const u = res.data.user;
    try {
      const company = await fetchCompanyInfo(
        u.role ?? 'company_user',
        u.hiringCompanyId ?? null,
        u.clientCompanyId ?? null,
      );
      setUser(toAuthUser(u, company));
    } catch (err) {
      await api.post('/auth/sign-out').catch(() => {});
      throw err;
    }
  };

  const register = async (data: RegisterCompanyData) => {
    await api.post('/register-company', data);
  };

  const refreshProfile = async () => {
    const res = await api.get('/profile/me');
    const u = res.data.data;
    const company = await fetchCompanyInfo(
      u.role ?? 'company_user',
      u.hiringCompanyId ?? null,
      u.clientCompanyId ?? null,
    );
    setUser(toAuthUser(u, company));
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
