import { useEffect, useState } from "react";
import { Box, Button, Card, CircularProgress, Paper, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/api/keys";
import { useNotify } from "@/hooks/useNotify";
import { toCamelCase } from "@/utils/strings";
import { digitsOnly } from "@/utils/masks";
import { Breadcrumb } from "@/layout/header/Breadcrumb";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { paths } from "@/routes/paths";
import { getConfigurations, updateConfigurations } from "../api/configurations.api";

// Configurações cujo VAL_CONFIG é semanticamente numérico (ex: quantidade de dias).
// O backend guarda como String livre (só length=100), então essa restrição é
// só do frontend — filtra dígitos ao digitar em vez de validar depois.
const NUMERIC_CONFIGS = new Set(["DIAS_ALERTA_VENCIMENTO", "MAX_FILE_SIZE_MB"]);

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
    const sanitized = NUMERIC_CONFIGS.has(name) ? digitsOnly(value) : value;
    setDraft((prev) => (prev ? { ...prev, [name]: sanitized } : prev));
  }

  // Nenhuma configuração pode ficar em branco — feedback instantâneo,
  // sem depender do round-trip pro backend rejeitar o PUT.
  const hasBlankConfig = data?.some((config) => (draft?.[config.name] ?? "").trim() === "") ?? true;

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
      <Box sx={{ mb: 3 }}>
        <Breadcrumb items={breadcrumbMap[paths.configurations]} size="large" />
        <Typography variant="body2" color="text.secondary">
          {t("configurations.description")}
        </Typography>
      </Box>

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
                required
                label={label}
                helperText={description || undefined}
                value={draft[config.name] ?? ""}
                onChange={(e) => handleChange(config.name, e.target.value)}
                size="small"
                inputMode={NUMERIC_CONFIGS.has(config.name) ? "numeric" : "text"}
                inputProps={{ maxLength: 100 }}
              />
            </Card>
          );
        })}
      </Stack>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        {/* @NotEmpty no ConfigurationBatchUpdateRequestDTO (mapa vazio) + nenhum valor em branco */}
        <Button
          variant="contained"
          color="primary"
          disabled={isSaving || Object.keys(draft).length === 0 || hasBlankConfig}
          onClick={() => save(draft)}
        >
          {isSaving ? <CircularProgress size={20} color="inherit" /> : t("configurations.actions.save")}
        </Button>
      </Box>
    </Paper>
  );
}
