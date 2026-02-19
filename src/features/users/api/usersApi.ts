import { api } from "@/api/client";

export type UserResponseDTO = {
  id: number;
  username: string;
  fullName: string;
  cpf: string | null;
  email: string | null;
  creaNumber: string | null;
  isActive: boolean;
  permissions: string[]; // backend Set<String>
  avatarUrl: string | null;
};

export type UserCreateRequestDTO = {
  username: string;
  password: string;
  fullName: string;
  cpf?: string;
  email?: string;
  creaNumber?: string;
};

export type UserUpdateRequestDTO = {
  fullName: string;
  cpf?: string;
  email?: string;
  creaNumber?: string;
};

export type UserResetPasswordRequestDTO = {
  newPassword: string;
};

export type UserPermissionUpdateRequestDTO = {
  permissions: string[]; // backend Set<String>
};

export const usersApi = {
  async findAll(): Promise<UserResponseDTO[]> {
    const { data } = await api.get<UserResponseDTO[]>("/users");
    return data;
  },

  async findById(id: number): Promise<UserResponseDTO> {
    const { data } = await api.get<UserResponseDTO>(`/users/${id}`);
    return data;
  },

  async create(dto: UserCreateRequestDTO): Promise<UserResponseDTO> {
    const { data } = await api.post<UserResponseDTO>("/users", dto);
    return data;
  },

  async update(id: number, dto: UserUpdateRequestDTO): Promise<UserResponseDTO> {
    const { data } = await api.patch<UserResponseDTO>(`/users/${id}`, dto);
    return data;
  },

  async resetPassword(id: number, dto: UserResetPasswordRequestDTO): Promise<void> {
    await api.put(`/users/${id}/reset-password`, dto);
  },

  async updatePermissions(id: number, dto: UserPermissionUpdateRequestDTO): Promise<void> {
    await api.put(`/users/${id}/permissions`, dto);
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async activate(id: number): Promise<void> {
    await api.put(`/users/${id}`);
  },
};