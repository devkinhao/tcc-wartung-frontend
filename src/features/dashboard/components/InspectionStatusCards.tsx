import { useEffect, useState } from "react";
import { Box, Card, CardContent, Skeleton, Stack, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { InspectionStatus } from "../api/dashboard.api";
import { useTheme } from "@mui/material/styles";
import { typography } from "@/styles/typography";

type Props = {
  data: InspectionStatus | undefined;
  loading: boolean;
  alertDays: number;
};

type StatCardProps = {
  label: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  total: number;
};

function StatCard({ label, value, color, icon, total }: StatCardProps) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <Card
      sx={{
        flex: 1,
        borderTop: `3px solid ${color}`,
        transition: (th) => th.transitions.create("box-shadow"),
        "&:hover": { boxShadow: 4 },
      }}
    >
      <CardContent>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={typography.weight.bold} color={color} lineHeight={1}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
              {pct}%
            </Typography>
          </Box>
          <Box sx={{ color, opacity: 0.8, mt: 0.5 }}>{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function InspectionStatusCards({ data, loading, alertDays }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  // Força uma remontagem única após o layout estabilizar — o ResponsiveContainer
  // às vezes mede o container antes do reflow final (ex: fontes/grid ainda
  // ajustando), e o Pie do recharts não recalcula a geometria sozinho depois.
  const [renderKey, setRenderKey] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setRenderKey((k) => k + 1), 150);
    return () => clearTimeout(id);
  }, []);

  if (loading || !data) {
    return (
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} variant="rounded" height={110} sx={{ flex: 1 }} />
        ))}
      </Stack>
    );
  }

  const total = data.expired + data.nearExpiration + data.onTrack;

  const colors = {
    expired: theme.palette.error.main,
    nearExpiration: theme.palette.warning.main,
    onTrack: theme.palette.success.main,
  };

  const pieData = [
    { name: t("dashboard.cards.inspectionStatus.expired"),       value: data.expired,        color: colors.expired },
    { name: t("dashboard.cards.inspectionStatus.nearExpiration", { days: alertDays }), value: data.nearExpiration, color: colors.nearExpiration },
    { name: t("dashboard.cards.inspectionStatus.onTrack"),        value: data.onTrack,        color: colors.onTrack },
  ].filter((d) => d.value > 0);

  return (
    <Card
      sx={{
        transition: (th) => th.transitions.create("box-shadow"),
        "&:hover": { boxShadow: 4 },
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" color="text.primary" gutterBottom>
          {t("dashboard.cards.inspectionStatus.title")}
        </Typography>

        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ md: "center" }}
          sx={{ mt: 1 }}
        >
          {/* KPI cards */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flex: 1 }}>
            <StatCard
              label={t("dashboard.cards.inspectionStatus.expired")}
              value={data.expired}
              color={colors.expired}
              icon={<ErrorOutlineIcon />}
              total={total}
            />
            <StatCard
              label={t("dashboard.cards.inspectionStatus.nearExpiration", { days: alertDays })}
              value={data.nearExpiration}
              color={colors.nearExpiration}
              icon={<WarningAmberIcon />}
              total={total}
            />
            <StatCard
              label={t("dashboard.cards.inspectionStatus.onTrack")}
              value={data.onTrack}
              color={colors.onTrack}
              icon={<CheckCircleOutlineIcon />}
              total={total}
            />
          </Stack>

          {/* Donut */}
          {total > 0 && (
            <Box sx={{ width: { xs: "100%", md: 200 }, height: 160, minWidth: 0, flexShrink: 0 }}>
              <ResponsiveContainer key={renderKey} width="100%" height={160} minWidth={0} debounce={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
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
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
          {total} {t("dashboard.cards.inspectionStatus.total")}
        </Typography>
      </CardContent>
    </Card>
  );
}
