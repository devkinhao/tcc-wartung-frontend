import { api } from "@/api/client";
import type {
  InspectionDetailResponseDTO,
  InspectionUpdateRequestDTO,
} from "../types/inspectionDetail";

export async function getInspectionDetail(id: number) {
  const { data } = await api.get<InspectionDetailResponseDTO>(`/inspections/${id}`);
  return data;
}

export async function updateInspection(id: number, dto: InspectionUpdateRequestDTO) {
  // Backend may use PUT or PATCH. PATCH is used elsewhere in this frontend.
  const { data } = await api.patch<InspectionDetailResponseDTO>(`/inspections/${id}`, dto);
  return data;
}
