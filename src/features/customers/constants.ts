// src/pages/customers/constants.ts
import { AbvtexSealType } from "./types";

export const abvtexStyles: Record<AbvtexSealType, string> = {
  NAO_POSSUI: "bg-gray-200 text-gray-600",
  COBRE: "bg-orange-100 text-orange-700",
  BRONZE: "bg-amber-200 text-amber-800",
  PRATA: "bg-slate-200 text-slate-700",
  OURO: "bg-yellow-200 text-yellow-800",
};

export const abvtexLabel: Record<AbvtexSealType, string> = {
  NAO_POSSUI: "Não possui",
  COBRE: "Cobre",
  BRONZE: "Bronze",
  PRATA: "Prata",
  OURO: "Ouro",
};