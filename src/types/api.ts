/** Published job ad returned by GET /jobs/public */
export interface PublicJob {
  id: string;
  adTitle: string;
  adType: 'remote' | 'on_site' | 'hybrid';
  salaryFrom: number | null;
  salaryTo: number | null;
  description: string | null;
  deadline: string | null;
  createdAt: string;
}

/** Body for POST /requests (self-apply) */
export interface SubmitApplicationBody {
  jobAdId: string;
  hiringCompanyCode: string;
  cvUrl?: string;
  applicant: {
    name: string;
    email: string;
    phone: string;
    gender?: 'male' | 'female';
    dateOfBirth?: string;
    currentJobLocation?: string;
  };
  qualifications: {
    qualificationTypeId?: string;
    yearObtained?: number;
    instituteName?: string;
  }[];
}

/** Qualification type option from /settings/qualification-types/public */
export interface QualificationType {
  id: string;
  name: string;
}

/** Wrapped response envelope from backend utils/response.ts */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}
