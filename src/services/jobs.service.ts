import api from '@/lib/api';
import type { ApiResponse, JobAd, JobTitle, CreateJobBody } from '@/types/api';

export const jobsService = {
  async list(): Promise<JobAd[]> {
    const res = await api.get<ApiResponse<JobAd[]>>('/jobs');
    return res.data.data;
  },

  async create(body: CreateJobBody): Promise<JobAd> {
    const res = await api.post<ApiResponse<JobAd>>('/jobs', body);
    return res.data.data;
  },

  async listJobTitles(): Promise<JobTitle[]> {
    const res = await api.get<ApiResponse<JobTitle[]>>('/settings/job-titles');
    return res.data.data;
  },
};
