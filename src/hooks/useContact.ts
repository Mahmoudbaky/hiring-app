import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactService } from '@/services/contact.service';
import type { SubmitContactBody } from '@/types/api';

export const CONTACT_QUERY_KEY = ['contact'] as const;

export function useContactMessages() {
  return useQuery({
    queryKey: CONTACT_QUERY_KEY,
    queryFn: contactService.list,
    staleTime: 30_000,
  });
}

export function useSubmitContact(onSuccess?: () => void) {
  return useMutation({
    mutationFn: (body: SubmitContactBody) => contactService.submit(body),
    onSuccess: () => onSuccess?.(),
  });
}

export function useMarkContactRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactService.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACT_QUERY_KEY });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTACT_QUERY_KEY });
    },
  });
}
