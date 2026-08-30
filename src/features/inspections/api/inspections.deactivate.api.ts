import { api } from "@/api/client";
import type { InspectionDetailResponseDTO } from "../types/inspectionDetail";
import type { InspectionDeactivationReason } from "../deactivationReason";

/**
 * Encerra uma inspeção sem renovação (isActive = false), registrando o motivo.
 * Ela deixa de aparecer nas listas de pendência, mas continua no histórico
 * da empresa.
 */
export async function deactivateInspection(id: number, reason: InspectionDeactivationReason) {
  const { data } = await api.post<InspectionDetailResponseDTO>(`/inspections/${id}/deactivate`, { reason });
  return data;
}
