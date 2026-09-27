// Operações do próprio usuário logado (/users/me). A gestão de usuários pelo
// admin fica em users.api.ts.
import { api } from "@/api/client";
import { User } from "../types/User";

export async function getMe(): Promise<User> {
  const response = await api.get<User>("/users/me");
  return response.data;
}

export async function updateMe(data: {
  fullName: string;
  cpf?: string;
  email?: string;
  creaNumber?: string;
  profession?: string;
}) {
  await api.patch("/users/me", data);
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}) {
  await api.put("/users/me/password", data);
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return api.put("/users/me/avatar", formData);
}

export async function removeAvatar() {
  return api.delete("/users/me/avatar");
}

/**
 * Devolve o Blob da foto, e nao uma object URL, de proposito: o Blob pode ser
 * cacheado e compartilhado pelo React Query, enquanto cada componente cria (e
 * revoga) a propria object URL. Se a URL fosse cacheada, um componente ao
 * desmontar revogaria a imagem ainda em uso por outro.
 */
export async function getAvatarBlob(userId: number): Promise<Blob> {
  const response = await api.get(`/users/${userId}/avatar`, {
    responseType: "blob",
  });

  return response.data;
}