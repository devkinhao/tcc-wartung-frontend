import { api } from "@/api/client";
import type { InspectionDocumentResponseDTO } from "../types/inspectionDetail";

export async function listInspectionDocuments(inspectionId: number) {
  const { data } = await api.get<InspectionDocumentResponseDTO[]>(
    `/inspections/${inspectionId}/documents`
  );
  return data;
}

/** Anexa um ou mais arquivos à inspeção numa única requisição. */
export async function uploadInspectionDocuments(inspectionId: number, files: File[]) {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));

  const { data } = await api.post<InspectionDocumentResponseDTO[]>(
    `/inspections/${inspectionId}/documents`,
    form,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return data;
}

export async function deleteInspectionDocument(inspectionId: number, docId: number) {
  await api.delete(`/inspections/${inspectionId}/documents/${docId}`);
}

export async function downloadInspectionDocument(inspectionId: number, docId: number) {
  const res = await api.get<Blob>(
    `/inspections/${inspectionId}/documents/${docId}/download`,
    {
      responseType: "blob",
    }
  );
  return res.data;
}
