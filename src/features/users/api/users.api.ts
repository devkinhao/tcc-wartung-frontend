import { api } from "@/api/client";
import type { User } from "../types/User";

// `/users` e `/users/{id}` devolvem o mesmo shape do usuário logado (`/users/me`),
// representado por `User` (src/features/users/types/User.ts).

export type UserCreateRequestDTO = {
  username: string;
  password: string;
  fullName: string;
  cpf?: string;
  email?: string;
  creaNumber?: string;
  profession?: string;
};

export type UserUpdateRequestDTO = {
  fullName: string;
  cpf?: string;
  email?: string;
  creaNumber?: string;
  profession?: string;
};

export type UserResetPasswordRequestDTO = {
  newPassword: string;
};

export type UserPermissionUpdateRequestDTO = {
  permissions: string[]; // backend Set<String>
};

export async function getUsers(): Promise<User[]> {
  const { data } = await api.get<User[]>("/users");
  return data;
}

export async function getUser(id: number): Promise<User> {
  const { data } = await api.get<User>(`/users/${id}`);
  return data;
}

export async function createUser(dto: UserCreateRequestDTO): Promise<User> {
  const { data } = await api.post<User>("/users", dto);
  return data;
}

export async function updateUser(id: number, dto: UserUpdateRequestDTO): Promise<User> {
  const { data } = await api.patch<User>(`/users/${id}`, dto);
  return data;
}

export async function resetUserPassword(id: number, dto: UserResetPasswordRequestDTO): Promise<void> {
  await api.put(`/users/${id}/reset-password`, dto);
}

export async function updateUserPermissions(id: number, dto: UserPermissionUpdateRequestDTO): Promise<void> {
  await api.put(`/users/${id}/permissions`, dto);
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/users/${id}`);
}
