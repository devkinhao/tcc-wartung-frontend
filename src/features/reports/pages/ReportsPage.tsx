import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useTranslation } from "react-i18next";

import { useNotify } from "@/hooks/useNotify";
import { useCities } from "@/features/customers/hooks/useCities";
import {
  generateCompanyReport,
  generateExpiringInspectionsReport,
  generateOverdueInspectionsReport,
  type CompanyReportFilters,
} from "../api/reports.api";

// Selos ABVTEX disponíveis — ordem lógica do menor para o maior
const ABVTEX_SEALS = ["NAO_POSSUI", "COBRE", "BRONZE", "PRATA", "OURO"] as const;

export default function ReportsPage() {
  const { t } = useTranslation();
  const notify = useNotify();
  const cities = useCities();

  // Filtros do Relatório 1
  const [filters, setFilters] = useState<{
    isCustomer: "" | "true" | "false";
    abvtexSeal: string;
    city: string;
  }>({ isCustomer: "", abvtexSeal: "", city: "" });

  // Loading e erro independentes por relatório
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  async function handleGenerate(reportId: string, fn: () => Promise<void>) {
    setLoading((p) => ({ ...p, [reportId]: true }));
    try {
      await fn();
    } catch (e) {
      notify.fromError(e);
    } finally {
      setLoading((p) => ({ ...p, [reportId]: false }));
    }
  }

  function buildCompanyFilters(): CompanyReportFilters {
    return {
      isCustomer:
        filters.isCustomer === "true"
          ? true
          : filters.isCustomer === "false"
          ? false
          : null,
      abvtexSeal: filters.abvtexSeal || null,
      city:       filters.city       || null,
    };
  }

  const cardSx = {
    borderRadius: 2,
    transition: (th: any) =>
      th.transitions.create("box-shadow", { duration: th.transitions.duration.short }),
    "&:hover": { boxShadow: 4 },
  } as const;

  return (
    <Paper
      elevation={1}
      sx={{ maxWidth: 760, p: 3, borderRadius: 2, bgcolor: "background.paper" }}
    >
      <Typography variant="h6" fontWeight={600} color="primary.main" sx={{ mb: 0.5 }}>
        {t("reports.title")}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("reports.description")}
      </Typography>

      <Stack spacing={2.5}>

        {/* ── Relatório 1 — Empresas ──────────────────────────────────── */}
        <Card sx={cardSx}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
              {t("reports.items.companies.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              {t("reports.items.companies.description")}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            {/* Filtros */}
            <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ mb: 1, display: "block" }}>
              {t("reports.filters.title")}
            </Typography>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap">
              {/* Tipo de empresa */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>{t("reports.filters.isCustomer.label")}</InputLabel>
                <Select
                  label={t("reports.filters.isCustomer.label")}
                  value={filters.isCustomer}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, isCustomer: e.target.value as typeof filters.isCustomer }))
                  }
                >
                  <MenuItem value="">{t("reports.filters.isCustomer.all")}</MenuItem>
                  <MenuItem value="true">{t("reports.filters.isCustomer.customersOnly")}</MenuItem>
                  <MenuItem value="false">{t("reports.filters.isCustomer.nonCustomersOnly")}</MenuItem>
                </Select>
              </FormControl>

              {/* Selo ABVTEX */}
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>{t("reports.filters.abvtexSeal.label")}</InputLabel>
                <Select
                  label={t("reports.filters.abvtexSeal.label")}
                  value={filters.abvtexSeal}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, abvtexSeal: e.target.value }))
                  }
                >
                  <MenuItem value="">{t("reports.filters.abvtexSeal.all")}</MenuItem>
                  {ABVTEX_SEALS.map((seal) => (
                    <MenuItem key={seal} value={seal}>
                      {t(`reports.filters.abvtexSeal.${seal}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Cidade */}
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>{t("reports.filters.city.label")}</InputLabel>
                <Select
                  label={t("reports.filters.city.label")}
                  value={filters.city}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, city: e.target.value }))
                  }
                >
                  <MenuItem value="">{t("reports.filters.city.all")}</MenuItem>
                  {cities.map((c) => (
                    <MenuItem key={c.id} value={c.name}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={
                  loading.companies
                    ? <CircularProgress size={16} color="inherit" />
                    : <PictureAsPdfIcon />
                }
                disabled={loading.companies}
                onClick={() =>
                  handleGenerate("companies", () =>
                    generateCompanyReport(buildCompanyFilters())
                  )
                }
              >
                {loading.companies
                  ? t("reports.actions.generating")
                  : t("reports.actions.generate")}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* ── Relatório 2 — Vencimentos por mês e cliente ─────────────── */}
        <Card sx={cardSx}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
              {t("reports.items.expiringInspections.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              {t("reports.items.expiringInspections.description")}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={
                  loading.expiring
                    ? <CircularProgress size={16} color="inherit" />
                    : <PictureAsPdfIcon />
                }
                disabled={loading.expiring}
                onClick={() =>
                  handleGenerate("expiring", generateExpiringInspectionsReport)
                }
              >
                {loading.expiring
                  ? t("reports.actions.generating")
                  : t("reports.actions.generate")}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* ── Relatório 3 — Inspeções vencidas ────────────────────────── */}
        <Card sx={cardSx}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary">
              {t("reports.items.overdueInspections.title")}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
              {t("reports.items.overdueInspections.description")}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                startIcon={
                  loading.overdue
                    ? <CircularProgress size={16} color="inherit" />
                    : <PictureAsPdfIcon />
                }
                disabled={loading.overdue}
                onClick={() =>
                  handleGenerate("overdue", generateOverdueInspectionsReport)
                }
              >
                {loading.overdue
                  ? t("reports.actions.generating")
                  : t("reports.actions.generate")}
              </Button>
            </Box>
          </CardContent>
        </Card>

      </Stack>
    </Paper>
  );
}
