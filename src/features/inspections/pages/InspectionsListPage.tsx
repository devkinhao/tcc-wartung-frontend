import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { qk } from "@/api/keys";
import { Pagination } from "@/components/Pagination";
import { SortableHeader } from "@/components/SortableHeader";
import { ExpirationChip } from "@/components/ExpirationChip";
import { DataTableContainer } from "@/components/DataTableContainer";
import { useSessionStorageState } from "@/hooks/useSessionStorageState";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { saveScrollPosition, useScrollRestoration } from "@/hooks/useScrollRestoration";
import { formatDateBR } from "@/utils/date";
import { useAlertDays } from "@/features/configurations/hooks/useAlertDays";
import { Breadcrumb } from "@/layout/header/Breadcrumb";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { AddInspectionModal } from "../components/AddInspectionModal";
import { RenewInspectionModal, type RenewableInspection } from "../components/RenewInspectionModal";
import { DeactivateInspectionModal, type DeactivatableInspection } from "../components/DeactivateInspectionModal";
import { InspectionRowActions } from "../components/InspectionRowActions";
import {
  listAllInspections,
  type InspectionListFilters,
  type InspectionListItem,
  type InspectionSortableColumn,
  type InspectionStatus,
} from "../api/inspections.list.api";
import { paths } from "@/routes/paths";

const VALID_STATUSES: InspectionStatus[] = ["expired", "near", "ok"];

const INITIAL_FILTERS: InspectionListFilters = { status: "", search: "" };

