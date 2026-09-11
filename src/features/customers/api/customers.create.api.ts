import { api } from "@/api/client";
import type { AbvtexSealType } from "../types/abvtexSeal";

// Espelha CustomerCreateRequestDTO + AddressRequestDTO no backend.
export type CustomerCreateRequestDTO = {
  fantasyName: string;
  legalName: string;
  cnpj: string;
  abvtexSeal: AbvtexSealType;
  phone?: string;
  mobilePhone?: string;
  email?: string;
  address: {
    street: string;
    complement: string;
    neighborhood: string;
    number: string;
    zipCode: string;
    cityId: number;
  };
};

export async function createCustomer(dto: CustomerCreateRequestDTO): Promise<{ id: number }> {
  const { data } = await api.post<{ id: number }>("/customers", dto);
  return data;
}
