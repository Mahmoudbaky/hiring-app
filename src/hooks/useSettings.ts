import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';
import type {
  CreateCompanyBody,
  CreateUserBody,
  CreateAdminBody,
  CreateJobTitleBody,
  CreateQualificationTypeBody,
  CreateDepartmentBody,
  CreateProfessionalGradeBody,
  CreateGeneralSpecialtyBody,
} from '@/types/api';

export const COMPANIES_QUERY_KEY = ['settings', 'companies'] as const;
export const USERS_QUERY_KEY = ['settings', 'users'] as const;
export const ADMINS_QUERY_KEY = ['settings', 'admins'] as const;
export const JOB_TITLES_QUERY_KEY = ['settings', 'job-titles'] as const;
export const QUAL_TYPES_QUERY_KEY = ['settings', 'qualification-types'] as const;
export const DEPARTMENTS_QUERY_KEY = ['settings', 'departments'] as const;
export const PROFESSIONAL_GRADES_QUERY_KEY = ['settings', 'professional-grades'] as const;
export const GENERAL_SPECIALTIES_QUERY_KEY = ['settings', 'general-specialties'] as const;

// Companies
export function useCompanies() {
  return useQuery({ queryKey: COMPANIES_QUERY_KEY, queryFn: settingsService.listCompanies });
}
export function useCreateCompany(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCompanyBody) => settingsService.createCompany(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY }); onSuccess?.(); },
  });
}
export function useFreezeCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      settingsService.freezeCompany(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: COMPANIES_QUERY_KEY }),
  });
}

// Users
export function useUsers() {
  return useQuery({ queryKey: USERS_QUERY_KEY, queryFn: settingsService.listUsers });
}
export function useCreateUser(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateUserBody) => settingsService.createUser(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: USERS_QUERY_KEY }); onSuccess?.(); },
  });
}
export function useFreezeUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFrozen }: { id: string; isFrozen: boolean }) =>
      settingsService.freezeUser(id, isFrozen),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_QUERY_KEY }),
  });
}
export function useDeleteUser(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsService.deleteUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: USERS_QUERY_KEY }); onSuccess?.(); },
  });
}

// Admin users (super admin only)
export function useAdmins() {
  return useQuery({ queryKey: ADMINS_QUERY_KEY, queryFn: settingsService.listAdmins });
}
export function useCreateAdmin(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAdminBody) => settingsService.createAdmin(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ADMINS_QUERY_KEY }); onSuccess?.(); },
  });
}
export function useFreezeAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isFrozen }: { id: string; isFrozen: boolean }) =>
      settingsService.freezeAdmin(id, isFrozen),
    onSuccess: () => qc.invalidateQueries({ queryKey: ADMINS_QUERY_KEY }),
  });
}
export function useDeleteAdmin(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsService.deleteAdmin(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ADMINS_QUERY_KEY }); onSuccess?.(); },
  });
}

// Job Titles
export function useJobTitlesSettings() {
  return useQuery({ queryKey: JOB_TITLES_QUERY_KEY, queryFn: settingsService.listJobTitles });
}
export function useCreateJobTitle(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateJobTitleBody) => settingsService.createJobTitle(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: JOB_TITLES_QUERY_KEY }); onSuccess?.(); },
  });
}
export function useToggleJobTitle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      settingsService.toggleJobTitle(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: JOB_TITLES_QUERY_KEY }),
  });
}
export function useDeleteJobTitle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsService.deleteJobTitle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: JOB_TITLES_QUERY_KEY }),
  });
}

// Qualification Types
export function useQualificationTypesSettings() {
  return useQuery({ queryKey: QUAL_TYPES_QUERY_KEY, queryFn: settingsService.listQualificationTypes });
}
export function useCreateQualificationType(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateQualificationTypeBody) => settingsService.createQualificationType(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QUAL_TYPES_QUERY_KEY }); onSuccess?.(); },
  });
}
export function useToggleQualificationType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      settingsService.toggleQualificationType(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUAL_TYPES_QUERY_KEY }),
  });
}
export function useDeleteQualificationType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsService.deleteQualificationType(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUAL_TYPES_QUERY_KEY }),
  });
}

// Departments
export function useDepartmentsSettings() {
  return useQuery({ queryKey: DEPARTMENTS_QUERY_KEY, queryFn: settingsService.listDepartments });
}
export function useCreateDepartment(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateDepartmentBody) => settingsService.createDepartment(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY }); onSuccess?.(); },
  });
}
export function useToggleDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      settingsService.toggleDepartment(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY }),
  });
}
export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Partial<CreateDepartmentBody>) =>
      settingsService.updateDepartment(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY }),
  });
}
export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsService.deleteDepartment(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: DEPARTMENTS_QUERY_KEY }),
  });
}

// Professional Grades
export function useProfessionalGradesSettings() {
  return useQuery({
    queryKey: PROFESSIONAL_GRADES_QUERY_KEY,
    queryFn: () => settingsService.listProfessionalGrades(),
  });
}
export function useCreateProfessionalGrade(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProfessionalGradeBody) => settingsService.createProfessionalGrade(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: PROFESSIONAL_GRADES_QUERY_KEY }); onSuccess?.(); },
  });
}
export function useToggleProfessionalGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      settingsService.toggleProfessionalGrade(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFESSIONAL_GRADES_QUERY_KEY }),
  });
}
export function useDeleteProfessionalGrade() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsService.deleteProfessionalGrade(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFESSIONAL_GRADES_QUERY_KEY }),
  });
}

// General Specialties
export function useGeneralSpecialtiesSettings() {
  return useQuery({
    queryKey: GENERAL_SPECIALTIES_QUERY_KEY,
    queryFn: () => settingsService.listGeneralSpecialties(),
  });
}
export function useCreateGeneralSpecialty(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateGeneralSpecialtyBody) => settingsService.createGeneralSpecialty(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: GENERAL_SPECIALTIES_QUERY_KEY }); onSuccess?.(); },
  });
}
export function useToggleGeneralSpecialty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      settingsService.toggleGeneralSpecialty(id, isActive),
    onSuccess: () => qc.invalidateQueries({ queryKey: GENERAL_SPECIALTIES_QUERY_KEY }),
  });
}
export function useDeleteGeneralSpecialty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => settingsService.deleteGeneralSpecialty(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: GENERAL_SPECIALTIES_QUERY_KEY }),
  });
}
