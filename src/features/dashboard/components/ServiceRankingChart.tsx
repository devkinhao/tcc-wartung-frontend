import { Box, Skeleton, Typography } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import type { ServiceRankingItem } from "../api/dashboard.api";
import { typography } from "@/styles/typography";
import { DashboardCard } from "./chart/DashboardCard";
import { ChartTooltip } from "./chart/ChartTooltip";
import { getChartPalette } from "./chart/chartPalette";

type Props = {
  data: ServiceRankingItem[] | undefined;
  loading: boolean;
};

export function ServiceRankingChart({ data, loading }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  if (loading || !data) {
    return <Skeleton variant="rounded" height={320} />;
  }

  const hasData = data.length > 0;
  const palette = getChartPalette(theme.palette.mode);

  // Trunca nomes longos no eixo Y para não quebrar o layout
  const series = data.map((d) => ({
    ...d,
    shortName: d.serviceName.length > 22 ? d.serviceName.slice(0, 21) + "…" : d.serviceName,
  }));

  return (
    <DashboardCard title={t("dashboard.cards.topRequestedServices.title")}>
      {!hasData ? (
        <Box sx={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {t("dashboard.empty")}
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer width="100%" height={260} minWidth={0} debounce={350}>
          <BarChart
            accessibilityLayer={false}
            data={series}
            layout="vertical"
            barCategoryGap="30%"
            margin={{ left: 8, right: 16 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
              horizontal={false}
            />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: typography.size.chartTick, fill: theme.palette.text.secondary }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              width={130}
              tick={{ fontSize: typography.size.chartTick, fill: theme.palette.text.secondary }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: theme.palette.action.hover }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const item = payload[0].payload as ServiceRankingItem;
                return (
                  <ChartTooltip
                    label={item.serviceName}
                    value={payload[0].value}
                    unit={t("dashboard.cards.topRequestedServices.tooltipLabel")}
                  />
                );
              }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={32}>
              {series.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </DashboardCard>
  );
}
