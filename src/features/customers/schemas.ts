import { z } from "zod";
import * as f from "@/validation/fields";

/**
 * Schemas de validação de empresa/cliente (mesma entidade no backend —
 * `CustomerCreateRequestDTO` / `CustomerUpdateRequestDTO`). Compartilhados por
 * `AddCompanyModal`, `CompanyPage` ("Minha empresa") e as abas de detalhe do
 * cliente. Mensagens = chaves i18n.
 */

export const companyGeneralSchema = z.object({
  fantasyName: z.string().max(100),
  legalName: f.requiredText.max(100),
  cnpj: f.cnpj,
});

export const companyContactsSchema = z.object({
  phone: f.phone,
  mobilePhone: f.mobilePhone,
  email: f.email,
});

export const companyAddressSchema = z.object({
  street: f.requiredText,
  number: z.string(),
  complement: z.string(),
  neighborhood: z.string(),
  zipCode: f.cep,
  cityId: z.number().int().positive(),
});
