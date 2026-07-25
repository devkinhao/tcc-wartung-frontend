// src/services/userService.ts
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

export async function getAvatar(userId: number): Promise<string> {
  const response = await api.get(`/users/${userId}/avatar`, {
    responseType: "blob",
  });

  return URL.createObjectURL(response.data);
}