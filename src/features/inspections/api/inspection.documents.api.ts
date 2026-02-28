import { api } from "@/api/client";
import type { InspectionDocumentResponseDTO } from "../types/inspectionDetail";

export async function listInspectionDocuments(inspectionId: number) {
  const { data } = await api.get<InspectionDocumentResponseDTO[]>(
    `/inspections/${inspectionId}/documents`
  );
  return data;
}

export async function uploadInspectionDocument(
  inspectionId: number,
  params: { description: string; file: File }
) {
  const form = new FormData();
  form.append("description", params.description);
  form.append("file", params.file);

  const { data } = await api.post<InspectionDocumentResponseDTO>(
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
