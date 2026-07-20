import { createContext, useContext, useEffect, useRef, useState } from 'react';
import api from '@/lib/api';
import { SEED_APPLICATIONS } from '@/data';
import type { Application } from '@/types';

export type Portal = 'admin' | 'hiring' | 'client';

type Role = 'super_admin' | 'company_user' | 'client_company_user';

// Role is implied by which portal (auth instance) the session belongs to.
const ROLE_BY_PORTAL: Record<Portal, Role> = {
  admin: 'super_admin',
  hiring: 'company_user',
  client: 'client_company_user',
};

const ALL_PORTALS: Portal[] = ['admin', 'hiring', 'client'];

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: Role;
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
  login: (portal: Portal, email: string, password: string, rememberMe?: boolean) => Promise<void>;
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
  role: Role,
  company: Partial<CompanyInfo> = {},
): AuthUser {
  return {
    id: u.id as string,
    name: u.name as string,
    email: u.email as string,
    image: (u.image as string) ?? null,
    role,
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
  // Which portal the current session belongs to — needed for sign-out.
  const portalRef = useRef<Portal | null>(null);

  useEffect(() => {
    // On load we don't know which portal the user belongs to, so probe all
    // three get-session endpoints in parallel; each reads only its own cookie.
    Promise.allSettled(
      ALL_PORTALS.map((p) => api.get(`/auth/${p}/get-session`)),
    )
      .then(async (results) => {
        for (let i = 0; i < ALL_PORTALS.length; i++) {
          const portal = ALL_PORTALS[i];
          const result = results[i];
          if (result.status !== 'fulfilled') continue;
          const u = result.value.data?.user;
          if (!u) continue;

          const role = ROLE_BY_PORTAL[portal];
          try {
            const company = await fetchCompanyInfo(
              role,
              u.hiringCompanyId ?? null,
              u.clientCompanyId ?? null,
            );
            portalRef.current = portal;
            setUser(toAuthUser(u, role, company));
          } catch {
            await api.post(`/auth/${portal}/sign-out`).catch(() => {});
          }
          return;
        }
      })
      .catch(() => {})
      .finally(() => setAuthLoading(false));
  }, []);

  const login = async (portal: Portal, email: string, password: string, rememberMe = false) => {
    const res = await api.post(`/auth/${portal}/sign-in/email`, { email, password, rememberMe });
    const u = res.data.user;
    const role = ROLE_BY_PORTAL[portal];
    try {
      const company = await fetchCompanyInfo(
        role,
        u.hiringCompanyId ?? null,
        u.clientCompanyId ?? null,
      );
      portalRef.current = portal;
      setUser(toAuthUser(u, role, company));
    } catch (err) {
      await api.post(`/auth/${portal}/sign-out`).catch(() => {});
      throw err;
    }
  };

  const register = async (data: RegisterCompanyData) => {
    await api.post('/register-company', data);
  };

  const refreshProfile = async () => {
    const res = await api.get('/profile/me');
    const u = res.data.data;
    const role = (u.role as Role) ?? 'company_user';
    const company = await fetchCompanyInfo(
      role,
      u.hiringCompanyId ?? null,
      u.clientCompanyId ?? null,
    );
    setUser(toAuthUser(u, role, company));
  };

  const logout = async () => {
    const portal = portalRef.current ?? 'hiring';
    await api.post(`/auth/${portal}/sign-out`);
    portalRef.current = null;
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
