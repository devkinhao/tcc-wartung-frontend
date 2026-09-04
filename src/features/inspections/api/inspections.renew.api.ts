import { api } from "@/api/client";
import type { InspectionDetailResponseDTO } from "../types/inspectionDetail";

export type InspectionRenewRequestDTO = {
  inspectionDate: string; // ISO date
  expirationDate: string; // ISO date
  notes?: string | null;
  artNumber?: string | null;
  manufacturer?: string | null;
  model?: string | null;
  capacity?: string | null;
  cylinderCount?: number | null;
  btu?: number | null;
};

/**
 * Renova uma inspeção: o backend cria uma nova inspeção herdando o cliente e o
 * serviço da inspeção de origem e marca a anterior como renovada/inativa.
 */
export async function renewInspection(id: number, dto: InspectionRenewRequestDTO) {
  const { data } = await api.post<InspectionDetailResponseDTO>(`/inspections/${id}/renew`, dto);
  return data;
}
