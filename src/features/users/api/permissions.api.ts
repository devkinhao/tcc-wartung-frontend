import { api } from "@/api/client";

export type PermissionResponseDTO = {
  id: number;
  name: string;
  description: string;
};

export async function getPermissions(): Promise<PermissionResponseDTO[]> {
  const { data } = await api.get<PermissionResponseDTO[]>("/permissions");
  return data;
}
