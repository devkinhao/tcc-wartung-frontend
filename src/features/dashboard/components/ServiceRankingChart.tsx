import { Box, Card, CardContent, Skeleton, Typography } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useTranslation } from "react-i18next";
import { useTheme, lighten } from "@mui/material/styles";
import type { ServiceRankingItem } from "../api/dashboard.api";

type Props = {
  data: ServiceRankingItem[] | undefined;
  loading: boolean;
};

// Paleta categórica derivada dos brand tokens do projeto
const BASE_PALETTE = [
  "#2A4C61", "#78744C", "#4A7FA5", "#A0956B",
  "#3D6E8C", "#8F7E55", "#5B8FAF", "#B0A57A",
];

// No tema escuro os tons originais (pensados para fundo claro) quase somem
// no card quase preto — clareamos mantendo o matiz para preservar contraste.
function getPalette(mode: "light" | "dark") {
  return mode === "dark" ? BASE_PALETTE.map((c) => lighten(c, 0.35)) : BASE_PALETTE;
}

export function ServiceRankingChart({ data, loading }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  if (loading || !data) {
    return <Skeleton variant="rounded" height={320} />;
  }

  const hasData = data.length > 0;
  const palette = getPalette(theme.palette.mode);

  // Trunca nomes longos no eixo Y para não quebrar o layout
  const series = data.map((d) => ({
    ...d,
    shortName: d.serviceName.length > 22 ? d.serviceName.slice(0, 21) + "…" : d.serviceName,
  }));

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
          {t("dashboard.cards.topRequestedServices.title")}
        </Typography>

        {!hasData ? (
          <Box sx={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="body2" color="text.secondary">
              {t("dashboard.empty")}
            </Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={260} minWidth={0} debounce={350}>
            <BarChart
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
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="shortName"
                width={130}
                tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: theme.palette.action.hover }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = data.find((d) => d.count === payload[0].value);
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
                        {item?.serviceName}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {payload[0].value} {t("dashboard.cards.topRequestedServices.tooltipLabel")}
                      </Typography>
                    </Box>
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
      </CardContent>
    </Card>
  );
}
