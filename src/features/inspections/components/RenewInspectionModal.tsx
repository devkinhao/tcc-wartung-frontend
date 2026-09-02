import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { qk } from "@/api/keys";
import { useNotify } from "@/hooks/useNotify";
import { MaskedTextField } from "@/components/MaskedTextField";
import { formatDateBR, todayISODate, addDaysISODate } from "@/utils/date";
import { paths } from "@/routes/paths";
import { renewInspection, type InspectionRenewRequestDTO } from "../api/inspections.renew.api";
import { getInspectionDetail } from "../api/inspections.detail.api";
import { uploadInspectionDocuments } from "../api/inspections.documents.api";
import { DocumentPicker } from "./DocumentPicker";
import { isValidArtNumber } from "../utils/artNumber";
import { INSPECTION_NOTES_MAX_LENGTH } from "../constants";

/** Dados mínimos da inspeção de origem necessários para renovar. */
export type RenewableInspection = {
  id: number;
  inspectionDate: string;
  expirationDate: string;
  customerLegalName: string;
  serviceTypeName: string;
  /** Presente quando a renovação parte da ficha de um cliente — trava o retorno na aba de inspeções. */
  customerId?: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  inspection: RenewableInspection | null;
  /** Chamado após renovar com sucesso, com o id da nova inspeção. */
  onRenewed?: (newInspectionId: number) => void;
};

// Remonta o formulário (estado limpo) sempre que muda a inspeção de origem.
export function RenewInspectionModal(props: Props) {
  return <RenewInspectionForm key={props.inspection?.id ?? "none"} {...props} />;
}

/** Diferença em dias entre inspeção e vencimento da inspeção anterior. */
function previousValiditySpanDays(inspectionDate: string, expirationDate: string): number {
  const start = new Date(inspectionDate).getTime();
  const end = new Date(expirationDate).getTime();
  const days = Math.round((end - start) / 86_400_000);
  return days > 0 ? days : 365;
}

