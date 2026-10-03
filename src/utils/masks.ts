/**
 * Funções de máscara para campos de formulário.
 * Cada função recebe o valor atual (com ou sem máscara) e devolve o valor formatado progressivamente enquanto o usuário digita.
 * O valor armazenado no estado é sempre a string mascarada.
 */
export type MaskType = "cpf" | "cnpj" | "phone" | "mobile" | "cep" | "art";

/** Extrai apenas os dígitos de uma string. */
export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Formata os dígitos do valor pelo padrão, em que "#" é um dígito.
 * Os separadores só aparecem quando há dígito depois deles e os dígitos excedentes são descartados.
 */
function formatByPattern(value: string, pattern: string): string {
  const digits = digitsOnly(value);
  let result = "";
  let next = 0;

  for (const char of pattern) {
    if (next >= digits.length) break;
    result += char === "#" ? digits[next++] : char;
  }

  return result;
}

/** Formato para o CPF é "000.000.000-00" */
export const maskCpf = (value: string) =>
  formatByPattern(value, "###.###.###-##");

/** Formato para o CNPJ é "00.000.000/0000-00" */
export const maskCnpj = (value: string) =>
  formatByPattern(value, "##.###.###/####-##");

/** Formato para o telefone fixo é "(00) 0000-0000" */
export const maskPhone = (value: string) =>
  formatByPattern(value, "(##) ####-####");

/** Formato para o celular é "(00) 00000-0000" */
export const maskMobile = (value: string) =>
  formatByPattern(value, "(##) #####-####");

/** Formato para o CEP é "00000-000" */
export const maskCep = (value: string) => formatByPattern(value, "#####-###");

/**
 * Para o número da ART (CREA-SC), o dígito verificador é sempre após o hífen.
 * Aceita ARTs antigas (7 dígitos + verificador → 0000000-0) e novas (8 dígitos + verificador → 00000000-0).
 * O hífen é sempre inserido antes do último dígito digitado, então ao digitar uma ART de 8 dígitos o agrupamento se ajusta ao teclar o verificador.
 */
export function maskArt(value: string): string {
  const digits = digitsOnly(value).slice(0, 9);
  if (digits.length <= 7) return digits;
  return `${digits.slice(0, -1)}-${digits.slice(-1)}`;
}

const MASK_FNS: Record<MaskType, (value: string) => string> = {
  cpf: maskCpf,
  cnpj: maskCnpj,
  phone: maskPhone,
  mobile: maskMobile,
  cep: maskCep,
  art: maskArt,
};

/** Aplica ao valor a máscara do tipo informado. */
export function applyMask(value: string, type: MaskType): string {
  return MASK_FNS[type](value);
}

/** Placeholder de cada máscara, exibido no campo vazio. */
export const MASK_PLACEHOLDERS: Record<MaskType, string> = {
  cpf: "000.000.000-00",
  cnpj: "00.000.000/0000-00",
  phone: "(00) 0000-0000",
  mobile: "(00) 00000-0000",
  cep: "00000-000",
  art: "00000000-0",
};
