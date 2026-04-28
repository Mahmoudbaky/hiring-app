import api from '@/lib/api';
import type { ApiResponse, PublicJob, QualificationType, SubmitApplicationBody } from '@/types/api';

export const careersService = {
  /** GET /jobs/public — no auth required */
  async getPublishedJobs(): Promise<PublicJob[]> {
    const res = await api.get<ApiResponse<PublicJob[]>>('/jobs/public');
    return res.data.data;
  },

  /** GET /settings/qualification-types/public — no auth required */
  async getQualificationTypes(): Promise<QualificationType[]> {
    const res = await api.get<ApiResponse<QualificationType[]>>('/settings/qualification-types/public');
    return res.data.data;
  },

  /** POST /requests — public self-apply with company code */
  async submitApplication(body: SubmitApplicationBody): Promise<void> {
    await api.post('/requests', body);
  },
};
