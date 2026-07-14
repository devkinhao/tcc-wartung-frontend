import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useTranslation } from "react-i18next";
import { usersApi, type UserCreateRequestDTO } from "../api/usersApi";
import { useNotify } from "@/hooks/useNotify";
import { MaskedTextField } from "@/components/MaskedTextField";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

// Espelha as constraints do UserCreateRequestDTO do backend (@Pattern
// username, @Pattern cpf, @Email) — feedback instantâneo, sem round-trip.
const USERNAME_REGEX = /^[a-z0-9]+$/;
const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CreateUserModal({ open, onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const notify = useNotify();

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  const [form, setForm] = useState<UserCreateRequestDTO>({
    username: "",
    password: "",
    fullName: "",
    cpf: "",
    email: "",
    creaNumber: "",
  });

  function resetForm() {
    setForm({
      username: "",
      password: "",
      fullName: "",
      cpf: "",
      email: "",
      creaNumber: "",
    });
    setConfirmPassword("");
    setShowPassword(false);
  }

  function handleClose() {
    if (submitting) return;
    resetForm();
    onClose();
  }

  async function handleCreate() {
    setSubmitting(true);
    try {
      const payload: UserCreateRequestDTO = {
        username: form.username.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        ...(form.cpf?.trim() ? { cpf: form.cpf.trim() } : {}),
        ...(form.email?.trim() ? { email: form.email.trim() } : {}),
        ...(form.creaNumber?.trim() ? { creaNumber: form.creaNumber.trim() } : {}),
      };

      await usersApi.create(payload);

      onCreated?.();
      resetForm();
      onClose();
    } catch (e) {
      notify.fromError(e);
    } finally {
      setSubmitting(false);
    }
  }

  const username = form.username.trim();
  const cpf = form.cpf?.trim() ?? "";
  const email = form.email?.trim() ?? "";

  const usernameFormatError = username !== "" && (username.length < 4 || !USERNAME_REGEX.test(username));
  const cpfError = cpf !== "" && !CPF_REGEX.test(cpf);
  const emailError = email !== "" && !EMAIL_REGEX.test(email);
  const passwordMismatch = confirmPassword !== "" && form.password !== confirmPassword;

  const createDisabled =
    submitting ||
    username === "" ||
    usernameFormatError ||
    !form.password ||
    form.password !== confirmPassword ||
    !form.fullName.trim() ||
    cpfError ||
    emailError;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {t("users.create.title")}
        <IconButton onClick={handleClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <TextField
              size="small"
              fullWidth
              label={t("users.create.fields.username")}
              value={form.username}
              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value.toLowerCase() }))}
              error={usernameFormatError}
              helperText={usernameFormatError ? t("validation.usernameInvalid") : t("users.create.helpers.username")}
              disabled={submitting}
              autoFocus
              required
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              size="small"
              fullWidth
              label={t("users.create.fields.password")}
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              disabled={submitting}
              required
              inputProps={{ maxLength: 100 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((p) => !p)}
                      edge="end"
                      aria-label={t("userProfile.password.actions.toggleVisibility")}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              size="small"
              fullWidth
              label={t("users.create.fields.confirmPassword")}
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
              required
              inputProps={{ maxLength: 100 }}
              error={passwordMismatch}
              helperText={passwordMismatch ? t("userProfile.password.errors.mismatch") : undefined}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((p) => !p)}
                      edge="end"
                      aria-label={t("userProfile.password.actions.toggleVisibility")}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              size="small"
              fullWidth
              label={t("users.create.fields.fullName")}
              value={form.fullName}
              onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
              disabled={submitting}
              required
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <MaskedTextField
              mask="cpf"
              size="small"
              fullWidth
              label={t("users.create.fields.cpf")}
              value={form.cpf ?? ""}
              onChange={(v) => setForm((p) => ({ ...p, cpf: v }))}
              disabled={submitting}
              error={cpfError}
              helperText={cpfError ? t("validation.cpfInvalid") : undefined}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              size="small"
              fullWidth
              label={t("users.create.fields.email")}
              value={form.email ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              disabled={submitting}
              error={emailError}
              helperText={emailError ? t("validation.emailInvalid") : undefined}
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              size="small"
              fullWidth
              label={t("users.create.fields.creaNumber")}
              placeholder="CREA-SC"
              value={form.creaNumber ?? ""}
              onChange={(e) => setForm((p) => ({ ...p, creaNumber: e.target.value }))}
              disabled={submitting}
              inputProps={{ maxLength: 10 }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={handleClose} disabled={submitting}>
          {t("common.actions.cancel")}
        </Button>
        <Button variant="contained" onClick={handleCreate} disabled={createDisabled}>
          {t("common.actions.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}