export default function InspectionsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const alertDays = useAlertDays();

  const [filters, setFilters]   = useSessionStorageState<InspectionListFilters>("inspections-list.filters", INITIAL_FILTERS);
  const [page, setPage]         = useSessionStorageState("inspections-list.page", 1);
  const [pageSize, setPageSize] = useSessionStorageState("inspections-list.pageSize", 10);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [renewTarget, setRenewTarget] = useState<RenewableInspection | null>(null);
  const [deactivateTarget, setDeactivateTarget] = useState<DeactivatableInspection | null>(null);
  const [sortBy, setSortBy] = useSessionStorageState<InspectionSortableColumn | null>("inspections-list.sortBy", null);
  const [sortDir, setSortDir] = useSessionStorageState<"asc" | "desc">("inspections-list.sortDir", "asc");

  // Permite abrir a lista já filtrada por um link externo (ex: cartões da tela
  // inicial → /inspections?status=expired). Consome o parâmetro na chegada.
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const urlStatus = searchParams.get("status");
    if (urlStatus && (VALID_STATUSES as string[]).includes(urlStatus)) {
      setFilters((p) => ({ ...p, status: urlStatus as InspectionStatus }));
      setPage(1);
      const next = new URLSearchParams(searchParams);
      next.delete("status");
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const debouncedSearch = useDebouncedValue(filters.search, 400);
  const queryFilters = { ...filters, search: debouncedSearch };

  const { data, isLoading } = useQuery({
    queryKey: qk.inspectionsList({ ...queryFilters, page, pageSize, sortBy, sortDir }),
    queryFn:  () => listAllInspections(queryFilters, page, pageSize, sortBy, sortDir),
    placeholderData: (prev) => prev,
  });

  useScrollRestoration("inspections-list.scrollY", !isLoading);

  const items = data?.content ?? [];
  const total = data?.page.totalElements ?? 0;
  const hasActiveFilters = filters.search.trim() !== "" || filters.status !== "";

  function setStatus(status: InspectionStatus | "") {
    setFilters((p) => ({ ...p, status }));
    setPage(1);
  }

  function setSearch(search: string) {
    setFilters((p) => ({ ...p, search }));
    setPage(1);
  }

  function handleSort(column: InspectionSortableColumn) {
    setSortDir((prev) => (sortBy === column ? (prev === "asc" ? "desc" : "asc") : "asc"));
    setSortBy(column);
    setPage(1);
  }

  const openDetails = (id: number) => {
    saveScrollPosition("inspections-list.scrollY");
    navigate(paths.inspectionDetails(id));
  };

  const openRenew = (item: InspectionListItem) =>
    setRenewTarget({
      id: item.id,
      inspectionDate: item.inspectionDate,
      expirationDate: item.expirationDate,
      customerLegalName: item.customerLegalName,
      serviceTypeName: item.serviceTypeName,
    });

  const openDeactivate = (item: InspectionListItem) =>
    setDeactivateTarget({
      id: item.id,
      serviceTypeName: item.serviceTypeName,
      customerLegalName: item.customerLegalName,
    });

  const STATUS_OPTIONS: { value: InspectionStatus | ""; label: string }[] = [
    { value: "", label: t("inspections.filters.statusAll") },
    { value: "expired", label: t("inspections.filters.statusExpired") },
    { value: "near", label: t("inspections.filters.statusNear") },
    { value: "ok", label: t("inspections.filters.statusOk") },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Breadcrumb items={breadcrumbMap[paths.inspections]} size="large" />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {t("inspections.description")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddOpen(true)}
          sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
        >
          {t("inspections.actions.addInspection")}
        </Button>
      </Stack>

      <AddInspectionModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <RenewInspectionModal
        open={renewTarget !== null}
        inspection={renewTarget}
        onClose={() => setRenewTarget(null)}
      />
      <DeactivateInspectionModal
        open={deactivateTarget !== null}
        inspection={deactivateTarget}
        onClose={() => setDeactivateTarget(null)}
      />

      {/* Filtros */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ sm: "center" }}
        flexWrap="wrap"
        useFlexGap
        sx={{ mb: 2 }}
      >
        <TextField
          size="small"
          label={t("inspections.filters.search")}
          value={filters.search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: { xs: "100%", sm: 240 }, flex: { sm: 1 }, maxWidth: { sm: 340 } }}
        />

        <ToggleButtonGroup
          size="small"
          exclusive
          value={filters.status}
          onChange={(_, value) => setStatus(value ?? "")}
          sx={{
            maxWidth: "100%",
            overflowX: "auto",
            flexShrink: 0,
            "& .MuiToggleButton-root": { textTransform: "none", px: 1.5, whiteSpace: "nowrap" },
            "& .Mui-selected": {
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": { bgcolor: "primary.dark" },
            },
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <ToggleButton key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Stack>

      {/* Tabela */}
      <DataTableContainer>
        <TableHead sx={{ bgcolor: "background.default" }}>
          <TableRow>
            <SortableHeader label={t("inspections.table.inspectionDate")} column="inspectionDate" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} align="center" width="14%" />
            <SortableHeader label={t("inspections.table.service")} column="serviceType.name" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} width="25%" />
            <SortableHeader label={t("inspections.table.customer")} column="customer.legalName" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} width="35%" />
            <SortableHeader label={t("inspections.table.expirationDate")} column="expirationDate" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} align="center" width="12%" />
            <TableCell align="center" sx={{ width: "14%" }}><b>{t("inspections.table.actions")}</b></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">{t("common.loading")}</Typography>
                </Stack>
              </TableCell>
            </TableRow>
          ) : items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                {hasActiveFilters ? (
                  <Typography variant="body2" color="text.secondary">
                    {t("inspections.emptyFiltered")}
                  </Typography>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      {t("inspections.empty")}
                    </Typography>
                    <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={() => setIsAddOpen(true)}>
                      {t("inspections.actions.addInspection")}
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow
                key={item.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => openDetails(item.id)}
              >
                <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{formatDateBR(item.inspectionDate)}</TableCell>
                <TableCell sx={{ overflow: "hidden" }}>
                  <Typography variant="body2" noWrap title={item.serviceTypeName}>
                    {item.serviceTypeName}
                  </Typography>
                  {item.notes ? (
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }} title={item.notes}>
                      {item.notes}
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell sx={{ overflow: "hidden" }}>
                  <Typography variant="body2" noWrap title={item.customerLegalName}>
                    {item.customerLegalName}
                  </Typography>
                  {item.customerCity ? (
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                      {item.customerCity}
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <ExpirationChip date={item.expirationDate} alertDays={alertDays} />
                </TableCell>
                <TableCell align="right">
                  <InspectionRowActions item={item} onRenew={openRenew} onDeactivate={openDeactivate} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </DataTableContainer>

      <Box sx={{ mt: 1 }}>
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
      </Box>
    </Box>
  );
}
