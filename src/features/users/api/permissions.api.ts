import { api } from "@/api/client";

export type PermissionResponseDTO = {
  id: number;
  name: string;
  description: string;
};

export const permissionsApi = {
  async findAll(): Promise<PermissionResponseDTO[]> {
    const { data } = await api.get<PermissionResponseDTO[]>("/permissions");
    return data;
  },
};