import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import type { ExpirationByMonth } from "../api/dashboard.api";

type Props = {
  data: ExpirationByMonth[] | undefined;
  loading: boolean;
};

const MONTH_KEYS = [
  "january","february","march","april","may","june",
  "july","august","september","october","november","december",
] as const;

// Preenche os meses sem dados com count=0 para mostrar a série completa
function buildSeries(data: ExpirationByMonth[], t: (k: string) => string) {
  const now = new Date();
  const map = new Map(data.map((d) => [`${d.year}-${d.month}`, d.count]));

  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const key = `${year}-${month}`;
    const isCurrentMonth = i === 0;
    return {
      label: t(`months.${MONTH_KEYS[month - 1]}`).slice(0, 3),
      fullLabel: `${t(`months.${MONTH_KEYS[month - 1]}`)} ${year}`,
      count: map.get(key) ?? 0,
      isCurrentMonth,
    };
  });
}

export function ExpirationsByMonthChart({ data, loading }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  if (loading || !data) {
    return <Skeleton variant="rounded" height={300} />;
  }

  const series = buildSeries(data, t);
  const hasData = series.some((s) => s.count > 0);

  const barColor = theme.palette.primary.main;
  const currentMonthColor = theme.palette.warning.main;

  return (
    <Card
      sx={{
        transition: (th) => th.transitions.create("box-shadow"),
        "&:hover": { boxShadow: 4 },
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
          {t("dashboard.cards.expirationsByMonth.title")}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
          {t("dashboard.cards.expirationsByMonth.subtitle")}
        </Typography>

        {!hasData ? (
          <Box sx={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {t("dashboard.empty")}
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={240} minWidth={0} debounce={350}>
            <BarChart data={series} barCategoryGap="35%">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={theme.palette.divider}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                cursor={{ fill: theme.palette.action.hover }}
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const item = series.find((s) => s.label === label);
                  return (
                    <Box
                      sx={{
                        bgcolor: "background.paper",
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1,
                        px: 1.5,
                        py: 1,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block">
                        {item?.fullLabel}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {payload[0].value} {t("dashboard.cards.expirationsByMonth.tooltipLabel")}
                      </Typography>
                    </Box>
                  );
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
                {series.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.isCurrentMonth ? currentMonthColor : barColor}
                    opacity={entry.count === 0 ? 0.2 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
