import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "@/lib/api";

export type ClientStatus =
  | "new"
  | "review"
  | "shortlisted"
  | "interview"
  | "rejected"
  | "hired";

export interface ClientApplicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: "male" | "female" | null;
  dateOfBirth: string | null;
  nationality: string | null;
  currentJobLocation: string | null;
  assignedClientCompanyId: string | null;
  createdAt: string;
  clientStatus: ClientStatus | null;
  clientTrackingId: string | null;
}

export interface ClientApplicantDetail extends ClientApplicant {
  cvUrl: string | null;
  qualifications: {
    id: string;
    qualificationTypeId: string | null;
    yearObtained: number | null;
    instituteName: string | null;
    typeName: string | null;
  }[];
}

export const CLIENT_APPLICANTS_QUERY_KEY = ["client-applicants"] as const;
const STALE = 30_000;

async function fetchList(): Promise<ClientApplicant[]> {
  const res = await api.get("/client-applicants");
  return res.data.data;
}

async function fetchDetail(id: string): Promise<ClientApplicantDetail> {
  const res = await api.get(`/client-applicants/${id}`);
  return res.data.data;
}

async function patchStatus(applicantId: string, status: ClientStatus) {
  await api.patch(`/client-applicants/${applicantId}/status`, { status });
}

export function useClientApplicants() {
  return useQuery({
    queryKey: CLIENT_APPLICANTS_QUERY_KEY,
    queryFn: fetchList,
    staleTime: STALE,
  });
}

export function useClientApplicantDetail(id: string | null) {
  return useQuery({
    queryKey: ["client-applicant", id] as const,
    queryFn: () => fetchDetail(id!),
    enabled: !!id,
    staleTime: STALE,
  });
}

export function useUpdateClientStatus(onSuccess?: () => void, onError?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ClientStatus }) =>
      patchStatus(id, status),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: CLIENT_APPLICANTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["client-applicant", id] });
      onSuccess?.();
    },
    onError,
  });
}
