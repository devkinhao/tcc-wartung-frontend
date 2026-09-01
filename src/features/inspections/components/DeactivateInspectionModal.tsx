import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { qk } from "@/api/keys";
import { useNotify } from "@/hooks/useNotify";
import { deactivateInspection } from "../api/inspections.deactivate.api";
import { DEACTIVATION_REASONS, deactivationReasonKey, type InspectionDeactivationReason } from "../deactivationReason";

/** Dados mínimos da inspeção a encerrar. */
export type DeactivatableInspection = {
  id: number;
  serviceTypeName: string;
  customerLegalName: string;
  /** Presente quando a ação parte da ficha de uma empresa. */
  customerId?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  inspection: DeactivatableInspection | null;
  onDeactivated?: () => void;
};

export function DeactivateInspectionModal({ open, onClose, inspection, onDeactivated }: Props) {
  const { t } = useTranslation();
  const notify = useNotify();
  const qc = useQueryClient();

  const [reason, setReason] = useState<InspectionDeactivationReason | "">("");

  const { mutate, isPending } = useMutation({
    mutationFn: () => deactivateInspection(inspection!.id, reason as InspectionDeactivationReason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspections-list"] });
      qc.invalidateQueries({ queryKey: qk.dashboard() });
      qc.invalidateQueries({ queryKey: qk.inspectionDetail(inspection!.id) });
      if (inspection?.customerId) {
        qc.invalidateQueries({ queryKey: qk.customerDetail(inspection.customerId) });
      }
      notify.success("notify.success.inspectionNotRenewed");
      handleClose();
      onDeactivated?.();
    },
    onError: (err) => notify.fromError(err),
  });

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("inspections.deactivate.title")}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {t("inspections.deactivate.intro", {
              service: inspection?.serviceTypeName ?? "—",
              customer: inspection?.customerLegalName ?? "—",
            })}
          </Typography>

          <FormControl size="small" fullWidth required>
            <InputLabel id="deactivate-reason">{t("inspections.deactivate.reasonLabel")}</InputLabel>
            <Select
              labelId="deactivate-reason"
              label={t("inspections.deactivate.reasonLabel")}
              value={reason}
              onChange={(e) => setReason(e.target.value as InspectionDeactivationReason)}
            >
              {DEACTIVATION_REASONS.map((value) => (
                <MenuItem key={value} value={value}>
                  {t(deactivationReasonKey(value))}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("common.actions.cancel")}</Button>
        <Button
          variant="contained"
          color="warning"
          disabled={reason === "" || isPending || !inspection}
          onClick={() => mutate()}
        >
          {t("inspections.deactivate.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
