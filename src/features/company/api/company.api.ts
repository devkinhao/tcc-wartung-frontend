import { api } from "@/api/client";
import type { AddressResponseDTO } from "@/features/customers/types/customerDetail";

// ---- Response ----

export type CompanyResponseDTO = {
  id: number;
  fantasyName: string | null;
  legalName: string;
  cnpj: string;
  address: AddressResponseDTO | null;
  phone: string | null;
  mobilePhone: string | null;
  email: string | null;
};

// ---- Request ----

export type AddressRequestDTO = {
  street: string;
  complement?: string | null;
  neighborhood: string;
  number: string;
  zipCode: string;
  cityId: number;
};

export type CompanyUpdateRequestDTO = {
  fantasyName?: string | null;
  legalName: string;
  cnpj: string;
  address: AddressRequestDTO;
  phone?: string | null;
  mobilePhone?: string | null;
  email?: string | null;
};

// ---- API calls ----

export async function getCompany(): Promise<CompanyResponseDTO> {
  const { data } = await api.get<CompanyResponseDTO>("/company");
  return data;
}

export async function updateCompany(dto: CompanyUpdateRequestDTO): Promise<void> {
  await api.put("/company", dto);
}
