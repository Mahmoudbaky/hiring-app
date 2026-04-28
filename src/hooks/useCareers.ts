import { useMutation, useQuery } from '@tanstack/react-query';
import { careersService } from '@/services/careers.service';
import type { SubmitApplicationBody } from '@/types/api';

const KEYS = {
  publishedJobs: ['careers', 'jobs'] as const,
};

/** Fetch all published job ads — used by CareersPage & ApplyPage */
export function usePublishedJobs() {
  return useQuery({
    queryKey: KEYS.publishedJobs,
    queryFn: careersService.getPublishedJobs,
    staleTime: 1000 * 60 * 5, // 5 min
  });
}

/** Select a single job from the already-fetched list */
export function usePublishedJob(id: string | undefined) {
  return useQuery({
    queryKey: KEYS.publishedJobs,
    queryFn: careersService.getPublishedJobs,
    staleTime: 1000 * 60 * 5,
    select: (jobs) => jobs.find((j) => j.id === id),
    enabled: !!id,
  });
}

/** Fetch active qualification types — used by the public apply form */
export function useQualificationTypes() {
  return useQuery({
    queryKey: ['careers', 'qualificationTypes'] as const,
    queryFn: careersService.getQualificationTypes,
    staleTime: 1000 * 60 * 10,
  });
}

/** POST /requests — self-apply */
export function useSubmitApplication() {
  return useMutation({
    mutationFn: (body: SubmitApplicationBody) =>
      careersService.submitApplication(body),
  });
}
