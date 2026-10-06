import { api } from "@/api/client";
import type { SpringPage } from "@/api/pagination";
import type {
  CustomerSummaryResponseDTO,
  InspectionDetailResponseDTO,
  ServiceTypeResponseDTO,
} from "../types/inspectionDetail";

export type InspectionCreateRequestDTO = {
  inspectionDate: string; // ISO date
  expirationDate: string; // ISO date
  notes?: string | null;
  artNumber?: string | null;
  serviceTypeId: number;
  manufacturer?: string | null;
  model?: string | null;
  capacity?: string | null;
  cylinderCount?: number | null;
  btu?: number | null;
};

export async function createInspection(customerId: number, dto: InspectionCreateRequestDTO) {
  const { data } = await api.post<InspectionDetailResponseDTO>(`/inspections/customers/${customerId}`, dto);
  return data;
}

export async function getServiceTypes(): Promise<ServiceTypeResponseDTO[]> {
  const { data } = await api.get<ServiceTypeResponseDTO[]>("/service-types");
  return data;
}

export type CustomerSearchResult = {
  items: CustomerSummaryResponseDTO[];
  /** Total de empresas que casam com a busca, mesmo as que ficaram fora do limite de `items`. */
  total: number;
};

export async function searchCustomers(search: string): Promise<CustomerSearchResult> {
  const { data } = await api.get<SpringPage<CustomerSummaryResponseDTO>>("/customers", {
    params: { search: search || undefined, isActive: true, page: 0, size: 50 },
  });
  return { items: data.content, total: data.page.totalElements };
}
