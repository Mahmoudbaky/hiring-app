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

/** Qualification type option from /settings/qualification-types */
export interface QualificationType {
  id: string;
  name: string;
  isActive: boolean;
}

/** Wrapped response envelope from backend utils/response.ts */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

/** Authenticated job ad returned by GET /jobs */
export interface JobAd {
  id: string;
  adTitle: string;
  adType: 'remote' | 'on_site' | 'hybrid';
  salaryFrom: number | null;
  salaryTo: number | null;
  description: string | null;
  isPublished: boolean;
  deadline: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Job title option from GET /settings/job-titles */
export interface JobTitle {
  id: string;
  title: string;
  isActive: boolean;
}

/** Hiring company from GET /companies */
export interface HiringCompany {
  id: string;
  companyName: string;
  uniqueCode: string;
  phoneNumber: string | null;
  address: string | null;
  managerName: string | null;
  companyRecord: string | null;
  isAdminCompany: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Body for POST /requests/manual (authenticated company_user) */
export interface ManualApplicationBody {
  jobAdId: string;
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

/** Body for POST /companies */
export interface CreateCompanyBody {
  companyName: string;
  uniqueCode: string;
  phoneNumber?: string;
  address?: string;
  managerName?: string;
}

/** User from GET /users */
export interface CompanyUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'company_user';
  hiringCompanyId: string | null;
  createdAt: string;
}

/** Body for POST /users */
export interface CreateUserBody {
  name: string;
  email: string;
  password: string;
  hiringCompanyId?: string;
}

/** Body for POST /settings/job-titles */
export interface CreateJobTitleBody {
  title: string;
}

/** Body for POST /settings/qualification-types */
export interface CreateQualificationTypeBody {
  name: string;
}

/** Body for POST /jobs (super_admin only) */
export interface CreateJobBody {
  adTitle: string;
  jobTitleId?: string | null;
  adType: 'remote' | 'on_site' | 'hybrid';
  salaryFrom?: number;
  salaryTo?: number;
  description?: string;
  isPublished: boolean;
  deadline?: string | null;
}
