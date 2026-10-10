import { api } from "@/api/client";
import { type SpringPage, toSpringPageParams } from "@/api/pagination";
import type { InspectionDeactivationReason } from "../deactivationReason";
import type { ServiceCategory } from "../serviceCategory";

export type InspectionListItem = {
  id: number;
  customerLegalName: string;
  customerMobilePhone: string | null;
  customerEmail: string | null;
  customerCity: string | null;
  inspectionDate: string;
  serviceTypeName: string;
  serviceCategory: ServiceCategory | null;
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

/** Situações pelas quais a listagem pode ser filtrada. */
export const INSPECTION_STATUSES = ["expired", "near", "ok", "inactive"] as const;

export type InspectionStatus = (typeof INSPECTION_STATUSES)[number];

/** Indica se o valor é uma situação de inspeção válida. */
export const isInspectionStatus = (value: string | null): value is InspectionStatus =>
  INSPECTION_STATUSES.some((status) => status === value);

export type InspectionListFilters = {
  status: InspectionStatus | "";
  search: string;
  serviceTypeId: number | "";
  manufacturer: string;
  model: string;
};

/** Filtros da listagem sem nenhum critério aplicado. */
export const INITIAL_INSPECTION_FILTERS: InspectionListFilters = {
  status: "",
  search: "",
  serviceTypeId: "",
  manufacturer: "",
  model: "",
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
  const { data } = await api.get<SpringPage<InspectionListItem>>("/inspections", {
    params: {
      ...toSpringPageParams({
        page,
        size: pageSize,
        sort: sortBy ? `${sortBy},${sortDir}` : undefined,
      }),
      search: filters.search?.trim() || undefined,
      status: filters.status || undefined,
      serviceTypeId: filters.serviceTypeId || undefined,
      manufacturer: filters.manufacturer?.trim() || undefined,
      model: filters.model?.trim() || undefined,
    },
  });
  return data;
}
