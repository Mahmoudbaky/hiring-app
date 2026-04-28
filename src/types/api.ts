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

export type RequestStatus =
  | "new"
  | "review"
  | "shortlisted"
  | "interview"
  | "rejected"
  | "hired";

/** Full job request returned by GET /requests */
export interface JobRequest {
  id: string;
  status: RequestStatus;
  submissionType: "self" | "manual";
  cvUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  applicant: {
    id: string;
    name: string;
    email: string;
    phone: string;
    gender: "male" | "female" | null;
    currentJobLocation: string | null;
  };
  jobAd: {
    id: string;
    adTitle: string;
  };
  company: {
    id: string;
    companyName: string;
  };
}

/** Full request detail returned by GET /requests/:id (includes qualifications) */
export interface JobRequestDetail extends Omit<JobRequest, "applicant"> {
  applicant: JobRequest["applicant"] & {
    dateOfBirth: string | null;
  };
  qualifications: {
    id: string;
    yearObtained: number | null;
    instituteName: string | null;
    typeName: string | null;
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
