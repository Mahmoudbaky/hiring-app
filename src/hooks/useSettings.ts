import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@/services/settings.service';
import type { CreateCompanyBody, CreateUserBody, CreateJobTitleBody, CreateQualificationTypeBody } from '@/types/api';

export const COMPANIES_QUERY_KEY = ['settings', 'companies'] as const;
export const USERS_QUERY_KEY = ['settings', 'users'] as const;
export const JOB_TITLES_QUERY_KEY = ['settings', 'job-titles'] as const;
export const QUAL_TYPES_QUERY_KEY = ['settings', 'qualification-types'] as const;

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
