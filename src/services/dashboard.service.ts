import api from "@/lib/api";
import type { ApiResponse, DashboardData } from "@/types/api";

export const dashboardService = {
  async get(days = 30): Promise<DashboardData> {
    const res = await api.get<ApiResponse<DashboardData>>("/dashboard", {
      params: { days },
    });
    return res.data.data;
  },
};
