/**
 * Funções de máscara para campos de formulário.
 *
 * Cada função recebe o valor atual (com ou sem máscara) e devolve
 * o valor formatado progressivamente enquanto o usuário digita.
 * O valor armazenado no estado é sempre a string mascarada.
 */

export type MaskType = "cpf" | "cnpj" | "phone" | "mobile" | "cep" | "art";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Extrai apenas os dígitos de uma string */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

// ── Máscaras ─────────────────────────────────────────────────────────────────

/** CPF: 000.000.000-00 */
export function maskCpf(value: string): string {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

/** CNPJ: 00.000.000/0000-00 */
export function maskCnpj(value: string): string {
  const d = digitsOnly(value).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
}

/** Telefone fixo: (00) 0000-0000  (máx 10 dígitos) */
export function maskPhone(value: string): string {
  const d = digitsOnly(value).slice(0, 10);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
}

/** Celular: (00) 00000-0000  (máx 11 dígitos) */
export function maskMobile(value: string): string {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** CEP: 00000-000 */
export function maskCep(value: string): string {
  const d = digitsOnly(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

/**
 * Número da ART (CREA-SC): dígito verificador sempre após o hífen.
 * Aceita ARTs antigas (7 dígitos + verificador → 0000000-0) e
 * novas (8 dígitos + verificador → 00000000-0).
 *
 * O hífen é sempre inserido antes do último dígito digitado, então ao digitar
 * uma ART de 8 dígitos o agrupamento se ajusta ao teclar o verificador.
 */
export function maskArt(value: string): string {
  const d = digitsOnly(value).slice(0, 9);
  if (d.length <= 7) return d;
  return `${d.slice(0, d.length - 1)}-${d.slice(d.length - 1)}`;
}

// ── Dispatcher ────────────────────────────────────────────────────────────────

const MASK_FNS: Record<MaskType, (v: string) => string> = {
  cpf: maskCpf,
  cnpj: maskCnpj,
  phone: maskPhone,
  mobile: maskMobile,
  cep: maskCep,
  art: maskArt,
};

export function applyMask(value: string, type: MaskType): string {
  return MASK_FNS[type](value);
}

// ── Placeholders ──────────────────────────────────────────────────────────────

export const MASK_PLACEHOLDERS: Record<MaskType, string> = {
  cpf: "000.000.000-00",
  cnpj: "00.000.000/0000-00",
  phone: "(00) 0000-0000",
  mobile: "(00) 00000-0000",
  cep: "00000-000",
  art: "00000000-0",
};
