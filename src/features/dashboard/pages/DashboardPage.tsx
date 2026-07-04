import { Box, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { qk } from "@/api/keys";
import { useAlertDays } from "@/features/configurations/hooks/useAlertDays";
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
    <Box sx={{ maxWidth: 1200, width: "100%" }}>
      <Typography variant="h6" fontWeight={600} color="primary.main" sx={{ mb: 3 }}>
        {t("dashboard.title")}
      </Typography>

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
