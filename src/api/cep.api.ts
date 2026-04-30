import { api } from "./client";

export type ViaCepResponseDTO = {
  street: string;
  complement: string;
  neighborhood: string;
  zipCode: string; // retorna formatado: "00000-000"
  cityId: number;
};

/** Normaliza para 8 dígitos — aceita "01310-100" ou "01310100" */
export function normalizeCep(raw: string): string {
  return raw.replace(/\D/g, "");
}

export async function fetchCep(cep: string): Promise<ViaCepResponseDTO> {
  const { data } = await api.get<ViaCepResponseDTO>(`/integrations/cep/${normalizeCep(cep)}`);
  return data;
}
