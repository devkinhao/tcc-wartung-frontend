import { api } from "@/api/client";

export type InspectionStatus = {
  expired: number;
  nearExpiration: number;
  onTrack: number;
};

export type CompanyCounts = {
  /** Empresas ativas (total = clients + nonClients). */
  total: number;
  clients: number;
  nonClients: number;
  /** Empresas inativas (soft delete). */
  inactive: number;
};

export type ExpirationByMonth = {
  year: number;
  month: number;
  count: number;
};

export type ServiceRankingItem = {
  serviceName: string;
  count: number;
};

export type CustomersByCityItem = {
  city: string;
  count: number;
};

export type DashboardData = {
  inspectionStatus: InspectionStatus;
  companyCounts: CompanyCounts;
  expirationsByMonth: ExpirationByMonth[];
  serviceRanking: ServiceRankingItem[];
  customersByCity: CustomersByCityItem[];
};

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await api.get<DashboardData>("/dashboard");
  return data;
}
