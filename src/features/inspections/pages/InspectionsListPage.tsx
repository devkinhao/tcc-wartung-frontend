import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { qk } from "@/api/keys";
import { Pagination } from "@/components/Pagination";
import { addDaysISODate, formatDateBR, todayISODate } from "@/utils/date";
import { useAlertDays } from "@/features/configurations/hooks/useAlertDays";
import { AddInspectionModal } from "../components/AddInspectionModal";
import { listAllInspections, type InspectionListFilters, type InspectionStatus } from "../api/inspections.list.api";

const INITIAL_FILTERS: InspectionListFilters = { status: "", search: "" };

function StatusChip({ expirationDate, alertDays }: { expirationDate: string; alertDays: number }) {
  const { t } = useTranslation();
  // Comparação por string yyyy-mm-dd (ordem lexicográfica == ordem cronológica),
  // igual à semântica de LocalDate no backend — evita bugs de fuso horário que
  // surgiriam ao usar objetos Date (new Date(isoString) interpreta como UTC).
  const exp            = expirationDate.split("T")[0];
  const today           = todayISODate();
  const alertThreshold  = addDaysISODate(today, alertDays);

  if (exp < today)              return <Chip size="small" label={t("inspections.status.expired")}                          color="error"   />;
  if (exp <= alertThreshold)    return <Chip size="small" label={t("inspections.status.nearExpiration", { days: alertDays })} color="warning" />;
  return                        <Chip size="small" label={t("inspections.status.onTrack")}                                color="success" variant="outlined" />;
}

export default function InspectionsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [filters, setFilters]   = useState<InspectionListFilters>(INITIAL_FILTERS);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: qk.inspectionsList({ ...filters, page, pageSize }),
    queryFn:  () => listAllInspections(filters, page, pageSize),
    placeholderData: (prev) => prev,
  });

  const alertDays = useAlertDays();

  const items = data?.content ?? [];
  const total = data?.page.totalElements ?? 0;

  function setFilter<K extends keyof InspectionListFilters>(key: K, value: InspectionListFilters[K]) {
    setFilters((p) => ({ ...p, [key]: value }));
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
              <TableCell sx={{ width: "50%" }}><b>{t("inspections.table.customer")}</b></TableCell>
              <TableCell sx={{ width: "16%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("inspections.table.service")}</b></TableCell>
              <TableCell sx={{ width: "12%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("inspections.table.inspectionDate")}</b></TableCell>
              <TableCell sx={{ width: "12%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("inspections.table.expirationDate")}</b></TableCell>
              <TableCell align="center" sx={{ width: "10%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("inspections.table.status")}</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
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
                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t("inspections.empty")}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : items.map((item) => (
              <TableRow
                key={item.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => navigate(`/inspections/${item.id}`)}
              >
                <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.customerLegalName}>
                  {item.customerLegalName}
                </TableCell>
                <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={item.serviceTypeName}>
                  {item.serviceTypeName}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateBR(item.inspectionDate)}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateBR(item.expirationDate)}</TableCell>
                <TableCell align="center">
                  <StatusChip expirationDate={item.expirationDate} alertDays={alertDays} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

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
