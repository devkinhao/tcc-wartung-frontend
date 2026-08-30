// Motivo do encerramento de uma inspeção sem renovação.
// Espelha o enum InspectionDeactivationReason do backend.

/** Motivos que o usuário escolhe ao encerrar manualmente uma inspeção. */
export const DEACTIVATION_REASONS = ["CLIENT_DECLINED", "EQUIPMENT_DECOMMISSIONED", "OTHER"] as const;

/** Inclui também os motivos definidos automaticamente pelo sistema. */
export type InspectionDeactivationReason =
  | (typeof DEACTIVATION_REASONS)[number]
  | "CUSTOMER_INACTIVATED";

/** Chave i18n do rótulo legível de um motivo. */
export function deactivationReasonKey(reason: InspectionDeactivationReason): string {
  return `inspections.deactivate.reasons.${reason}`;
}
