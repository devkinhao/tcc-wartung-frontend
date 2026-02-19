import { AbvtexSealType } from "./abvtexSeal"

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