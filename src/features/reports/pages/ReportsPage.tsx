import { useState } from "react";
import { Box, Button, Card, CardContent, Paper, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type Report = {
  id: string;
  title: string;
  description: string;
};

export default function ReportsPage() {
  const { t } = useTranslation();

  const [reports] = useState<Report[]>([
    {
      id: "inspections_due",
      title: t("reports.items.inspectionsDue.title"),
      description: t("reports.items.inspectionsDue.description"),
    },
    {
      id: "inspections_overdue",
      title: t("reports.items.inspectionsOverdue.title"),
      description: t("reports.items.inspectionsOverdue.description"),
    },
    {
      id: "inspections_by_period",
      title: t("reports.items.inspectionsByPeriod.title"),
      description: t("reports.items.inspectionsByPeriod.description"),
    },
  ]);

  function handleGenerate(reportId: string) {
    console.log("Gerar relatório:", reportId);
  }

  return (
    <Paper
      elevation={1}
      sx={{
        maxWidth: 896,
        p: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" fontWeight={600} color="primary.main" sx={{ mb: 1 }}>
        {t("reports.title")}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("reports.description")}
      </Typography>

      <Stack spacing={2}>
        {reports.map((report) => (
          <Card
            key={report.id}
            sx={{
              borderRadius: 2,
              transition: (t) =>
                t.transitions.create("box-shadow", {
                  duration: t.transitions.duration.short,
                }),
              "&:hover": {
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                {report.title}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {report.description}
              </Typography>

              <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" color="primary" onClick={() => handleGenerate(report.id)}>
                  {t("reports.actions.generate")}
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Paper>
  );
}
