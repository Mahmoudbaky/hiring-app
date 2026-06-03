import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import { useApp } from "@/context/AppContext";

export function useDashboard(days: number) {
  const { user } = useApp();
  const isCompanyUser = user?.role === "company_user";

  return useQuery({
    queryKey: ["dashboard", days, isCompanyUser ? "company" : "admin"],
    queryFn: () =>
      isCompanyUser ? dashboardService.getForCompany(days) : dashboardService.get(days),
    staleTime: 60_000,
  });
}
