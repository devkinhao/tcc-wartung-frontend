import { api } from "@/api/client";

export type InspectionListItem = {
  id: number;
  customerLegalName: string;
  inspectionDate: string;
  serviceTypeName: string;
  notes: string | null;
  expirationDate: string;
};

export type InspectionStatus = "expired" | "near" | "ok";

export type InspectionListFilters = {
  status: InspectionStatus | "";
  search: string;
};

export async function listAllInspections(
  filters: InspectionListFilters,
  page: number,
  pageSize: number
) {
  const { data } = await api.get<{ content: InspectionListItem[]; page: { totalElements: number } }>(
    "/inspections",
    {
      params: {
        page: page - 1,
        size: pageSize,
        search: filters.search || undefined,
        status: filters.status || undefined,
      },
    }
  );
  return data;
}
