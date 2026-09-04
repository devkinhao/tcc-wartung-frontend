import { api } from "@/api/client";
import type { ServiceCategory } from "@/features/inspections/serviceCategory";

export type ServiceTypeResponseDTO = {
  id: number;
  name: string;
  /** Null = serviço customizado (fora do catálogo fixo), sem campos de equipamento. */
  category: ServiceCategory | null;
};

export type ServiceTypeCreateRequestDTO = {
  name: string;
};

export type ServiceTypeUpdateRequestDTO = {
  name: string;
};

export const serviceTypesApi = {
  async findAll(): Promise<ServiceTypeResponseDTO[]> {
    const { data } = await api.get<ServiceTypeResponseDTO[]>("/service-types");
    return data;
  },

  async create(dto: ServiceTypeCreateRequestDTO): Promise<ServiceTypeResponseDTO> {
    const { data } = await api.post<ServiceTypeResponseDTO>("/service-types", dto);
    return data;
  },

  async update(id: number, dto: ServiceTypeUpdateRequestDTO): Promise<ServiceTypeResponseDTO> {
    const { data } = await api.patch<ServiceTypeResponseDTO>(`/service-types/${id}`, dto);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/service-types/${id}`);
  },
};
