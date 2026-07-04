import { useEffect, useState } from "react";
import { Box, Button, Card, CircularProgress, Paper, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/api/keys";
import { useNotify } from "@/hooks/useNotify";
import { toCamelCase } from "@/utils/strings";
import { getConfigurations, updateConfigurations } from "../api/configurations.api";

export default function ConfigurationsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const notify = useNotify();

  const { data, isLoading } = useQuery({
    queryKey: qk.configurations(),
    queryFn: getConfigurations,
  });

  const [draft, setDraft] = useState<Record<string, string> | null>(null);

  // Inicializa o draft uma vez quando os dados chegam
  useEffect(() => {
    if (data && !draft) {
      const map: Record<string, string> = {};
      data.forEach((c) => {
        map[c.name] = c.value;
      });
      setDraft(map);
    }
  }, [data, draft]);

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: (configurations: Record<string, string>) => updateConfigurations(configurations),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.configurations() });
      qc.invalidateQueries({ queryKey: qk.dashboard() });
      qc.invalidateQueries({ queryKey: ["inspections-list"] });
      notify.success("notify.success.saved");
    },
    onError: (err) => notify.fromError(err),
  });

  function handleChange(name: string, value: string) {
    setDraft((prev) => (prev ? { ...prev, [name]: value } : prev));
  }

  if (isLoading || !data || !draft) {
    return (
      <Paper elevation={1} sx={{ maxWidth: 896, p: 3, borderRadius: 2, bgcolor: "background.paper" }}>
        <Skeleton variant="text" width={220} height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={360} height={20} sx={{ mb: 3 }} />
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={72} />
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper elevation={1} sx={{ maxWidth: 896, p: 3, borderRadius: 2, bgcolor: "background.paper" }}>
      <Typography variant="h6" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
        {t("configurations.title")}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t("configurations.description")}
      </Typography>

      <Stack spacing={2}>
        {data.map((config) => {
          const fieldKey = toCamelCase(config.name);
          const label = t(`configurations.fields.${fieldKey}`, { defaultValue: config.name });
          const description = t(`configurations.fields.${fieldKey}Description`, { defaultValue: "" });

          return (
            <Card
              key={config.name}
              sx={{
                p: 2,
                borderRadius: 2,
                transition: (th) => th.transitions.create("box-shadow", { duration: th.transitions.duration.short }),
                "&:hover": { boxShadow: 4 },
              }}
            >
              <TextField
                fullWidth
                label={label}
                helperText={description || undefined}
                value={draft[config.name] ?? ""}
                onChange={(e) => handleChange(config.name, e.target.value)}
                size="small"
              />
            </Card>
          );
        })}
      </Stack>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Button variant="contained" color="primary" disabled={isSaving} onClick={() => save(draft)}>
          {isSaving ? <CircularProgress size={20} color="inherit" /> : t("configurations.actions.save")}
        </Button>
      </Box>
    </Paper>
  );
}
