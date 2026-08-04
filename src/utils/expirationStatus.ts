import { addDaysISODate, todayISODate } from "./date";

export type ExpirationStatus = "expired" | "near" | "ok";

// Cores do chip de vencimento — mesmas em ambos os temas (claro/escuro).
// "expired" usa texto branco em cima: #c65b4a original dava 4.2:1 (abaixo do
// mínimo WCAG AA de 4.5:1 para texto normal); #b25243 passa com ~5:1.
export const EXPIRATION_COLORS = {
  expired: "#b25243",
  near: "#e0a83f",
} as const;

// Comparação por string yyyy-mm-dd (ordem lexicográfica == ordem cronológica),
// igual à semântica de LocalDate no backend — evita bugs de fuso horário que
// surgiriam ao usar objetos Date (new Date(isoString) interpreta como UTC).
export function getExpirationStatus(
  expirationDate: string | null | undefined,
  alertDays: number
): ExpirationStatus | null {
  if (!expirationDate) return null;

  const exp           = expirationDate.split("T")[0];
  const today          = todayISODate();
  const alertThreshold = addDaysISODate(today, alertDays);

  if (exp < today)           return "expired";
  if (exp <= alertThreshold) return "near";
  return "ok";
}
