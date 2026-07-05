/**
 * Utilitários de formatação de data/hora para o padrão brasileiro (dd/mm/yyyy HH:MM).
 * Todas as funções aceitam strings ISO 8601 (LocalDate ou LocalDateTime).
 */

export function formatDateBR(iso?: string | null): string {
  if (!iso) return "—";
  const datePart = iso.split("T")[0];
  const [y, m, d] = datePart.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function formatTimeBR(iso?: string | null): string {
  if (!iso) return "—";
  const time = iso.split("T")[1];
  return time ? time.slice(0, 5) : "—";
}

export function formatDateTimeBR(iso?: string | null): string {
  if (!iso) return "—";
  return `${formatDateBR(iso)} ${formatTimeBR(iso)}`;
}

export function formatFileSizeKB(bytes?: number | null): string {
  if (typeof bytes !== "number") return "—";
  return `${Math.ceil(bytes / 1024)} KB`;
}

/**
 * Data de hoje em ISO (yyyy-mm-dd), no calendário local — evita o problema de
 * `new Date(isoDateString)` interpretar a string como UTC e `new Date()` ser local,
 * o que causa comparações incorretas em fusos atrás de UTC (ex: Brasil).
 */
export function todayISODate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Soma dias a uma data ISO (yyyy-mm-dd), retornando outra data ISO */
export function addDaysISODate(iso: string, days: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}
