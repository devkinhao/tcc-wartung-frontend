// src/pages/customers/types.ts
export type AbvtexSealType =
  | "NAO_POSSUI"
  | "COBRE"
  | "BRONZE"
  | "PRATA"
  | "OURO";

export type Customer = {
  id: number;
  legalName: string;
  cnpj: string;
  city: string;
  isCustomer: boolean;
  abvtexSeal: AbvtexSealType;
  activeInspections: number;
  nextExpirationDate: string;
};
