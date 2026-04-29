import api from "@/lib/api";
import type { ApiResponse, JobRequest, JobRequestDetail, RequestStatus, ManualApplicationBody } from "@/types/api";

export const requestsService = {
  async list(): Promise<JobRequest[]> {
    const res = await api.get<ApiResponse<JobRequest[]>>("/requests");
    return res.data.data;
  },

  async getById(id: string): Promise<JobRequestDetail> {
    const res = await api.get<ApiResponse<JobRequestDetail>>(`/requests/${id}`);
    return res.data.data;
  },

  async updateStatus(id: string, status: RequestStatus): Promise<void> {
    await api.patch(`/requests/${id}/status`, { status });
  },

  async submitManual(body: ManualApplicationBody): Promise<void> {
    await api.post("/requests/manual", body);
  },
};
