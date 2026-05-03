import api from '@/lib/api';
import type { ApiResponse } from '@/types/api';

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  hiringCompanyId: string | null;
  createdAt: string;
}

export interface CompanyData {
  id: string;
  companyName: string;
  uniqueCode: string;
  phoneNumber: string | null;
  address: string | null;
  managerName: string | null;
  companyRecord: string | null;
  logo: string | null;
  isActive: boolean;
  createdAt: string;
}

export const profileService = {
  async getMe(): Promise<ProfileData> {
    const res = await api.get<ApiResponse<ProfileData>>('/profile/me');
    return res.data.data;
  },

  async updateMe(body: { name?: string; image?: string | null; newPassword?: string }): Promise<ProfileData> {
    const res = await api.patch<ApiResponse<ProfileData>>('/profile/me', body);
    return res.data.data;
  },

  async getMyCompany(): Promise<CompanyData> {
    const res = await api.get<ApiResponse<CompanyData>>('/companies/mine');
    return res.data.data;
  },

  async updateMyCompany(body: {
    companyName?: string;
    phoneNumber?: string;
    address?: string;
    managerName?: string;
    companyRecord?: string;
    logo?: string | null;
  }): Promise<CompanyData> {
    const res = await api.patch<ApiResponse<CompanyData>>('/companies/mine', body);
    return res.data.data;
  },

  async uploadImage(file: File): Promise<string> {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post<ApiResponse<{ url: string }>>('/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data.url;
  },
};
