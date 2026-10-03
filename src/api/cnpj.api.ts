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

/** Indica se o CNPJ tem 14 dígitos e dígitos verificadores corretos (rejeita também sequências repetidas, como 00000000000000). */
export function isValidCnpj(raw: string): boolean {
  const digits = normalizeCnpj(raw);
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;

  const checkDigit = (length: number) => {
    let weight = length - 7;
    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += Number(digits[i]) * weight--;
      if (weight < 2) weight = 9;
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  return (
    checkDigit(12) === Number(digits[12]) &&
    checkDigit(13) === Number(digits[13])
  );
}

export async function fetchCnpj(cnpj: string): Promise<ReceitaWsResponseDTO> {
  const { data } = await api.get<ReceitaWsResponseDTO>(`/integrations/cnpj/${normalizeCnpj(cnpj)}`);
  return data;
}
