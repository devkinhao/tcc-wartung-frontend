import { api } from "@/api/client";
import type { InspectionDeactivationReason } from "../deactivationReason";

export type InspectionListItem = {
  id: number;
  customerLegalName: string;
  customerMobilePhone: string | null;
  customerEmail: string | null;
  customerCity: string | null;
  inspectionDate: string;
  serviceTypeName: string;
  manufacturer: string | null;
  model: string | null;
  capacity: string | null;
  cylinderCount: number | null;
  btu: number | null;
  notes: string | null;
  expirationDate: string;
  isActive: boolean;
  isRenewed: boolean;
  deactivationReason: InspectionDeactivationReason | null;
};

export type InspectionStatus = "expired" | "near" | "ok";

export type InspectionListFilters = {
  status: InspectionStatus | "";
  search: string;
  serviceTypeId: number | "";
  manufacturer: string;
  model: string;
};

export type InspectionSortableColumn =
  | "customer.legalName"
  | "serviceType.name"
  | "inspectionDate"
  | "expirationDate";

export async function listAllInspections(
  filters: Partial<InspectionListFilters>,
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
        search: filters.search?.trim() || undefined,
        status: filters.status || undefined,
        serviceTypeId: filters.serviceTypeId || undefined,
        manufacturer: filters.manufacturer?.trim() || undefined,
        model: filters.model?.trim() || undefined,
        sort: sortBy ? `${sortBy},${sortDir}` : undefined,
      },
    }
  );
  return data;
}
