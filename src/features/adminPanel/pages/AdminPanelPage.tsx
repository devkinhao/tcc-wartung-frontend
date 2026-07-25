import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { Apartment, AdminPanelSettings, Settings } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import { Breadcrumb } from "@/layout/header/Breadcrumb";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { paths } from "@/routes/paths";
import { typography } from "@/styles/typography";

const ITEMS = [
  { key: "company", to: paths.company, icon: Apartment },
  { key: "users", to: paths.users, icon: AdminPanelSettings },
  { key: "configurations", to: paths.configurations, icon: Settings },
] as const;

export default function AdminPanelPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Paper elevation={1} sx={{ maxWidth: 960, p: 3, borderRadius: 2, bgcolor: "background.paper" }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumb items={breadcrumbMap[paths.adminPanel]} size="large" />
        <Typography variant="body2" color="text.secondary">
          {t("adminPanel.description")}
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {ITEMS.map(({ key, to, icon: Icon }) => (
          <Grid key={key} item xs={12} sm={6} md={4}>
            <Card
              sx={{
                borderRadius: 2,
                height: "100%",
                transition: (th) => th.transitions.create("box-shadow", { duration: th.transitions.duration.short }),
                "&:hover": { boxShadow: 4 },
              }}
            >
              <CardActionArea onClick={() => navigate(to)} sx={{ height: "100%" }}>
                <CardContent>
                  <Icon color="primary" sx={{ fontSize: 32, mb: 1 }} />
                  <Typography variant="subtitle1" fontWeight={typography.weight.semibold} color="text.primary">
                    {t(`adminPanel.items.${key}.title`)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {t(`adminPanel.items.${key}.description`)}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
