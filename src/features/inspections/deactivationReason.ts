// Motivo do encerramento de uma inspeção sem renovação.
// Espelha o enum InspectionDeactivationReason do backend.

/**
 * Motivos que o usuário pode escolher ao encerrar uma inspeção.
 *
 * `CUSTOMER_INACTIVATED` e `COMPANY_CLOSED` são de nível empresa: além de
 * encerrar a inspeção, refletem na empresa (deixa de ser cliente e, no
 * encerramento de atividades, é desativada) e derrubam as demais inspeções.
 */
export const DEACTIVATION_REASONS = [
  "CLIENT_DECLINED",
  "EQUIPMENT_DECOMMISSIONED",
  "CUSTOMER_INACTIVATED",
  "COMPANY_CLOSED",
  "OTHER",
] as const;

export type InspectionDeactivationReason = (typeof DEACTIVATION_REASONS)[number];

/** Chave i18n do rótulo legível de um motivo. */
export function deactivationReasonKey(reason: InspectionDeactivationReason): string {
  return `inspections.deactivate.reasons.${reason}`;
}
