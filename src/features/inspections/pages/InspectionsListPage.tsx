import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { qk } from "@/api/keys";
import { Pagination } from "@/components/Pagination";
import { addDaysISODate, formatDateBR, todayISODate } from "@/utils/date";
import { useAlertDays } from "@/features/configurations/hooks/useAlertDays";
import { AddInspectionModal } from "../components/AddInspectionModal";
import {
  listAllInspections,
  type InspectionListFilters,
  type InspectionSortableColumn,
  type InspectionStatus,
} from "../api/inspections.list.api";

const INITIAL_FILTERS: InspectionListFilters = { status: "", search: "" };

type SortableHeaderProps = {
  label: string;
  column: InspectionSortableColumn;
  sortBy: InspectionSortableColumn | null;
  sortDir: "asc" | "desc";
  onSort: (c: InspectionSortableColumn) => void;
  align?: "left" | "center" | "right";
  width?: string;
};

function SortableHeader({ label, column, sortBy, sortDir, onSort, align = "left", width }: SortableHeaderProps) {
  const active = sortBy === column;
  return (
    <TableCell
      align={align}
      onClick={() => onSort(column)}
      sx={{
        cursor: "pointer",
        userSelect: "none",
        width,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      <TableSortLabel
        active={active}
        direction={active ? sortDir : "asc"}
        sx={{
          position: "relative",
          "& .MuiTableSortLabel-icon": {
            position: "absolute",
            left: "100%",
            marginLeft: "4px",
          },
        }}
      >
        <b>{label}</b>
      </TableSortLabel>
    </TableCell>
  );
}

type InspectionRowStatus = "expired" | "near" | "ok";

function getInspectionRowStatus(expirationDate: string, alertDays: number): InspectionRowStatus {
  // Comparação por string yyyy-mm-dd (ordem lexicográfica == ordem cronológica),
  // igual à semântica de LocalDate no backend — evita bugs de fuso horário que
  // surgiriam ao usar objetos Date (new Date(isoString) interpreta como UTC).
  const exp            = expirationDate.split("T")[0];
  const today           = todayISODate();
  const alertThreshold  = addDaysISODate(today, alertDays);

  if (exp < today)           return "expired";
  if (exp <= alertThreshold) return "near";
  return "ok";
}

export default function InspectionsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [filters, setFilters]   = useState<InspectionListFilters>(INITIAL_FILTERS);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [sortBy, setSortBy] = useState<InspectionSortableColumn | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuRowId, setMenuRowId] = useState<number | null>(null);

  function closeRowMenu() {
    setMenuAnchor(null);
    setMenuRowId(null);
  }

  const { data, isLoading } = useQuery({
    queryKey: qk.inspectionsList({ ...filters, page, pageSize, sortBy, sortDir }),
    queryFn:  () => listAllInspections(filters, page, pageSize, sortBy, sortDir),
    placeholderData: (prev) => prev,
  });

  const alertDays = useAlertDays();

  const items = data?.content ?? [];
  const total = data?.page.totalElements ?? 0;

  function setFilter<K extends keyof InspectionListFilters>(key: K, value: InspectionListFilters[K]) {
    setFilters((p) => ({ ...p, [key]: value }));
    setPage(1);
  }

  function handleSort(column: InspectionSortableColumn) {
    setSortDir((prev) => (sortBy === column ? (prev === "asc" ? "desc" : "asc") : "asc"));
    setSortBy(column);
    setPage(1);
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600} color="primary.main">
            {t("inspections.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("inspections.description")}
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddOpen(true)}>
          {t("inspections.actions.addInspection")}
        </Button>
      </Stack>

      <AddInspectionModal open={isAddOpen} onClose={() => setIsAddOpen(false)} />

      {/* Filtros */}
      <Card variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
          <TextField
            size="small"
            label={t("inspections.filters.search")}
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            sx={{ minWidth: 300 }}
          />

          <FormControl size="small" sx={{ minWidth: 220 }}>
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
        </Stack>
      </Card>

      {/* Tabela */}
      <Box sx={{ border: (th) => `1px solid ${th.palette.divider}`, borderRadius: 2, overflow: "hidden", bgcolor: "background.paper" }}>
        <Table size="small" sx={{ tableLayout: "fixed" }}>
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              <SortableHeader label={t("inspections.table.inspectionDate")} column="inspectionDate" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} align="center" width="15%" />
              <SortableHeader label={t("inspections.table.service")} column="serviceType.name" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} width="15%" />
              <TableCell sx={{ width: "29%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("inspections.table.notes")}</b></TableCell>
              <SortableHeader label={t("inspections.table.customer")} column="customer.legalName" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} width="26%" />
              <SortableHeader label={t("inspections.table.expirationDate")} column="expirationDate" sortBy={sortBy} sortDir={sortDir} onSort={handleSort} width="12%" />
              <TableCell align="right" sx={{ width: "5%" }} />
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
              const status = getInspectionRowStatus(item.expirationDate, alertDays);
              const statusColor =
                status === "expired" ? "#c65b4a" : status === "near" ? "#e0a83f" : null;
              return (
                <TableRow
                  key={item.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/inspections/${item.id}`)}
                >
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
                    {statusColor ? (
                      <Chip
                        size="small"
                        label={formatDateBR(item.expirationDate)}
                        sx={{
                          bgcolor: statusColor,
                          color: status === "expired" ? "#fff" : "#000",
                          fontWeight: 600,
                        }}
                      />
                    ) : (
                      formatDateBR(item.expirationDate)
                    )}
                  </TableCell>
                  <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      aria-label="Ações"
                      onClick={(e) => {
                        setMenuAnchor(e.currentTarget);
                        setMenuRowId(item.id);
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeRowMenu}>
        <MenuItem onClick={closeRowMenu}>Teste</MenuItem>
      </Menu>

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
    </Paper>
  );
}
