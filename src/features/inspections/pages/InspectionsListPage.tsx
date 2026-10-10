import { qk } from "@/api/keys";
import { Pagination } from "@/components/Pagination";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { useSessionStorageState } from "@/hooks/useSessionStorageState";
import { PageHeader } from "@/layout/header/PageHeader";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { paths } from "@/routes/paths";
import { Stack } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import {
  INITIAL_INSPECTION_FILTERS,
  isInspectionStatus,
  listAllInspections,
  type InspectionListFilters,
  type InspectionSortableColumn,
} from "../api/inspections.list.api";
import { AddInspectionModal } from "../components/AddInspectionModal";
import { InspectionDetailModal } from "../components/InspectionDetailModal";
import { InspectionsFilters } from "../components/InspectionsFilters";
import { InspectionsTable } from "../components/InspectionsTable";
import { useInspectionRowActions } from "../hooks/useInspectionRowActions";

/** Listagem de inspeções, com filtros, ordenação e paginação mantidos na sessão. */
export default function InspectionsListPage() {
  /** Hooks. */
  const { t } = useTranslation();

  /** Estados. */
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [clickedDetailId, setClickedDetailId] = useState<number | null>(null);

  /** Filtros, página e ordenação guardados na sessão, para serem restaurados ao voltar à tela. */
  const [filters, setFilters] = useSessionStorageState<InspectionListFilters>(
    "inspections-list.filters.v2",
    INITIAL_INSPECTION_FILTERS,
  );
  const [page, setPage] = useSessionStorageState("inspections-list.page", 1);
  const [pageSize, setPageSize] = useSessionStorageState(
    "inspections-list.pageSize",
    10,
  );
  const [sortBy, setSortBy] =
    useSessionStorageState<InspectionSortableColumn | null>(
      "inspections-list.sortBy",
      null,
    );
  const [sortDir, setSortDir] = useSessionStorageState<"asc" | "desc">(
    "inspections-list.sortDir",
    "asc",
  );

  /** Parâmetros de URL. */
  const [searchParams, setSearchParams] = useSearchParams();

  /** Aplica o status vindo da URL apenas na chegada e remove o parâmetro. */
  useEffect(() => {
    const urlStatus = searchParams.get("status");
    if (isInspectionStatus(urlStatus)) {
      setFilters((p) => ({ ...p, status: urlStatus }));
      setPage(1);
      const next = new URLSearchParams(searchParams);
      next.delete("status");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const paramInspectionId = Number(searchParams.get("inspection"));

  /** Inspeção aberta no modal: a clicada na tabela ou a indicada na URL. */
  const detailId =
    clickedDetailId ??
    (Number.isFinite(paramInspectionId) && paramInspectionId > 0
      ? paramInspectionId
      : null);

  /** Fecha o modal de detalhe e limpa a inspection da URL. */
  const closeDetail = () => {
    setClickedDetailId(null);
    if (searchParams.has("inspection")) {
      const next = new URLSearchParams(searchParams);
      next.delete("inspection");
      setSearchParams(next, { replace: true });
    }
  };

  /** Modais de renovar e desativar, abertos pelas ações da linha com a própria inspeção da lista. */
  const { openRenew, openDeactivate, actionModals } = useInspectionRowActions({
    onOpenDetail: setClickedDetailId,
  });

  /** Campos de texto passam por debounce para não consultar a API a cada tecla. */
  const debouncedSearch = useDebouncedValue(filters.search, 400);
  const debouncedManufacturer = useDebouncedValue(filters.manufacturer, 400);
  const debouncedModel = useDebouncedValue(filters.model, 400);

  /** Filtros enviados à API, com os campos de texto já com debounce. */
  const queryFilters: InspectionListFilters = {
    ...filters,
    search: debouncedSearch,
    manufacturer: debouncedManufacturer,
    model: debouncedModel,
  };

  /** Página de inspeções; mantém a anterior na tela enquanto a nova carrega. */
  const { data, isLoading } = useQuery({
    queryKey: qk.inspectionsList({
      ...queryFilters,
      page,
      pageSize,
      sortBy,
      sortDir,
    }),
    queryFn: () =>
      listAllInspections(queryFilters, page, pageSize, sortBy, sortDir),
    placeholderData: (prev) => prev,
  });

  /** Restaura a rolagem da lista ao voltar para a tela, depois que os dados carregam. */
  useScrollRestoration("inspections-list.scrollY", !isLoading);

  const items = data?.content ?? [];
  const total = data?.page.totalElements ?? 0;

  /** Indica se há algum filtro aplicado, o que habilita "Limpar" e muda a mensagem de lista vazia. */
  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.status !== "" ||
    filters.serviceTypeId !== "" ||
    filters.manufacturer.trim() !== "" ||
    filters.model.trim() !== "";

  /** Atualiza um filtro e volta para a primeira página. */
  function setFilter<K extends keyof InspectionListFilters>(
    key: K,
    value: InspectionListFilters[K],
  ) {
    setFilters((p) => ({ ...p, [key]: value }));
    setPage(1);
  }

  /** Restaura os filtros iniciais e volta para a primeira página. */
  function clearFilters() {
    setFilters(INITIAL_INSPECTION_FILTERS);
    setPage(1);
  }

  /** Ordena pela coluna; clicar de novo na mesma alterna asc/desc. */
  function handleSort(column: InspectionSortableColumn) {
    setSortDir((prev) =>
      sortBy === column ? (prev === "asc" ? "desc" : "asc") : "asc",
    );
    setSortBy(column);
    setPage(1);
  }

  return (
    <Stack>
      <PageHeader
        items={breadcrumbMap[paths.inspections]}
        subtitle={t("inspections.description")}
      />
      <InspectionsFilters
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onChange={setFilter}
        onClear={clearFilters}
        onAddInspection={() => setIsAddOpen(true)}
      />
      <InspectionsTable
        items={items}
        isLoading={isLoading}
        hasActiveFilters={hasActiveFilters}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={handleSort}
        onOpenDetail={setClickedDetailId}
        onRenew={openRenew}
        onDeactivate={openDeactivate}
      />
      {/** Modal para criação de inspeção. */}
      <AddInspectionModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onOpenDetail={setClickedDetailId}
      />
      {/** Modais de renovar e desativar. */}
      {actionModals}
      {/** Modal para os detalhes da inspeção, com edição, documentos e exclusão. */}
      <InspectionDetailModal
        inspectionId={detailId}
        open={detailId !== null}
        onClose={closeDetail}
      />
      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </Stack>
  );
}
