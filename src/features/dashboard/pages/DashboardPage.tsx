import { Box, Grid } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { qk } from "@/api/keys";
import { useAlertDays } from "@/features/configurations/hooks/useAlertDays";
import { PageHeader } from "@/layout/header/PageHeader";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { paths } from "@/routes/paths";
import { getDashboard } from "../api/dashboard.api";
import { InspectionStatusCards } from "../components/InspectionStatusCards";
import { CompanyCountsCard } from "../components/CompanyCountsCard";
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
      <PageHeader items={breadcrumbMap[paths.dashboard]} subtitle={t("dashboard.description")} />

      <Grid container spacing={2.5}>

        {/* ── Linha 1: Status das inspeções + contagem de empresas (metade cada) ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <InspectionStatusCards
            data={data?.inspectionStatus}
            loading={isLoading}
            alertDays={alertDays}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <CompanyCountsCard data={data?.companyCounts} loading={isLoading} />
        </Grid>

        {/* ── Linha 2: Vencimentos por mês (full width) ── */}
        <Grid size={{ xs: 12 }}>
          <ExpirationsByMonthChart
            data={data?.expirationsByMonth}
            loading={isLoading}
          />
        </Grid>

        {/* ── Linha 3: Serviços (7/12) + Clientes por cidade (5/12) ── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <ServiceRankingChart
            data={data?.serviceRanking}
            loading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <CustomersByCityChart
            data={data?.customersByCity}
            loading={isLoading}
          />
        </Grid>

      </Grid>
    </Box>
  );
}
