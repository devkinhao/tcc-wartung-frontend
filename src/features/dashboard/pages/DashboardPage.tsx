import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <Box sx={{ maxWidth: 1152, width: "100%" }}>
      <Typography variant="h6" fontWeight={600} color="primary.main" sx={{ mb: 3 }}>
        {t("dashboard.title")}
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              transition: (t) => t.transitions.create("box-shadow"),
              "&:hover": { boxShadow: 4 },
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
                {t("dashboard.cards.topRequestedServices.title")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("common.noDataAvailable")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              transition: (t) => t.transitions.create("box-shadow"),
              "&:hover": { boxShadow: 4 },
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
                {t("dashboard.cards.customersByCity.title")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("common.noDataAvailable")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: "100%",
              transition: (t) => t.transitions.create("box-shadow"),
              "&:hover": { boxShadow: 4 },
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" fontWeight={600} color="text.primary" gutterBottom>
                {t("dashboard.cards.inspections.title")}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t("common.noDataAvailable")}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}