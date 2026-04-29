import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import type { CreateJobBody } from '@/types/api';

export const JOBS_QUERY_KEY = ['jobs'] as const;

export function useJobs() {
  return useQuery({
    queryKey: JOBS_QUERY_KEY,
    queryFn: jobsService.list,
    staleTime: 30_000,
  });
}

export function useCreateJob(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateJobBody) => jobsService.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_QUERY_KEY });
      onSuccess?.();
    },
  });
}

export function useJobTitles() {
  return useQuery({
    queryKey: ['settings', 'job-titles'] as const,
    queryFn: jobsService.listJobTitles,
    staleTime: 1000 * 60 * 10,
  });
}
