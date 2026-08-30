import { api } from "@/api/client";

export type InspectionListItem = {
  id: number;
  customerLegalName: string;
  customerMobilePhone: string | null;
  customerEmail: string | null;
  customerCity: string | null;
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

export type InspectionSortableColumn =
  | "customer.legalName"
  | "serviceType.name"
  | "inspectionDate"
  | "expirationDate";

export async function listAllInspections(
  filters: InspectionListFilters,
  page: number,
  pageSize: number,
  sortBy: InspectionSortableColumn | null = null,
  sortDir: "asc" | "desc" = "asc"
) {
  const { data } = await api.get<{ content: InspectionListItem[]; page: { totalElements: number } }>(
    "/inspections",
    {
      params: {
        page: page - 1,
        size: pageSize,
        search: filters.search || undefined,
        status: filters.status || undefined,
        sort: sortBy ? `${sortBy},${sortDir}` : undefined,
      },
    }
  );
  return data;
}
