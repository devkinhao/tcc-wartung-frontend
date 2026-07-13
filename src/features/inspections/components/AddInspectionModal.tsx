import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { qk } from "@/api/keys";
import { useNotify } from "@/hooks/useNotify";
import { uploadInspectionDocument } from "../api/inspection.documents.api";
import {
  createInspection,
  getServiceTypes,
  searchCustomers,
  type InspectionCreateRequestDTO,
} from "../api/inspections.create.api";
import type { CustomerSummaryResponseDTO } from "../types/inspectionDetail";
import { paths } from "@/routes/paths";

type PendingDocument = {
  description: string;
  file: File;
};

type AddInspectionModalProps = {
  open: boolean;
  onClose: () => void;
  /** Quando informado, pré-preenche e trava o campo de cliente (ex: aberto a partir da própria ficha do cliente) */
  lockedCustomer?: CustomerSummaryResponseDTO;
};

type NewInspectionForm = {
  customer: CustomerSummaryResponseDTO | null;
  serviceTypeId: number | "";
  inspectionDate: string;
  expirationDate: string;
  notes: string;
};

const defaultForm: NewInspectionForm = {
  customer: null,
  serviceTypeId: "",
  inspectionDate: "",
  expirationDate: "",
  notes: "",
};

export function AddInspectionModal({ open, onClose, lockedCustomer }: AddInspectionModalProps) {
  const { t } = useTranslation();
  const notify = useNotify();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [form, setForm] = useState<NewInspectionForm>(() => ({
    ...defaultForm,
    customer: lockedCustomer ?? null,
  }));
  const [step, setStep] = useState<0 | 1>(0);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [failedUploads, setFailedUploads] = useState(0);

  const [customerInput, setCustomerInput] = useState("");
  const [debouncedInput, setDebouncedInput] = useState("");

  const [pendingDocs, setPendingDocs] = useState<PendingDocument[]>([]);
  const [docDescription, setDocDescription] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);

  // Debounce simples para não disparar uma busca a cada tecla digitada
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedInput(customerInput), 300);
    return () => clearTimeout(handle);
  }, [customerInput]);

  const { data: customerOptions = [], isFetching: loadingCustomers } = useQuery({
    queryKey: qk.customerSearch(debouncedInput),
    queryFn: () => searchCustomers(debouncedInput),
    enabled: open && !lockedCustomer,
  });

  const { data: serviceTypes = [], isLoading: loadingServiceTypes } = useQuery({
    queryKey: qk.serviceTypes(),
    queryFn: getServiceTypes,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const closeAndReset = () => {
    setForm({ ...defaultForm, customer: lockedCustomer ?? null });
    setStep(0);
    setCreatedId(null);
    setFailedUploads(0);
    setCustomerInput("");
    setDebouncedInput("");
    setPendingDocs([]);
    setDocDescription("");
    setDocFile(null);
    onClose();
  };

  function addPendingDocument() {
    if (!docFile) {
      notify.warning("notify.error.uploadFailed");
      return;
    }
    setPendingDocs((prev) => [...prev, { description: docDescription.trim(), file: docFile }]);
    setDocDescription("");
    setDocFile(null);
  }

  function removePendingDocument(index: number) {
    setPendingDocs((prev) => prev.filter((_, i) => i !== index));
  }

  const expirationBeforeInspection =
    form.inspectionDate !== "" &&
    form.expirationDate !== "" &&
    form.expirationDate < form.inspectionDate;

  const isValid =
    form.customer !== null &&
    form.serviceTypeId !== "" &&
    form.inspectionDate !== "" &&
    form.expirationDate !== "" &&
    !expirationBeforeInspection;

  const { mutate: save, isPending: submitting } = useMutation({
    mutationFn: async () => {
      const dto: InspectionCreateRequestDTO = {
        inspectionDate: form.inspectionDate,
        expirationDate: form.expirationDate,
        notes: form.notes.trim() || null,
        serviceTypeId: form.serviceTypeId as number,
      };
      const created = await createInspection(form.customer!.id, dto);

      let failed = 0;
      for (const doc of pendingDocs) {
        try {
          await uploadInspectionDocument(created.id, doc);
        } catch {
          failed++;
        }
      }

      return { created, failed };
    },
    onSuccess: ({ created, failed }) => {
      qc.invalidateQueries({ queryKey: ["inspections-list"] });
      qc.invalidateQueries({ queryKey: qk.dashboard() });
      if (form.customer) {
        qc.invalidateQueries({ queryKey: qk.customerDetail(form.customer.id) });
      }
      setCreatedId(created.id);
      setFailedUploads(failed);
      setStep(1);
    },
    onError: (err) => notify.fromError(err),
  });

  const goToInspection = () => {
    if (createdId) {
      navigate(
        lockedCustomer
          ? paths.customerInspectionDetails(lockedCustomer.id, createdId)
          : paths.inspectionDetails(createdId)
      );
    }
    closeAndReset();
  };

  return (
    <Dialog open={open} onClose={closeAndReset} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {t("inspections.addModal.title")}
        <IconButton onClick={closeAndReset} aria-label={t("common.actions.close")} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {step === 1 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography fontWeight={600} color="text.primary">
              {t("inspections.addModal.success.title")}
            </Typography>

            {createdId ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t("inspections.addModal.success.idLabel")}: {createdId}
              </Typography>
            ) : null}

            {failedUploads > 0 ? (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                {t("inspections.addModal.success.uploadFailures", { count: failedUploads })}
              </Typography>
            ) : null}
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {lockedCustomer ? (
                <TextField
                  label={t("inspections.addModal.fields.customer")}
                  value={`${lockedCustomer.legalName} — ${lockedCustomer.cnpj}`}
                  size="small"
                  fullWidth
                  disabled
                />
              ) : (
                <Autocomplete
                  options={customerOptions}
                  loading={loadingCustomers}
                  value={form.customer}
                  onChange={(_, value) => setForm((p) => ({ ...p, customer: value }))}
                  inputValue={customerInput}
                  onInputChange={(_, value) => setCustomerInput(value)}
                  getOptionLabel={(o) => `${o.legalName} — ${o.cnpj}`}
                  isOptionEqualToValue={(o, v) => o.id === v.id}
                  noOptionsText={t("inspections.addModal.customerNoOptions")}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t("inspections.addModal.fields.customer")}
                      required
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loadingCustomers ? <CircularProgress size={16} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              )}
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel id="add-inspection-service-type" required>
                  {t("inspectionDetails.fields.service")}
                </InputLabel>
                <Select
                  labelId="add-inspection-service-type"
                  label={t("inspectionDetails.fields.service")}
                  value={form.serviceTypeId}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, serviceTypeId: e.target.value ? Number(e.target.value) : "" }))
                  }
                  disabled={loadingServiceTypes}
                >
                  {serviceTypes.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label={t("inspectionDetails.fields.inspectionDate")}
                type="date"
                size="small"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={form.inspectionDate}
                onChange={(e) => setForm((p) => ({ ...p, inspectionDate: e.target.value }))}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label={t("inspectionDetails.fields.expirationDate")}
                type="date"
                size="small"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={form.expirationDate}
                onChange={(e) => setForm((p) => ({ ...p, expirationDate: e.target.value }))}
                error={expirationBeforeInspection}
                helperText={
                  expirationBeforeInspection
                    ? t("inspections.addModal.errors.expirationBeforeInspection")
                    : undefined
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label={t("inspectionDetails.fields.notes")}
                size="small"
                fullWidth
                multiline
                minRows={3}
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                {t("inspections.addModal.documents.title")}
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}>
                <TextField
                  size="small"
                  label={t("inspectionDetails.documents.uploadDialog.description")}
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  sx={{ flex: 1 }}
                />

                <Button variant="outlined" component="label" size="small" sx={{ whiteSpace: "nowrap" }}>
                  {docFile
                    ? t("inspectionDetails.documents.uploadDialog.fileSelected", { name: docFile.name })
                    : t("inspectionDetails.documents.uploadDialog.chooseFile")}
                  <input
                    type="file"
                    hidden
                    onChange={(e) => setDocFile(e.target.files?.[0] ?? null)}
                  />
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  startIcon={<UploadFileIcon />}
                  onClick={addPendingDocument}
                  disabled={!docFile}
                >
                  {t("inspections.addModal.documents.add")}
                </Button>
              </Stack>

              {pendingDocs.length > 0 && (
                <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                  {pendingDocs.map((doc, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ px: 1.5, py: 0.75, borderRadius: 1, bgcolor: "action.hover" }}
                    >
                      <Typography variant="body2" noWrap sx={{ minWidth: 0 }}>
                        {doc.description ? `${doc.description} — ${doc.file.name}` : doc.file.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => removePendingDocument(index)}
                        aria-label={t("inspectionDetails.documents.actions.delete")}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {step === 1 ? (
          <Box sx={{ display: "flex", gap: 1, ml: "auto" }}>
            <Button variant="outlined" onClick={closeAndReset}>
              {t("inspections.addModal.actions.close")}
            </Button>
            <Button variant="contained" onClick={goToInspection}>
              {t("inspections.addModal.actions.openRecord")}
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            onClick={() => save()}
            disabled={!isValid || submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : undefined}
          >
            {submitting ? t("inspections.addModal.actions.saving") : t("inspections.addModal.actions.create")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
