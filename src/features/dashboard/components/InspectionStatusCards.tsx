import { useEffect, useState } from "react";
import { Box, Card, CardContent, Skeleton, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { InspectionStatus } from "../api/dashboard.api";
import { useTheme } from "@mui/material/styles";
import { typography } from "@/styles/typography";
import { paths } from "@/routes/paths";

type Props = {
  data: InspectionStatus | undefined;
  loading: boolean;
  alertDays: number;
};

type LegendRowProps = {
  label: string;
  value: number;
  pct: number;
  color: string;
  onClick: () => void;
};

function LegendRow({ label, value, pct, color, onClick }: LegendRowProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      onClick={onClick}
      sx={{
        py: 0.75,
        px: 1,
        borderRadius: 1,
        cursor: "pointer",
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Box sx={{ width: 12, height: 12, borderRadius: "3px", bgcolor: color, flexShrink: 0 }} />
      <Typography variant="body2" color="text.primary" sx={{ flex: 1 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={typography.weight.bold} color="text.primary">
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 38, textAlign: "right" }}>
        {pct}%
      </Typography>
    </Stack>
  );
}

export function InspectionStatusCards({ data, loading, alertDays }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  // Força uma remontagem única após o layout estabilizar — o ResponsiveContainer
  // às vezes mede o container antes do reflow final (ex: fontes/grid ainda
  // ajustando), e o Pie do recharts não recalcula a geometria sozinho depois.
  const [renderKey, setRenderKey] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setRenderKey((k) => k + 1), 150);
    return () => clearTimeout(id);
  }, []);

  if (loading || !data) {
    return <Skeleton variant="rounded" height={200} />;
  }

  const total = data.expired + data.nearExpiration + data.onTrack;
  const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0);

  const colors = {
    expired: theme.palette.error.main,
    nearExpiration: theme.palette.warning.main,
    onTrack: theme.palette.success.main,
  };

  const pieData = [
    { name: t("dashboard.cards.inspectionStatus.expired"), value: data.expired, color: colors.expired },
    {
      name: t("dashboard.cards.inspectionStatus.nearExpiration", { days: alertDays }),
      value: data.nearExpiration,
      color: colors.nearExpiration,
    },
    { name: t("dashboard.cards.inspectionStatus.onTrack"), value: data.onTrack, color: colors.onTrack },
  ].filter((d) => d.value > 0);

  return (
    <Card
      sx={{
        height: "100%",
        transition: (th) => th.transitions.create("box-shadow"),
        "&:hover": { boxShadow: 4 },
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" color="text.primary" gutterBottom>
          {t("dashboard.cards.inspectionStatus.title")}
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          sx={{ mt: 1 }}
        >
          {total > 0 && (
            <Box sx={{ width: 130, height: 120, flexShrink: 0 }}>
              <ResponsiveContainer key={renderKey} width="100%" height={120} minWidth={0} debounce={350}>
                <PieChart accessibilityLayer={false}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={34}
                    outerRadius={54}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: theme.shape.borderRadius,
                      fontSize: typography.size.chartTooltip,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          )}

          <Box sx={{ flex: 1, width: "100%" }}>
            <LegendRow
              label={t("dashboard.cards.inspectionStatus.expired")}
              value={data.expired}
              pct={pct(data.expired)}
              color={colors.expired}
              onClick={() => navigate(paths.inspectionsByStatus("expired"))}
            />
            <LegendRow
              label={t("dashboard.cards.inspectionStatus.nearExpiration", { days: alertDays })}
              value={data.nearExpiration}
              pct={pct(data.nearExpiration)}
              color={colors.nearExpiration}
              onClick={() => navigate(paths.inspectionsByStatus("near"))}
            />
            <LegendRow
              label={t("dashboard.cards.inspectionStatus.onTrack")}
              value={data.onTrack}
              pct={pct(data.onTrack)}
              color={colors.onTrack}
              onClick={() => navigate(paths.inspectionsByStatus("ok"))}
            />
          </Box>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
          {total} {t("dashboard.cards.inspectionStatus.total")}
        </Typography>
      </CardContent>
    </Card>
  );
}
