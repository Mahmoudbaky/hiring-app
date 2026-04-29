import api from '@/lib/api';
import type {
  ApiResponse,
  HiringCompany,
  CreateCompanyBody,
  CompanyUser,
  CreateUserBody,
  JobTitle,
  CreateJobTitleBody,
  QualificationType,
  CreateQualificationTypeBody,
} from '@/types/api';

export const settingsService = {
  // Companies
  async listCompanies(): Promise<HiringCompany[]> {
    const res = await api.get<ApiResponse<HiringCompany[]>>('/companies');
    return res.data.data;
  },
  async createCompany(body: CreateCompanyBody): Promise<HiringCompany> {
    const res = await api.post<ApiResponse<HiringCompany>>('/companies', body);
    return res.data.data;
  },

  // Users
  async listUsers(): Promise<CompanyUser[]> {
    const res = await api.get<ApiResponse<CompanyUser[]>>('/users');
    return res.data.data;
  },
  async createUser(body: CreateUserBody): Promise<CompanyUser> {
    const res = await api.post<ApiResponse<CompanyUser>>('/users', body);
    return res.data.data;
  },

  // Job Titles
  async listJobTitles(): Promise<JobTitle[]> {
    const res = await api.get<ApiResponse<JobTitle[]>>('/settings/job-titles');
    return res.data.data;
  },
  async createJobTitle(body: CreateJobTitleBody): Promise<JobTitle> {
    const res = await api.post<ApiResponse<JobTitle>>('/settings/job-titles', body);
    return res.data.data;
  },
  async toggleJobTitle(id: string, isActive: boolean): Promise<JobTitle> {
    const res = await api.patch<ApiResponse<JobTitle>>(`/settings/job-titles/${id}`, { isActive });
    return res.data.data;
  },
  async deleteJobTitle(id: string): Promise<void> {
    await api.delete(`/settings/job-titles/${id}`);
  },

  // Qualification Types
  async listQualificationTypes(): Promise<QualificationType[]> {
    const res = await api.get<ApiResponse<QualificationType[]>>('/settings/qualification-types');
    return res.data.data;
  },
  async createQualificationType(body: CreateQualificationTypeBody): Promise<QualificationType> {
    const res = await api.post<ApiResponse<QualificationType>>('/settings/qualification-types', body);
    return res.data.data;
  },
  async toggleQualificationType(id: string, isActive: boolean): Promise<QualificationType> {
    const res = await api.patch<ApiResponse<QualificationType>>(`/settings/qualification-types/${id}`, { isActive });
    return res.data.data;
  },
  async deleteQualificationType(id: string): Promise<void> {
    await api.delete(`/settings/qualification-types/${id}`);
  },
};
