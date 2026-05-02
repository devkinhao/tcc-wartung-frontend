import { Box, Card, CardContent, Skeleton, Stack, Typography } from "@mui/material";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useTheme } from "@mui/material/styles";
import type { CustomersByCityItem } from "../api/dashboard.api";

type Props = {
  data: CustomersByCityItem[] | undefined;
  loading: boolean;
};

const PALETTE = [
  "#2A4C61", "#78744C", "#4A7FA5", "#A0956B",
  "#3D6E8C", "#8F7E55", "#5B8FAF", "#B0A57A",
];

// Agrupa cidades com participação pequena em "Outros" para não poluir o gráfico
function prepareData(raw: CustomersByCityItem[], t: (k: string) => string) {
  if (raw.length <= 6) return raw;
  const top = raw.slice(0, 6);
  const rest = raw.slice(6).reduce((acc, d) => acc + d.count, 0);
  return [...top, { city: t("dashboard.empty"), count: rest }];
}

// Renderiza o label personalizado com porcentagem
function renderCustomLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent,
}: any) {
  if (percent < 0.05) return null; // Não renderiza se fatia for muito pequena
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function CustomersByCityChart({ data, loading }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  if (loading || !data) {
    return <Skeleton variant="rounded" height={320} />;
  }

  const hasData = data.length > 0;
  const series = prepareData(data, t);

  return (
    <Card
      sx={{
        height: "100%",
        transition: (th) => th.transitions.create("box-shadow"),
        "&:hover": { boxShadow: 4 },
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" fontWeight={700} color="text.primary" gutterBottom>
          {t("dashboard.cards.customersByCity.title")}
        </Typography>

        {!hasData ? (
          <Box sx={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {t("dashboard.empty")}
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={series}
                dataKey="count"
                nameKey="city"
                cx="50%"
                cy="48%"
                outerRadius={95}
                labelLine={false}
                label={renderCustomLabel}
              >
                {series.map((_, i) => (
                  <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                ))}
              </Pie>

              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
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
                        {payload[0].name}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {payload[0].value} {t("dashboard.cards.customersByCity.tooltipLabel")}
                      </Typography>
                    </Box>
                  );
                }}
              />

              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ fontSize: 12, color: theme.palette.text.secondary }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
