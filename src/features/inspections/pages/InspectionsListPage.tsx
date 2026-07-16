import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { qk } from "@/api/keys";
import { Pagination } from "@/components/Pagination";
import { SortableHeader } from "@/components/SortableHeader";
import { ExpirationChip } from "@/components/ExpirationChip";
import { DataTableContainer } from "@/components/DataTableContainer";
import { useSessionStorageState } from "@/hooks/useSessionStorageState";
import { saveScrollPosition, useScrollRestoration } from "@/hooks/useScrollRestoration";
import { formatDateBR } from "@/utils/date";
import { useAlertDays } from "@/features/configurations/hooks/useAlertDays";
import { Breadcrumb } from "@/layout/header/Breadcrumb";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { AddInspectionModal } from "../components/AddInspectionModal";
import {
  listAllInspections,
  type InspectionListFilters,
  type InspectionSortableColumn,
  type InspectionStatus,
} from "../api/inspections.list.api";
import { paths } from "@/routes/paths";

const INITIAL_FILTERS: InspectionListFilters = { status: "", search: "" };

export default function InspectionsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [filters, setFilters]   = useSessionStorageState<InspectionListFilters>("inspections-list.filters", INITIAL_FILTERS);
  const [page, setPage]         = useSessionStorageState("inspections-list.page", 1);
  const [pageSize, setPageSize] = useSessionStorageState("inspections-list.pageSize", 10);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [sortBy, setSortBy] = useSessionStorageState<InspectionSortableColumn | null>("inspections-list.sortBy", null);
  const [sortDir, setSortDir] = useSessionStorageState<"asc" | "desc">("inspections-list.sortDir", "asc");

  const { data, isLoading } = useQuery({
    queryKey: qk.inspectionsList({ ...filters, page, pageSize, sortBy, sortDir }),
    queryFn:  () => listAllInspections(filters, page, pageSize, sortBy, sortDir),
    placeholderData: (prev) => prev,
  });

  const alertDays = useAlertDays();

  useScrollRestoration("inspections-list.scrollY", !isLoading);

  const items = data?.content ?? [];
  const total = data?.page.totalElements ?? 0;

  function setFilter<K extends keyof InspectionListFilters>(key: K, value: InspectionListFilters[K]) {
    setFilters((p) => ({ ...p, [key]: value }));
    setPage(1);
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  }

  const hasActiveFilters = Object.values(filters).some(Boolean);

  function handleSort(column: InspectionSortableColumn) {
    setSortDir((prev) => (sortBy === column ? (prev === "asc" ? "desc" : "asc") : "asc"));
    setSortBy(column);
    setPage(1);
  }

  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        <Breadcrumb items={breadcrumbMap[paths.inspections]} size="large" />
        <Typography variant="body2" color="text.secondary">
          {t("inspections.description")}
        </Typography>
      </Box>

      <AddInspectionModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />

      {/* Filtros */}
      <Box sx={{ mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
          flexWrap="wrap"
          sx={{
            // Deixa a altura dos campos igual à dos botões ao lado (36.5px)
            "& .MuiOutlinedInput-input": { paddingTop: "6.75px", paddingBottom: "6.75px" },
          }}
        >
          <TextField
            size="small"
            label={t("inspections.filters.search")}
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            sx={{ minWidth: { xs: "100%", md: 240 } }}
          />

          <FormControl size="small" sx={{ width: { xs: "100%", md: 280 } }}>
            <InputLabel>{t("inspections.filters.status")}</InputLabel>
            <Select
              label={t("inspections.filters.status")}
              value={filters.status}
              onChange={(e) => setFilter("status", e.target.value as InspectionStatus | "")}
            >
              <MenuItem value="">{t("inspections.filters.allStatuses")}</MenuItem>
              <MenuItem value="expired">{t("inspections.status.expired")}</MenuItem>
              <MenuItem value="near">{t("inspections.status.nearExpiration", { days: alertDays })}</MenuItem>
              <MenuItem value="ok">{t("inspections.status.onTrack")}</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="text"
            startIcon={<FilterAltOffIcon />}
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            {t("inspections.filters.clear")}
          </Button>

          <Box sx={{ flex: 1 }} />

          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddOpen(true)}>
            {t("inspections.actions.addInspection")}
          </Button>
        </Stack>
      </Box>

      {/* Tabela */}
      <DataTableContainer>
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              <SortableHeader label={t("inspections.table.inspectionDate")} column="inspectionDate" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} align="center" width="15%" />
              <SortableHeader label={t("inspections.table.service")} column="serviceType.name" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} width="15%" />
              <TableCell sx={{ width: "29%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("inspections.table.notes")}</b></TableCell>
              <SortableHeader label={t("inspections.table.customer")} column="customer.legalName" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} width="26%" />
              <SortableHeader label={t("inspections.table.expirationDate")} column="expirationDate" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} width="12%" />
              <TableCell align="center" sx={{ width: "5%" }}><b>{t("inspections.table.actions")}</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center">
                    <CircularProgress size={18} />
                    <Typography variant="body2" color="text.secondary">
                      {t("common.loading")}
                    </Typography>
                  </Stack>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t("inspections.empty")}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : items.map((item) => {
              return (
                <TableRow key={item.id}>
                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{formatDateBR(item.inspectionDate)}</TableCell>
                  <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.serviceTypeName}>
                    {item.serviceTypeName}
                  </TableCell>
                  <TableCell
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      color: "text.secondary",
                    }}
                    title={item.notes ?? ""}
                  >
                    {item.notes || "—"}
                  </TableCell>
                  <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.customerLegalName}>
                    {item.customerLegalName}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <ExpirationChip date={item.expirationDate} alertDays={alertDays} />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={t("inspections.rowActions.view")}>
                      <IconButton
                        size="small"
                        aria-label={t("inspections.rowActions.view")}
                        onClick={() => {
                          saveScrollPosition("inspections-list.scrollY");
                          navigate(paths.inspectionDetails(item.id));
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })}
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
