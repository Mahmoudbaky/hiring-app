import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { requestsService } from "@/services/requests.service";
import type { RequestStatus, ManualApplicationBody } from "@/types/api";

export const REQUESTS_QUERY_KEY = ["requests"] as const;

const STALE_TIME = 30_000; // 30 s

export function useRequests() {
  return useQuery({
    queryKey: REQUESTS_QUERY_KEY,
    queryFn: requestsService.list,
    staleTime: STALE_TIME,
  });
}

export function useRequestDetail(id: string | null) {
  return useQuery({
    queryKey: ["requests", id] as const,
    queryFn: () => requestsService.getById(id!),
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

export function useUpdateRequestStatus(onSuccess?: () => void, onError?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      requestsService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_QUERY_KEY });
      onSuccess?.();
    },
    onError,
  });
}

export function useSubmitManualApplication(onSuccess?: () => void, onError?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ManualApplicationBody) => requestsService.submitManual(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_QUERY_KEY });
      onSuccess?.();
    },
    onError,
  });
}

export function useMarkRequestViewed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => requestsService.markViewed(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: REQUESTS_QUERY_KEY });
    },
  });
}

export function usePrefetchRequests() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.prefetchQuery({
      queryKey: REQUESTS_QUERY_KEY,
      queryFn: requestsService.list,
      staleTime: STALE_TIME,
    });
  };
}
