import api from '@/lib/api';
import type {
  ApiResponse,
  PublicJob,
  QualificationType,
  Department,
  ProfessionalGrade,
  GeneralSpecialty,
  SubmitApplicationBody,
  SubmitApplicationResponse,
} from '@/types/api';

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

  /** GET /settings/departments/public — no auth required */
  async getDepartments(): Promise<Department[]> {
    const res = await api.get<ApiResponse<Department[]>>('/settings/departments/public');
    return res.data.data;
  },

  /** GET /settings/professional-grades/public?departmentId=uuid — no auth required */
  async getProfessionalGrades(departmentId: string): Promise<ProfessionalGrade[]> {
    const res = await api.get<ApiResponse<ProfessionalGrade[]>>(
      `/settings/professional-grades/public?departmentId=${departmentId}`
    );
    return res.data.data;
  },

  /** GET /settings/general-specialties/public?departmentId=uuid — no auth required */
  async getGeneralSpecialties(departmentId: string): Promise<GeneralSpecialty[]> {
    const res = await api.get<ApiResponse<GeneralSpecialty[]>>(
      `/settings/general-specialties/public?departmentId=${departmentId}`
    );
    return res.data.data;
  },

  /** POST /requests — public self-apply with company code */
  async submitApplication(body: SubmitApplicationBody): Promise<SubmitApplicationResponse> {
    const res = await api.post<ApiResponse<SubmitApplicationResponse>>('/requests', body);
    return res.data.data;
  },
};
