import { z } from "zod";
import * as f from "@/validation/fields";
import { INSPECTION_NOTES_MAX_LENGTH } from "./constants";

/**
 * Campos comuns aos formulários de inspeção (cadastrar / renovar / editar).
 * Espelha InspectionCreateRequestDTO / InspectionRenewRequestDTO:
 *  - datas obrigatórias, vencimento **estritamente após** a data da inspeção
 *    (backend: `!expirationDate.isAfter(inspectionDate)` → erro)
 *  - ART opcional, no formato do CREA-SC
 *  - observações até 255 caracteres
 *
 * Datas são strings ISO `yyyy-mm-dd`, então `>` já compara cronologicamente.
 */
export const inspectionFormSchema = z
  .object({
    inspectionDate: f.requiredText,
    expirationDate: f.requiredText,
    artNumber: f.artNumber,
    notes: z.string().max(INSPECTION_NOTES_MAX_LENGTH),
  })
  .refine((v) => v.expirationDate > v.inspectionDate, {
    path: ["expirationDate"],
    message: "inspections.addModal.errors.expirationBeforeInspection",
  });
