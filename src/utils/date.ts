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
