import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
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
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { qk } from "@/api/keys";
import { Pagination } from "@/components/Pagination";
import { formatDateBR } from "@/utils/date";
import { listAllInspections, type InspectionListFilters, type InspectionStatus } from "../api/inspections.list.api";

const INITIAL_FILTERS: InspectionListFilters = { status: "", search: "" };

function StatusChip({ expirationDate }: { expirationDate: string }) {
  const { t } = useTranslation();
  const today = new Date();
  const exp   = new Date(expirationDate);
  const in30  = new Date(today);
  in30.setDate(in30.getDate() + 30);

  if (exp < today)  return <Chip size="small" label={t("inspections.status.expired")}        color="error"   />;
  if (exp <= in30)  return <Chip size="small" label={t("inspections.status.nearExpiration")}  color="warning" />;
  return              <Chip size="small" label={t("inspections.status.onTrack")}              color="success" variant="outlined" />;
}

export default function InspectionsListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [filters, setFilters]   = useState<InspectionListFilters>(INITIAL_FILTERS);
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: qk.inspectionsList({ ...filters, page, pageSize }),
    queryFn:  () => listAllInspections(filters, page, pageSize),
    placeholderData: (prev) => prev,
  });

  const items = data?.content ?? [];
  const total = data?.page.totalElements ?? 0;

  function setFilter<K extends keyof InspectionListFilters>(key: K, value: InspectionListFilters[K]) {
    setFilters((p) => ({ ...p, [key]: value }));
    setPage(1);
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}>
      <Typography variant="h6" fontWeight={600} color="primary.main" sx={{ mb: 0.5 }}>
        {t("inspections.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("inspections.description")}
      </Typography>

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
              <MenuItem value="near">{t("inspections.status.nearExpiration")}</MenuItem>
              <MenuItem value="ok">{t("inspections.status.onTrack")}</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      {/* Tabela */}
      <Box sx={{ border: (th) => `1px solid ${th.palette.divider}`, borderRadius: 2, overflow: "hidden", bgcolor: "background.paper" }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              <TableCell><b>{t("inspections.table.customer")}</b></TableCell>
              <TableCell><b>{t("inspections.table.service")}</b></TableCell>
              <TableCell><b>{t("inspections.table.inspectionDate")}</b></TableCell>
              <TableCell><b>{t("inspections.table.expirationDate")}</b></TableCell>
              <TableCell align="center"><b>{t("inspections.table.status")}</b></TableCell>
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
                <TableCell>{item.customerLegalName}</TableCell>
                <TableCell>{item.serviceTypeName}</TableCell>
                <TableCell>{formatDateBR(item.inspectionDate)}</TableCell>
                <TableCell>{formatDateBR(item.expirationDate)}</TableCell>
                <TableCell align="center">
                  <StatusChip expirationDate={item.expirationDate} />
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
