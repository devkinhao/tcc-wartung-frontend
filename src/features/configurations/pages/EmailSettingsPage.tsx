import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, CircularProgress, Divider, FormControlLabel, Grid, Skeleton, Stack, Switch, TextField, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/api/keys";
import { useNotify } from "@/hooks/useNotify";
import { fieldError } from "@/validation/fields";
import { emailSettingsSchema } from "@/features/configurations/schemas";
import { digitsOnly } from "@/utils/masks";
import { PasswordVisibilityToggle } from "@/components/PasswordVisibilityToggle";
import { Breadcrumb } from "@/layout/header/Breadcrumb";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { paths } from "@/routes/paths";
import {
  getEmailSettings,
  updateEmailSettings,
  type EmailSettingsResponseDTO,
} from "../api/emailSettings.api";

// ---- Draft shape (port como string para o input; convertido no envio) ----

type EmailSettingsDraft = {
  host: string;
  port: string;
  username: string;
  password: string;
  fromAddress: string;
  sendCopyToSender: boolean;
};

function toDraft(data: EmailSettingsResponseDTO): EmailSettingsDraft {
  return {
    host: data.host ?? "",
    port: data.port != null ? String(data.port) : "",
    username: data.username ?? "",
    // Nunca vem do backend — em branco significa "manter a senha atual".
    password: "",
    fromAddress: data.fromAddress ?? "",
    sendCopyToSender: data.sendCopyToSender,
  };
}

// ---- Page ----

export default function EmailSettingsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const notify = useNotify();

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [draft, setDraft] = useState<EmailSettingsDraft | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: qk.emailSettings(),
    queryFn: getEmailSettings,
  });

  useEffect(() => {
    if (data) setDraft((prev) => prev ?? toDraft(data));
  }, [data]);

  const validation = emailSettingsSchema.safeParse({
    host: draft?.host ?? "",
    port: draft?.port ?? "",
    username: draft?.username ?? "",
    fromAddress: (draft?.fromAddress ?? "").trim(),
  });

  const hostError = isEditing && !!fieldError(validation, "host");
  const portError = isEditing && !!fieldError(validation, "port");
  const usernameError = isEditing && !!fieldError(validation, "username");
  const fromAddressError = isEditing && (draft?.fromAddress ?? "").trim() !== "" && !!fieldError(validation, "fromAddress");

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: () =>
      updateEmailSettings({
        host: draft!.host.trim(),
        port: Number(draft!.port),
        username: draft!.username.trim(),
        fromAddress: draft!.fromAddress.trim(),
        sendCopyToSender: draft!.sendCopyToSender,
        ...(draft!.password.trim() ? { password: draft!.password.trim() } : {}),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.emailSettings() });
      setIsEditing(false);
      setShowPassword(false);
      notify.success("notify.success.saved");
    },
    onError: (err) => notify.fromError(err),
  });

  function updateField<K extends keyof EmailSettingsDraft>(field: K, value: EmailSettingsDraft[K]) {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function handleCancel() {
    if (data) setDraft(toDraft(data));
    setIsEditing(false);
    setShowPassword(false);
  }

  if (isLoading || !data || !draft) {
    return (
      <Box sx={{ maxWidth: 720 }}>
        <Skeleton variant="text" width={220} height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={360} height={20} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={280} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumb items={breadcrumbMap[paths.emailSettings]} />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          {t("configurations.emailSettings.description")}
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label={t("configurations.emailSettings.fields.host")}
                fullWidth
                size="small"
                required
                value={draft.host}
                onChange={(e) => updateField("host", e.target.value)}
                disabled={!isEditing}
                error={hostError}
                helperText={hostError ? t("validation.required") : undefined}
                slotProps={{ htmlInput: { maxLength: 100 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label={t("configurations.emailSettings.fields.port")}
                fullWidth
                size="small"
                required
                value={draft.port}
                onChange={(e) => updateField("port", digitsOnly(e.target.value).slice(0, 5))}
                disabled={!isEditing}
                error={portError}
                helperText={portError ? t("validation.required") : undefined}
                inputMode="numeric"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("configurations.emailSettings.fields.username")}
                fullWidth
                size="small"
                required
                value={draft.username}
                onChange={(e) => updateField("username", e.target.value)}
                disabled={!isEditing}
                error={usernameError}
                helperText={usernameError ? t("validation.required") : undefined}
                slotProps={{ htmlInput: { maxLength: 100 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("configurations.emailSettings.fields.password")}
                fullWidth
                size="small"
                type={showPassword ? "text" : "password"}
                value={isEditing ? draft.password : data.hasPassword ? "••••••••" : ""}
                onChange={(e) => updateField("password", e.target.value)}
                disabled={!isEditing}
                placeholder={isEditing && data.hasPassword ? t("configurations.emailSettings.passwordPlaceholder") : undefined}
                helperText={isEditing ? t("configurations.emailSettings.passwordHelper") : undefined}
                slotProps={{
                  htmlInput: { maxLength: 100 },
                  input: isEditing
                    ? { endAdornment: <PasswordVisibilityToggle visible={showPassword} onToggle={() => setShowPassword((p) => !p)} /> }
                    : undefined,
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label={t("configurations.emailSettings.fields.fromAddress")}
                fullWidth
                size="small"
                required
                value={draft.fromAddress}
                onChange={(e) => updateField("fromAddress", e.target.value)}
                disabled={!isEditing}
                error={fromAddressError}
                helperText={
                  fromAddressError
                    ? t("validation.emailInvalid")
                    : t("configurations.emailSettings.fields.fromAddressDescription")
                }
                slotProps={{ htmlInput: { maxLength: 100 } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={draft.sendCopyToSender}
                    onChange={(e) => updateField("sendCopyToSender", e.target.checked)}
                    disabled={!isEditing}
                  />
                }
                label={t("configurations.emailSettings.fields.sendCopyToSender")}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            {!isEditing ? (
              <Button variant="contained" onClick={() => setIsEditing(true)}>
                {t("common.actions.edit")}
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={handleCancel} disabled={isSaving}>
                  {t("common.actions.cancel")}
                </Button>
                <Button variant="contained" onClick={() => save()} disabled={isSaving || !validation.success}>
                  {isSaving ? <CircularProgress size={20} color="inherit" /> : t("common.actions.save")}
                </Button>
              </Stack>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
