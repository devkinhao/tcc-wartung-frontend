import { AbvtexSealType } from "./abvtexSeal"

export type Customer = {
  id: number;
  legalName: string;
  cnpj: string;
  city: string;
  isCustomer: boolean;
  /** false = empresa desativada (soft delete). Listada em cinza. */
  isActive: boolean;
  abvtexSeal: AbvtexSealType;
  activeInspections: number;
  nextExpirationDate: string;
};