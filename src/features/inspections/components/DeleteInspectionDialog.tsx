import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { qk } from "@/api/keys";
import { useNotify } from "@/hooks/useNotify";
import { deleteInspection } from "../api/inspections.detail.api";

/** Dados mínimos da inspeção a excluir. */
export type DeletableInspection = {
  id: number;
  serviceTypeName: string;
  customerLegalName: string;
  /** Presente quando a ação parte da ficha de uma empresa. */
  customerId?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  inspection: DeletableInspection | null;
  onDeleted?: () => void;
};

/** Confirmação + exclusão de uma inspeção a partir do menu da linha. */
export function DeleteInspectionDialog({ open, onClose, inspection, onDeleted }: Props) {
  const { t } = useTranslation();
  const notify = useNotify();
  const qc = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => deleteInspection(inspection!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspections-list"] });
      qc.invalidateQueries({ queryKey: qk.dashboard() });
      if (inspection?.customerId) {
        qc.invalidateQueries({ queryKey: qk.customerDetail(inspection.customerId) });
      }
      notify.success("notify.success.inspectionDeleted");
      onClose();
      onDeleted?.();
    },
    onError: (err) => notify.fromError(err),
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("inspectionDetails.confirmDelete.title")}</DialogTitle>
      <DialogContent>
        <Typography variant="body2">{t("inspectionDetails.confirmDelete.message")}</Typography>
        {inspection ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {inspection.serviceTypeName} — {inspection.customerLegalName}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isPending}>
          {t("common.actions.cancel")}
        </Button>
        <Button variant="contained" color="error" disabled={isPending || !inspection} onClick={() => mutate()}>
          {t("common.actions.confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
