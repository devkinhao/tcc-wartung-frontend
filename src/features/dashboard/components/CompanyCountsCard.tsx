import { Box, Card, CardContent, Grid, Skeleton, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { CompanyCounts } from "../api/dashboard.api";
import { typography } from "@/styles/typography";
import { paths } from "@/routes/paths";

type Props = {
  data: CompanyCounts | undefined;
  loading: boolean;
};

type TileProps = {
  label: string;
  value: number;
  color: string;
  onClick: () => void;
};

function Tile({ label, value, color, onClick }: TileProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        px: 1.5,
        py: 1.25,
        borderRadius: 1,
        border: 1,
        borderColor: "divider",
        cursor: "pointer",
        transition: (t) => t.transitions.create("background-color"),
        "&:hover": { bgcolor: "action.hover" },
      }}
    >
      <Typography variant="h5" fontWeight={typography.weight.bold} color={color} lineHeight={1.1}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}

export function CompanyCountsCard({ data, loading }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading || !data) {
    return <Skeleton variant="rounded" height={200} />;
  }

  const tiles: TileProps[] = [
    {
      label: t("dashboard.cards.companyCounts.total"),
      value: data.total,
      color: "text.primary",
      onClick: () => navigate(paths.customers),
    },
    {
      label: t("dashboard.cards.companyCounts.clients"),
      value: data.clients,
      color: "success.main",
      onClick: () => navigate(paths.customersByStatus("customer")),
    },
    {
      label: t("dashboard.cards.companyCounts.nonClients"),
      value: data.nonClients,
      color: "warning.main",
      onClick: () => navigate(paths.customersByStatus("non-customer")),
    },
    {
      label: t("dashboard.cards.companyCounts.inactive"),
      value: data.inactive,
      color: "text.secondary",
      onClick: () => navigate(paths.customersByStatus("inactive")),
    },
  ];

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
          {t("dashboard.cards.companyCounts.title")}
        </Typography>

        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          {tiles.map((tile) => (
            <Grid key={tile.label} size={{ xs: 6 }}>
              <Tile {...tile} />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
