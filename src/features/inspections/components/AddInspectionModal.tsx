import { useEffect, useState } from "react";
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
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { qk } from "@/api/keys";
import { useNotify } from "@/hooks/useNotify";
import { uploadInspectionDocuments } from "../api/inspections.documents.api";
import { DocumentPicker } from "./DocumentPicker";
import {
  createInspection,
  getServiceTypes,
  searchCustomers,
  type InspectionCreateRequestDTO,
} from "../api/inspections.create.api";
import type { CustomerSummaryResponseDTO } from "../types/inspectionDetail";
import { MaskedTextField } from "@/components/MaskedTextField";
import { formatDateBR, addYearsISODate } from "@/utils/date";
import { fieldError } from "@/validation/fields";
import { inspectionFormSchema } from "../schemas";
import { INSPECTION_NOTES_MAX_LENGTH } from "../constants";

type AddInspectionModalProps = {
  open: boolean;
  onClose: () => void;
  /** Quando informado, pré-preenche e trava o campo de cliente (ex: aberto a partir da própria ficha do cliente) */
  lockedCustomer?: CustomerSummaryResponseDTO;
  /** Abre o modal de detalhes da inspeção recém-criada. */
  onOpenDetail?: (id: number) => void;
};

type NewInspectionForm = {
  customer: CustomerSummaryResponseDTO | null;
  serviceTypeId: number | "";
  inspectionDate: string;
  expirationDate: string;
  notes: string;
  artNumber: string;
};

const defaultForm: NewInspectionForm = {
  customer: null,
  serviceTypeId: "",
  inspectionDate: "",
  expirationDate: "",
  notes: "",
  artNumber: "",
};

export function AddInspectionModal({ open, onClose, lockedCustomer, onOpenDetail }: AddInspectionModalProps) {
  const { t } = useTranslation();
  const notify = useNotify();
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

  const [docFiles, setDocFiles] = useState<File[]>([]);

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
    setDocFiles([]);
    onClose();
  };

  const inspectionForm = inspectionFormSchema.safeParse({
    inspectionDate: form.inspectionDate,
    expirationDate: form.expirationDate,
    artNumber: form.artNumber.trim(),
    notes: form.notes,
  });

  const expirationBeforeInspection =
    form.inspectionDate !== "" &&
    form.expirationDate !== "" &&
    !!fieldError(inspectionForm, "expirationDate");

  const artNumberInvalid = form.artNumber.trim() !== "" && !!fieldError(inspectionForm, "artNumber");

  const isValid = form.customer !== null && form.serviceTypeId !== "" && inspectionForm.success;

  const { mutate: save, isPending: submitting } = useMutation({
    mutationFn: async () => {
      const dto: InspectionCreateRequestDTO = {
        inspectionDate: form.inspectionDate,
        expirationDate: form.expirationDate,
        notes: form.notes.trim() || null,
        artNumber: form.artNumber.trim() || null,
        serviceTypeId: form.serviceTypeId as number,
      };
      const created = await createInspection(form.customer!.id, dto);

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
      if (form.customer) {
        qc.invalidateQueries({ queryKey: qk.customerDetail(form.customer.id) });
      }
      setCreatedId(created.id);
      setFailedUploads(failed);
      setStep(1);
      if (failed > 0) {
        notify.warning("notify.warning.inspectionCreatedDocsFailed");
      } else {
        notify.success("notify.success.inspectionCreated");
      }
    },
    onError: (err) => notify.fromError(err),
  });

  const goToInspection = () => {
    if (createdId) onOpenDetail?.(createdId);
    closeAndReset();
  };

  return (
    <Dialog open={open} onClose={closeAndReset} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {t("inspections.addModal.title")}
        <Tooltip title={t("common.actions.close")}>
          <IconButton onClick={closeAndReset} aria-label={t("common.actions.close")} size="small">
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <DialogContent dividers>
        {step === 1 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="subtitle1" color="text.primary">
              {t("inspections.addModal.success.title")}
            </Typography>

            {createdId ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t("inspections.addModal.success.summary", {
                  service: serviceTypes.find((s) => s.id === form.serviceTypeId)?.name ?? "—",
                  customer: form.customer?.legalName ?? "—",
                  date: formatDateBR(form.expirationDate),
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
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
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
                  options={[...customerOptions].sort((a, b) => a.legalName.localeCompare(b.legalName))}
                  loading={loadingCustomers}
                  openOnFocus
                  autoHighlight
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
                      slotProps={{
                        // `params.InputProps` é a API do renderInput do Autocomplete
                        // (não o prop depreciado do TextField) — repassa aqui.
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingCustomers ? <CircularProgress size={16} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        },
                      }}
                    />
                  )}
                />
              )}
            </Grid>

            <Grid size={{ xs: 12 }}>
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

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("inspectionDetails.fields.inspectionDate")}
                type="date"
                size="small"
                fullWidth
                required
                value={form.inspectionDate}
                onChange={(e) => setForm((p) => ({ ...p, inspectionDate: e.target.value }))}
                slotProps={{
                  inputLabel: { shrink: true }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("inspectionDetails.fields.expirationDate")}
                type="date"
                size="small"
                fullWidth
                required
                value={form.expirationDate}
                onChange={(e) => setForm((p) => ({ ...p, expirationDate: e.target.value }))}
                error={expirationBeforeInspection}
                helperText={
                  expirationBeforeInspection
                    ? t("inspections.addModal.errors.expirationBeforeInspection")
                    : undefined
                }
                slotProps={{
                  inputLabel: { shrink: true }
                }}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
                {[1, 2, 3].map((years) => (
                  <Button
                    key={years}
                    size="small"
                    variant="text"
                    disabled={!form.inspectionDate}
                    onClick={() =>
                      setForm((p) => ({ ...p, expirationDate: addYearsISODate(p.inspectionDate, years) }))
                    }
                    sx={{ minWidth: 0, px: 1 }}
                  >
                    {t("inspections.addModal.expirationShortcut", {
                      count: years,
                      unit: t(years === 1 ? "common.year" : "common.years"),
                    })}
                  </Button>
                ))}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <MaskedTextField
                mask="art"
                label={t("inspectionDetails.fields.artNumber")}
                size="small"
                fullWidth
                value={form.artNumber}
                onChange={(v) => setForm((p) => ({ ...p, artNumber: v }))}
                error={artNumberInvalid}
                helperText={
                  artNumberInvalid ? t("inspectionDetails.errors.artNumberFormat") : undefined
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                label={t("inspectionDetails.fields.notes")}
                size="small"
                fullWidth
                multiline
                minRows={3}
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                slotProps={{
                  htmlInput: { maxLength: INSPECTION_NOTES_MAX_LENGTH }
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("inspections.addModal.documents.title")}
              </Typography>
              <DocumentPicker files={docFiles} onChange={setDocFiles} />
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
