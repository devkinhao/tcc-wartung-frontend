import { api } from "@/api/client";
import type { UserDocumentResponseDTO } from "../types/UserDocument";

export async function listUserDocuments() {
  const { data } = await api.get<UserDocumentResponseDTO[]>("/users/me/documents");
  return data;
}

/** Anexa um ou mais arquivos aos documentos do usuário numa única requisição. */
export async function uploadUserDocuments(files: File[]) {
  const form = new FormData();
  files.forEach((file) => form.append("files", file));

  const { data } = await api.post<UserDocumentResponseDTO[]>("/users/me/documents", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}

export async function deleteUserDocument(docId: number) {
  await api.delete(`/users/me/documents/${docId}`);
}

export async function downloadUserDocument(docId: number) {
  const res = await api.get<Blob>(`/users/me/documents/${docId}/download`, {
    responseType: "blob",
  });
  return res.data;
}
