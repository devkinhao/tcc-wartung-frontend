import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { usersApi, type UserCreateRequestDTO } from "../api/usersApi";
import { useNotify } from "@/hooks/useNotify";
import { MaskedTextField } from "@/components/MaskedTextField";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function CreateUserModal({ open, onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const notify = useNotify();

  const [submitting, setSubmitting] = useState(false);

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
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        t("common.noDataAvailable");
      notify.fromError(e);
    } finally {
      setSubmitting(false);
    }
  }

  const createDisabled =
    submitting ||
    !form.username.trim() ||
    form.username.trim().length < 4 ||
    !form.password ||
    !form.fullName.trim();

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {t("users.create.title")}
        <IconButton onClick={handleClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        
        <Stack spacing={2}>
          <TextField
            size="small"
            label={t("users.create.fields.username")}
            value={form.username}
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
            helperText={t("users.create.helpers.username")}
            disabled={submitting}
            autoFocus
          />

          <TextField
            size="small"
            label={t("users.create.fields.password")}
            type="password"
            value={form.password}
            onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
            disabled={submitting}
          />

          <TextField
            size="small"
            label={t("users.create.fields.fullName")}
            value={form.fullName}
            onChange={(e) => setForm((p) => ({ ...p, fullName: e.target.value }))}
            disabled={submitting}
          />

          <MaskedTextField
            mask="cpf"
            size="small"
            label={t("users.create.fields.cpf")}
            value={form.cpf ?? ""}
            onChange={(v) => setForm((p) => ({ ...p, cpf: v }))}
            disabled={submitting}
          />

          <TextField
            size="small"
            label={t("users.create.fields.email")}
            value={form.email ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            disabled={submitting}
          />

          <TextField
            size="small"
            label={t("users.create.fields.creaNumber")}
            value={form.creaNumber ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, creaNumber: e.target.value }))}
            disabled={submitting}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="contained" onClick={handleCreate} disabled={createDisabled}>
          {t("common.actions.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}