function RenewInspectionForm({ open, onClose, inspection, onRenewed }: Props) {
  const { t } = useTranslation();
  const notify = useNotify();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const today = todayISODate();
  const suggestedExpiration = useMemo(() => {
    if (!inspection) return "";
    return addDaysISODate(today, previousValiditySpanDays(inspection.inspectionDate, inspection.expirationDate));
  }, [inspection, today]);

  // Dados completos da inspeção de origem (para o resumo e para pré-preencher as observações).
  const { data: source } = useQuery({
    queryKey: qk.inspectionDetail(inspection?.id ?? 0),
    queryFn: () => getInspectionDetail(inspection!.id),
    enabled: open && inspection != null,
  });

  const [inspectionDate, setInspectionDate] = useState(today);
  const [expirationDate, setExpirationDate] = useState(suggestedExpiration);
  const [notes, setNotes] = useState("");
  const [artNumber, setArtNumber] = useState("");
  const [docFiles, setDocFiles] = useState<File[]>([]);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [failedUploads, setFailedUploads] = useState(0);

  // Pré-preenche as observações com as da inspeção anterior assim que elas chegam
  // (padrão "ajustar estado durante o render" — sem useEffect).
  const [seededFromId, setSeededFromId] = useState<number | null>(null);
  if (source && seededFromId !== source.id) {
    setSeededFromId(source.id);
    setNotes(source.notes ?? "");
  }

  const expirationBeforeInspection =
    inspectionDate !== "" && expirationDate !== "" && expirationDate <= inspectionDate;
  const artNumberInvalid = !isValidArtNumber(artNumber);
  const isValid = inspectionDate !== "" && expirationDate !== "" && !expirationBeforeInspection && !artNumberInvalid;

  const { mutate: save, isPending: submitting } = useMutation({
    mutationFn: async () => {
      const dto: InspectionRenewRequestDTO = {
        inspectionDate,
        expirationDate,
        notes: notes.trim() || null,
        artNumber: artNumber.trim() || null,
      };
      const created = await renewInspection(inspection!.id, dto);

      let failed = 0;
      if (docFiles.length > 0) {
        try {
          await uploadInspectionDocuments(created.id, docFiles);
        } catch {
          failed = docFiles.length;
        }
      }

      return { created, failed };
    },
    onSuccess: ({ created, failed }) => {
      qc.invalidateQueries({ queryKey: ["inspections-list"] });
      qc.invalidateQueries({ queryKey: qk.dashboard() });
      qc.invalidateQueries({ queryKey: qk.inspectionDetail(inspection!.id) });
      qc.invalidateQueries({ queryKey: qk.inspectionDocuments(created.id) });
      if (inspection?.customerId) {
        qc.invalidateQueries({ queryKey: qk.customerDetail(inspection.customerId) });
      }
      setCreatedId(created.id);
      setFailedUploads(failed);
      if (failed > 0) {
        notify.warning("notify.warning.inspectionRenewedDocsFailed");
      } else {
        notify.success("notify.success.inspectionRenewed");
      }
      onRenewed?.(created.id);
    },
    onError: (err) => notify.fromError(err),
  });

  const goToNewInspection = () => {
    if (createdId) {
      navigate(
        inspection?.customerId
          ? paths.customerInspectionDetails(inspection.customerId, createdId)
          : paths.inspectionDetails(createdId)
      );
    }
    onClose();
  };

  const summaryLine = inspection
    ? `${inspection.serviceTypeName} — ${inspection.customerLegalName} · ` +
      t("inspections.renewModal.currentSummary", {
        inspectionDate: formatDateBR(inspection.inspectionDate),
        expirationDate: formatDateBR(inspection.expirationDate),
      }) +
      (source?.artNumber ? ` · ART ${source.artNumber}` : "")
    : "";

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="span">
              {t("inspections.renewModal.title")}
            </Typography>
            {summaryLine && createdId === null ? (
              <Typography variant="body2" color="text.secondary" noWrap title={summaryLine}>
                {summaryLine}
              </Typography>
            ) : null}
          </Box>
          <Tooltip title={t("common.actions.close")}>
            <IconButton onClick={onClose} aria-label={t("common.actions.close")} size="small" sx={{ mt: -0.5 }}>
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {createdId !== null ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="subtitle1" color="text.primary">
              {t("inspections.renewModal.success.title")}
            </Typography>
            {inspection ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t("inspections.renewModal.success.summary", {
                  service: inspection.serviceTypeName,
                  customer: inspection.customerLegalName,
                  date: formatDateBR(expirationDate),
                })}
              </Typography>
            ) : null}
            {failedUploads > 0 ? (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                {t("inspections.addModal.success.uploadFailures", { count: failedUploads })}
              </Typography>
            ) : null}
          </Box>
        ) : (
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t("inspectionDetails.fields.inspectionDate")}
                type="date"
                size="small"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label={t("inspectionDetails.fields.expirationDate")}
                type="date"
                size="small"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                error={expirationBeforeInspection}
                helperText={
                  expirationBeforeInspection
                    ? t("inspections.addModal.errors.expirationBeforeInspection")
                    : undefined
                }
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <MaskedTextField
                mask="art"
                label={t("inspectionDetails.fields.artNumber")}
                size="small"
                fullWidth
                value={artNumber}
                onChange={(v) => setArtNumber(v)}
                error={artNumberInvalid}
                helperText={artNumberInvalid ? t("inspectionDetails.errors.artNumberFormat") : undefined}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label={t("inspectionDetails.fields.notes")}
                size="small"
                fullWidth
                multiline
                minRows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                inputProps={{ maxLength: INSPECTION_NOTES_MAX_LENGTH }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("inspections.addModal.documents.title")}
              </Typography>
              <DocumentPicker files={docFiles} onChange={setDocFiles} disabled={submitting} />
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {createdId !== null ? (
          <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
            <Button variant="outlined" onClick={onClose}>
              {t("inspections.addModal.actions.close")}
            </Button>
            <Button variant="contained" onClick={goToNewInspection}>
              {t("inspections.renewModal.actions.openNew")}
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            onClick={() => save()}
            disabled={!isValid || submitting || !inspection}
            startIcon={submitting ? <CircularProgress size={16} /> : <AutorenewIcon />}
          >
            {submitting ? t("inspections.addModal.actions.saving") : t("inspections.renewModal.actions.confirm")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
