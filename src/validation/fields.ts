import { z } from "zod";
import { ART_NUMBER_PATTERN } from "@/features/inspections/utils/artNumber";

/**
 * Primitivos de validação compartilhados (Zod).
 *
 * As mensagens são **chaves i18n** — os formulários exibem `t(issue.message)`.
 * Antes cada tela repetia estas regex (`CPF_REGEX`, `EMAIL_REGEX`, `CEP_REGEX`…);
 * aqui elas ficam num lugar só, espelhando o bean validation do backend.
 *
 * Campos opcionais (cpf, e-mail, telefones, ART) aceitam string vazia — vazio =
 * "não preenchido", igual ao `...(x.trim() ? { x } : {})` dos payloads. Campos
 * cujo `@Pattern` já exige conteúdo (cnpj, cep, username) rejeitam vazio.
 */

const orEmpty = (re: RegExp) => new RegExp(`^$|${re.source}`);

// ── opcionais (aceitam "") ────────────────────────────────────────────────────
export const cpf = z.string().regex(orEmpty(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/), "validation.cpfInvalid");
export const email = z.string().regex(orEmpty(/^[^\s@]+@[^\s@]+\.[^\s@]+$/), "validation.emailInvalid");
export const phone = z.string().regex(orEmpty(/^\(\d{2}\) \d{4}-\d{4}$/), "validation.phoneInvalid");
export const mobilePhone = z.string().regex(orEmpty(/^\(\d{2}\) \d{5}-\d{4}$/), "validation.mobileInvalid");
// ART do CREA-SC: 7-8 dígitos + verificador
export const artNumber = z.string().regex(orEmpty(ART_NUMBER_PATTERN), "inspectionDetails.errors.artNumberFormat");

// ── obrigatórios por natureza (o pattern exige conteúdo) ──────────────────────
export const cnpj = z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, "validation.cnpjInvalid");
export const cep = z.string().regex(/^\d{5}-\d{3}$/, "validation.cepInvalid");
export const username = z.string().regex(/^[a-z0-9]{4,}$/, "validation.usernameInvalid");

/** Texto obrigatório (validado após `trim`). */
export const requiredText = z.string().trim().min(1, "validation.required");

/**
 * Extrai a chave i18n do primeiro erro de um caminho, ou `undefined` se o campo
 * está válido. Uso: `fieldError(result, "email")` → `"validation.emailInvalid"`.
 */
export function fieldError(
  result: z.SafeParseReturnType<unknown, unknown>,
  path: string,
): string | undefined {
  if (result.success) return undefined;
  return result.error.issues.find((i) => i.path.join(".") === path)?.message;
}
