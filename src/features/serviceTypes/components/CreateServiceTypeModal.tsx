import { useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { serviceTypesApi, type ServiceTypeCreateRequestDTO } from "../api/serviceTypes.api";
import { useNotify } from "@/hooks/useNotify";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function CreateServiceTypeModal({ open, onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const notify = useNotify();

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setName("");
  }

  function handleClose() {
    if (submitting) return;
    resetForm();
    onClose();
  }

  async function handleCreate() {
    setSubmitting(true);
    try {
      const payload: ServiceTypeCreateRequestDTO = { name: name.trim() };
      await serviceTypesApi.create(payload);

      notify.success("notify.success.created");
      onCreated?.();
      resetForm();
      onClose();
    } catch (e) {
      notify.fromError(e);
    } finally {
      setSubmitting(false);
    }
  }

  const createDisabled = submitting || name.trim() === "";

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {t("serviceTypes.create.title")}
        <IconButton onClick={handleClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          size="small"
          fullWidth
          label={t("serviceTypes.fields.name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={submitting}
          autoFocus
          required
          inputProps={{ maxLength: 30 }}
        />
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
