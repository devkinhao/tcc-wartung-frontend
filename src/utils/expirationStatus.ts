import { addDaysISODate, todayISODate } from "./date";

export type ExpirationStatus = "expired" | "near" | "ok";

// Cores do chip de vencimento — mesmas em ambos os temas (claro/escuro), já
// validadas visualmente para contraste em qualquer fundo.
export const EXPIRATION_COLORS = {
  expired: "#c65b4a",
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
