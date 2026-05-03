import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/services/profile.service';

export const PROFILE_QUERY_KEY = ['profile', 'me'] as const;
export const MY_COMPANY_QUERY_KEY = ['profile', 'company'] as const;

export function useMyProfile() {
  return useQuery({ queryKey: PROFILE_QUERY_KEY, queryFn: profileService.getMe });
}

export function useMyCompany() {
  return useQuery({ queryKey: MY_COMPANY_QUERY_KEY, queryFn: profileService.getMyCompany });
}

export function useUpdateProfile(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { name?: string; image?: string | null; newPassword?: string }) => profileService.updateMe(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: PROFILE_QUERY_KEY }); onSuccess?.(); },
  });
}

export function useUpdateMyCompany(onSuccess?: () => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<typeof profileService.updateMyCompany>[0]) =>
      profileService.updateMyCompany(body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: MY_COMPANY_QUERY_KEY }); onSuccess?.(); },
  });
}

export function useUploadImage() {
  return useMutation({ mutationFn: (file: File) => profileService.uploadImage(file) });
}
