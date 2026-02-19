import { useState } from "react";
import { Box, Button, Card, Paper, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type Configuration = {
  name: string;
  value: string;
};

export default function Configurations() {
  const { t } = useTranslation();

  const [configs, setConfigs] = useState<Configuration[]>([
    { name: "default_page_size", value: "10" },
    { name: "enable_notifications", value: "true" },
    { name: "system_timezone", value: "America/Sao_Paulo" },
  ]);

  function handleChange(index: number, value: string) {
    const updated = [...configs];
    updated[index].value = value;
    setConfigs(updated);
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
      <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
        {t("configurations.title")}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("configurations.description")}
      </Typography>

      <Stack spacing={2}>
        {configs.map((config, index) => (
          <Card
            key={config.name}
            sx={{
              p: 2,
              borderRadius: 2,
              transition: (t) =>
                t.transitions.create("box-shadow", {
                  duration: t.transitions.duration.short,
                }),
              "&:hover": { boxShadow: 4 },
            }}
          >
            <TextField
              fullWidth
              label={config.name}
              value={config.value}
              onChange={(e) => handleChange(index, e.target.value)}
              size="small"
            />
          </Card>
        ))}
      </Stack>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" color="primary">
          {t("configurations.actions.save")}
        </Button>
      </Box>
    </Paper>
  );
}