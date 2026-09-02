import { useEffect, useState } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { serviceTypesApi, type ServiceTypeResponseDTO, type ServiceTypeUpdateRequestDTO } from "../api/serviceTypes.api";
import { useNotify } from "@/hooks/useNotify";

type Props = {
  open: boolean;
  serviceType: ServiceTypeResponseDTO | null;
  onClose: () => void;
  onUpdated?: () => void;
};

export function EditServiceTypeModal({ open, serviceType, onClose, onUpdated }: Props) {
  const { t } = useTranslation();
  const notify = useNotify();

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && serviceType) setName(serviceType.name);
  }, [open, serviceType]);

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  async function handleSave() {
    if (!serviceType) return;

    setSubmitting(true);
    try {
      const payload: ServiceTypeUpdateRequestDTO = { name: name.trim() };
      await serviceTypesApi.update(serviceType.id, payload);

      notify.success("notify.success.serviceUpdated");
      onUpdated?.();
      onClose();
    } catch (e) {
      notify.fromError(e);
    } finally {
      setSubmitting(false);
    }
  }

  const saveDisabled = submitting || name.trim() === "";

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {t("serviceTypes.edit.title")}
        <Tooltip title={t("common.actions.close")}>
          <IconButton onClick={handleClose} aria-label={t("common.actions.close")}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
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
          slotProps={{
            htmlInput: { maxLength: 30 }
          }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button variant="outlined" onClick={handleClose} disabled={submitting}>
          {t("common.actions.cancel")}
        </Button>
        <Button variant="contained" onClick={handleSave} disabled={saveDisabled}>
          {t("common.actions.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
