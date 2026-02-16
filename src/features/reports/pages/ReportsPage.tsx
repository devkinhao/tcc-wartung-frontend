import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

type Report = {
  id: string;
  title: string;
  description: string;
};

export default function ReportsPage() {
  const [reports] = useState<Report[]>([
    {
      id: "inspections_due",
      title: "Inspeções a vencer",
      description: "Lista de inspeções que vencem nos próximos dias.",
    },
    {
      id: "inspections_overdue",
      title: "Inspeções vencidas",
      description: "Inspeções com prazo expirado.",
    },
    {
      id: "inspections_by_period",
      title: "Inspeções por período",
      description: "Relatório de inspeções em um intervalo de datas.",
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
      <Typography
        variant="h6"
        fontWeight={600}
        color="primary.main"
        sx={{ mb: 1 }}
      >
        Relatórios
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Gere relatórios do sistema para análise ou exportação.
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
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="text.primary"
              >
                {report.title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {report.description}
              </Typography>

              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleGenerate(report.id)}
                >
                  Gerar relatório
                </Button>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Paper>
  );
}