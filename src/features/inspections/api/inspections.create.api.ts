import { api } from "@/api/client";
import type {
  CustomerSummaryResponseDTO,
  InspectionDetailResponseDTO,
  ServiceTypeResponseDTO,
} from "../types/inspectionDetail";

export type InspectionCreateRequestDTO = {
  inspectionDate: string; // ISO date
  expirationDate: string; // ISO date
  notes?: string | null;
  serviceTypeId: number;
};

export async function createInspection(customerId: number, dto: InspectionCreateRequestDTO) {
  const { data } = await api.post<InspectionDetailResponseDTO>(`/inspections/customers/${customerId}`, dto);
  return data;
}

export async function getServiceTypes(): Promise<ServiceTypeResponseDTO[]> {
  const { data } = await api.get<ServiceTypeResponseDTO[]>("/service-types");
  return data;
}

export async function searchCustomers(search: string): Promise<CustomerSummaryResponseDTO[]> {
  const { data } = await api.get<{ content: CustomerSummaryResponseDTO[] }>("/customers", {
    params: { search: search || undefined, page: 0, size: 50 },
  });
  return data.content;
}
