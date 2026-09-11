import { Box, Skeleton, Typography } from "@mui/material";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import type { CustomersByCityItem } from "../api/dashboard.api";
import { typography } from "@/styles/typography";
import { DashboardCard } from "./chart/DashboardCard";
import { ChartTooltip } from "./chart/ChartTooltip";
import { getChartPalette } from "./chart/chartPalette";
import { useChartRemountKey } from "./chart/useChartRemountKey";

type Props = {
  data: CustomersByCityItem[] | undefined;
  loading: boolean;
};

const MAX_SLICES = 6;

// Agrupa cidades com participação pequena em "Outras" para não poluir o gráfico
function prepareData(raw: CustomersByCityItem[], othersLabel: string): CustomersByCityItem[] {
  if (raw.length <= MAX_SLICES) return raw;
  const top = raw.slice(0, MAX_SLICES);
  const rest = raw.slice(MAX_SLICES).reduce((acc, d) => acc + d.count, 0);
  return [...top, { city: othersLabel, count: rest }];
}

type PieLabelProps = {
  cx?: number | string;
  cy?: number | string;
  midAngle?: number;
  innerRadius?: number | string;
  outerRadius?: number | string;
  percent?: number;
};

// Label da fatia com a porcentagem
function renderPercentLabel(props: PieLabelProps) {
  const share = props.percent ?? 0;
  if (share < 0.05) return null; // fatia muito pequena: não rotula
  const RADIAN = Math.PI / 180;
  const cx = Number(props.cx ?? 0);
  const cy = Number(props.cy ?? 0);
  const innerRadius = Number(props.innerRadius ?? 0);
  const outerRadius = Number(props.outerRadius ?? 0);
  const midAngle = props.midAngle ?? 0;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={typography.size.chartLabel}
      fontWeight={typography.weight.semibold}
    >
      {`${(share * 100).toFixed(0)}%`}
    </text>
  );
}

export function CustomersByCityChart({ data, loading }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const remountKey = useChartRemountKey();

  if (loading || !data) {
    return <Skeleton variant="rounded" height={320} />;
  }

  const hasData = data.length > 0;
  const series = prepareData(data, t("dashboard.cards.customersByCity.others"));
  const palette = getChartPalette(theme.palette.mode);

  return (
    <DashboardCard title={t("dashboard.cards.customersByCity.title")}>
      {!hasData ? (
        <Box sx={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {t("dashboard.empty")}
          </Typography>
        </Box>
      ) : (
        <ResponsiveContainer key={remountKey} width="100%" height={260} minWidth={0} debounce={350}>
          <PieChart accessibilityLayer={false}>
            <Pie
              data={series}
              dataKey="count"
              nameKey="city"
              cx="50%"
              cy="48%"
              outerRadius={95}
              labelLine={false}
              label={renderPercentLabel}
            >
              {series.map((_, i) => (
                <Cell key={i} fill={palette[i % palette.length]} />
              ))}
            </Pie>

            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <ChartTooltip
                    label={payload[0].name}
                    value={payload[0].value}
                    unit={t("dashboard.cards.customersByCity.tooltipLabel")}
                  />
                );
              }}
            />

            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ fontSize: typography.size.chartTick, color: theme.palette.text.secondary }}>
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </DashboardCard>
  );
}
