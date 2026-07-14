import { api } from "./client";
import { digitsOnly } from "@/utils/masks";

export type ReceitaWsResponseDTO = {
  fantasyName: string;
  legalName: string;
  cnpj: string;
  phone: string;
  email: string;
  street: string;
  complement: string;
  neighborhood: string;
  number: string;
  zipCode: string;
  cityId: number;
};

/** Normaliza para 14 dígitos — aceita "12.345.678/0001-90" ou "12345678000190" */
export function normalizeCnpj(raw: string): string {
  return digitsOnly(raw);
}

export async function fetchCnpj(cnpj: string): Promise<ReceitaWsResponseDTO> {
  const { data } = await api.get<ReceitaWsResponseDTO>(`/integrations/cnpj/${normalizeCnpj(cnpj)}`);
  return data;
}
