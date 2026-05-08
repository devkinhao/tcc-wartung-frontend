import { api } from "@/api/client";

// Filtros do Relatório 1 — Empresas
export type CompanyReportFilters = {
  isCustomer?: boolean | null;   // null = todas
  abvtexSeal?: string | null;    // null = todos
  city?: string | null;          // null = todas
};

/**
 * Recebe um PDF como Blob e abre em nova guia do navegador.
 * Revoga a URL temporária após 60 s para liberar memória.
 */
function openPdfInNewTab(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/**
 * Faz a requisição GET com responseType "blob".
 * Todos os relatórios retornam application/pdf.
 */
async function fetchPdf(path: string, params?: Record<string, unknown>): Promise<Blob> {
  const { data } = await api.get<Blob>(path, {
    responseType: "blob",
    params,
  });
  return data;
}

// ── Relatório 1 — Empresas ───────────────────────────────────────────────────

export async function generateCompanyReport(filters: CompanyReportFilters = {}): Promise<void> {
  const params: Record<string, unknown> = {};

  if (filters.isCustomer !== null && filters.isCustomer !== undefined) {
    params.isCustomer = filters.isCustomer;
  }
  if (filters.abvtexSeal) {
    params.abvtexSeal = filters.abvtexSeal;
  }
  if (filters.city) {
    params.city = filters.city;
  }

  const blob = await fetchPdf("/reports/companies", params);
  openPdfInNewTab(blob);
}

// ── Relatório 2 — Vencimentos por mês e cliente ──────────────────────────────

export async function generateExpiringInspectionsReport(): Promise<void> {
  const blob = await fetchPdf("/reports/expiring-inspections");
  openPdfInNewTab(blob);
}

// ── Relatório 3 — Inspeções vencidas ─────────────────────────────────────────

export async function generateOverdueInspectionsReport(): Promise<void> {
  const blob = await fetchPdf("/reports/overdue-inspections");
  openPdfInNewTab(blob);
}
