import { Box, Grid, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { qk } from "@/api/keys";
import { useAlertDays } from "@/features/configurations/hooks/useAlertDays";
import { Breadcrumb } from "@/layout/header/Breadcrumb";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { paths } from "@/routes/paths";
import { getDashboard } from "../api/dashboard.api";
import { InspectionStatusCards } from "../components/InspectionStatusCards";
import { ExpirationsByMonthChart } from "../components/ExpirationsByMonthChart";
import { ServiceRankingChart } from "../components/ServiceRankingChart";
import { CustomersByCityChart } from "../components/CustomersByCityChart";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useQuery({
    queryKey: qk.dashboard(),
    queryFn: getDashboard,
    staleTime: 1000 * 60 * 5, // 5 min — dados analíticos não mudam a cada segundo
  });

  const alertDays = useAlertDays();

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumb items={breadcrumbMap[paths.dashboard]} size="large" />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          {t("dashboard.description")}
        </Typography>
      </Box>

      <Grid container spacing={2.5}>

        {/* ── Linha 1: Status das inspeções (full width) ── */}
        <Grid item xs={12}>
          <InspectionStatusCards
            data={data?.inspectionStatus}
            loading={isLoading}
            alertDays={alertDays}
          />
        </Grid>

        {/* ── Linha 2: Vencimentos por mês (full width) ── */}
        <Grid item xs={12}>
          <ExpirationsByMonthChart
            data={data?.expirationsByMonth}
            loading={isLoading}
          />
        </Grid>

        {/* ── Linha 3: Serviços (7/12) + Clientes por cidade (5/12) ── */}
        <Grid item xs={12} md={7}>
          <ServiceRankingChart
            data={data?.serviceRanking}
            loading={isLoading}
          />
        </Grid>

        <Grid item xs={12} md={5}>
          <CustomersByCityChart
            data={data?.customersByCity}
            loading={isLoading}
          />
        </Grid>

      </Grid>
    </Box>
  );
}
