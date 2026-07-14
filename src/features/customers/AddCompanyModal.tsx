import { useCallback, useMemo, useState } from "react";
import type { City } from "./types/City";
import type { AbvtexSealType } from "./types/abvtexSeal";
import { api } from "@/api/client";
import { useNavigate } from "react-router-dom";
import {
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
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";
import { CepTextField } from "@/components/CepTextField";
import { useNotify } from "@/hooks/useNotify";
import { MaskedTextField } from "@/components/MaskedTextField";
import { paths } from "@/routes/paths";
import type { ViaCepResponseDTO } from "@/api/cep.api";

type AddCompanyModalProps = {
  open: boolean;
  onClose: () => void;
  cities: City[];
};

type NewCompanyForm = {
  fantasyName: string;
  legalName: string;
  cnpj: string;
  abvtexSeal: AbvtexSealType | "";
  phone: string;
  mobile: string;
  email: string;

  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  cityId: number | "";
};

const defaultForm: NewCompanyForm = {
  fantasyName: "",
  legalName: "",
  cnpj: "",
  abvtexSeal: "",
  phone: "",
  mobile: "",
  email: "",

  zipCode: "",
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  cityId: "",
};

export function AddCompanyModal({ open, onClose, cities }: AddCompanyModalProps) {
  const { t } = useTranslation();
  const notify = useNotify();

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [form, setForm] = useState<NewCompanyForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);

  const navigate = useNavigate();

  const abvtexOptions = useMemo(
    () =>
      [
        { value: "NAO_POSSUI" as const, label: t("abvtex.none") },
        { value: "COBRE" as const, label: t("abvtex.copper") },
        { value: "BRONZE" as const, label: t("abvtex.bronze") },
        { value: "PRATA" as const, label: t("abvtex.silver") },
        { value: "OURO" as const, label: t("abvtex.gold") },
      ] satisfies Array<{ value: AbvtexSealType; label: string }>,
    [t]
  );

  const closeAndReset = () => {
    setStep(0);
    setForm(defaultForm);
    setSubmitting(false);
    setCreatedId(null);
    onClose();
  };

  const CNPJ_REGEX  = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
  const CEP_REGEX   = /^\d{5}-\d{3}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX  = /^\(\d{2}\) \d{4}-\d{4}$/;   // 10 dígitos — fixo
  const MOBILE_REGEX = /^\(\d{2}\) \d{5}-\d{4}$/;   // 11 dígitos — celular

  // Erros de formato — visíveis quando o campo está preenchido mas inválido
  const cnpjError   = form.cnpj.trim()    !== "" && !CNPJ_REGEX.test(form.cnpj.trim());
  const zipError    = form.zipCode.trim() !== "" && !CEP_REGEX.test(form.zipCode.trim());
  const emailError  = form.email.trim()   !== "" && !EMAIL_REGEX.test(form.email.trim());
  const phoneError  = form.phone.trim()   !== "" && !PHONE_REGEX.test(form.phone.trim());
  const mobileError = form.mobile.trim()  !== "" && !MOBILE_REGEX.test(form.mobile.trim());

  // Só os obrigatórios bloqueiam o avanço de etapa
  const step1Valid =
    form.legalName.trim() !== "" &&
    CNPJ_REGEX.test(form.cnpj.trim()) &&
    form.abvtexSeal !== "" &&
    !emailError &&
    !phoneError &&
    !mobileError;

  const step2Valid =
    CEP_REGEX.test(form.zipCode.trim()) &&
    form.street.trim() !== "" &&
    form.cityId !== "";

  const onSubmit = async () => {
    setSubmitting(true);

    try {
      const payload = {
        fantasyName: form.fantasyName.trim(),
        legalName: form.legalName.trim(),
        cnpj: form.cnpj.trim(),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
        ...(form.mobile.trim() ? { mobilePhone: form.mobile.trim() } : {}),
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
        abvtexSeal: form.abvtexSeal,
        address: {
          street: form.street.trim(),
          complement: form.complement.trim(),
          neighborhood: form.neighborhood.trim(),
          number: form.number.trim(),
          zipCode: form.zipCode.trim(),
          cityId: form.cityId,
        },
      };

      const res = await api.post("/customers", payload);
      const id = res.data && typeof res.data.id === "number" ? (res.data.id as number) : null;
      setCreatedId(id);
      setStep(2);
    } catch (e) {
      notify.fromError(e);
    } finally {
      setSubmitting(false);
    }
  };

  const goToCadastro = () => {
    if (createdId) navigate(paths.customerDetails(createdId));
    else navigate(paths.customers);
    closeAndReset();
  };

  const handleCepFound = useCallback((cepData: ViaCepResponseDTO) => {
    setForm((prev) => ({
      ...prev,
      zipCode: cepData.zipCode,
      street: cepData.street || prev.street,
      complement: cepData.complement || prev.complement,
      neighborhood: cepData.neighborhood || prev.neighborhood,
      cityId: cepData.cityId ? Number(cepData.cityId) : prev.cityId,
    }));
  }, []);

  return (
    <Dialog open={open} onClose={closeAndReset} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {t("customers.addModal.title")}
        <IconButton onClick={closeAndReset} aria-label={t("common.actions.close")} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={step} sx={{ mb: 3 }}>
          <Step><StepLabel>{t("customers.addModal.steps.info")}</StepLabel></Step>
          <Step><StepLabel>{t("customers.addModal.steps.address")}</StepLabel></Step>
          <Step><StepLabel>{t("customers.addModal.steps.done")}</StepLabel></Step>
        </Stepper>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: -1, mb: 2 }}>
          {step === 0
            ? t("customers.addModal.stepHints.step1")
            : step === 1
              ? t("customers.addModal.stepHints.step2")
              : t("customers.addModal.stepHints.done")}
        </Typography>

        {step === 2 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography fontWeight={600} color="text.primary">
              {t("customers.addModal.success.title")}
            </Typography>

            {createdId ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {t("customers.addModal.success.idLabel")}: {createdId}
              </Typography>
            ) : null}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              {t("customers.addModal.success.question")}
            </Typography>
          </Box>
        ) : step === 0 ? (
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <TextField
                label={t("customers.addModal.fields.fantasyName")}
                placeholder={t("customers.addModal.placeholders.fantasyName")}
                value={form.fantasyName}
                onChange={(e) => setForm((p) => ({ ...p, fantasyName: e.target.value }))}
                fullWidth
                size="small"
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <MaskedTextField
                mask="cnpj"
                label={t("customers.addModal.fields.cnpj")}
                value={form.cnpj}
                onChange={(v) => setForm((p) => ({ ...p, cnpj: v }))}
                fullWidth
                size="small"
                required
                error={cnpjError}
                helperText={cnpjError ? t("validation.cnpjInvalid") : undefined}
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <TextField
                label={t("customers.addModal.fields.legalName")}
                placeholder={t("customers.addModal.placeholders.legalName")}
                value={form.legalName}
                onChange={(e) => setForm((p) => ({ ...p, legalName: e.target.value }))}
                fullWidth
                size="small"
                required
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="abvtex" required>{t("customers.addModal.fields.abvtexSeal")}</InputLabel>
                <Select
                  labelId="abvtex"
                  label={t("customers.addModal.fields.abvtexSeal")}
                  value={form.abvtexSeal}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, abvtexSeal: e.target.value as NewCompanyForm["abvtexSeal"] }))
                  }
                >
                  <MenuItem value="">{t("customers.addModal.placeholders.abvtexSeal")}</MenuItem>
                  {abvtexOptions.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <MaskedTextField
                mask="phone"
                label={t("customers.addModal.fields.phone")}
                value={form.phone}
                onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
                fullWidth
                size="small"
                error={phoneError}
                helperText={phoneError ? t("validation.phoneInvalid") : undefined}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <MaskedTextField
                mask="mobile"
                label={t("customers.addModal.fields.mobile")}
                value={form.mobile}
                onChange={(v) => setForm((p) => ({ ...p, mobile: v }))}
                fullWidth
                size="small"
                error={mobileError}
                helperText={mobileError ? t("validation.mobileInvalid") : undefined}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label={t("customers.addModal.fields.email")}
                placeholder={t("customers.addModal.placeholders.email")}
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                fullWidth
                size="small"
                error={emailError}
                helperText={emailError ? t("validation.emailInvalid") : undefined}
                inputProps={{ maxLength: 75 }}
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <CepTextField
                value={form.zipCode}
                onChange={(val) => setForm((p) => ({ ...p, zipCode: val }))}
                onAddressFound={handleCepFound}
                label={t("customers.addModal.fields.zipCode")}
                required
                error={zipError}
                helperText={zipError ? t("validation.cepInvalid") : undefined}
              />
            </Grid>

            <Grid item xs={12} md={9}>
              <TextField
                label={t("customers.addModal.fields.street")}
                placeholder={t("customers.addModal.placeholders.street")}
                value={form.street}
                onChange={(e) => setForm((p) => ({ ...p, street: e.target.value }))}
                fullWidth
                size="small"
                required
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <TextField
                label={t("customers.addModal.fields.number")}
                placeholder={t("customers.addModal.placeholders.number")}
                value={form.number}
                onChange={(e) => setForm((p) => ({ ...p, number: e.target.value }))}
                fullWidth
                size="small"
                inputProps={{ maxLength: 20 }}
              />
            </Grid>

            <Grid item xs={12} md={9}>
              <TextField
                label={t("customers.addModal.fields.complement")}
                placeholder={t("customers.addModal.placeholders.complement")}
                value={form.complement}
                onChange={(e) => setForm((p) => ({ ...p, complement: e.target.value }))}
                fullWidth
                size="small"
                inputProps={{ maxLength: 75 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                label={t("customers.addModal.fields.neighborhood")}
                placeholder={t("customers.addModal.placeholders.neighborhood")}
                value={form.neighborhood}
                onChange={(e) => setForm((p) => ({ ...p, neighborhood: e.target.value }))}
                fullWidth
                size="small"
                inputProps={{ maxLength: 75 }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="city" required>{t("customers.addModal.fields.city")}</InputLabel>
                <Select
                  labelId="city"
                  label={t("customers.addModal.fields.city")}
                  value={form.cityId}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      cityId: e.target.value ? Number(e.target.value) : "",
                    }))
                  }
                >
                  <MenuItem value="">{t("customers.addModal.placeholders.city")}</MenuItem>
                  {cities.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {step === 1 ? (
          <Button variant="outlined" onClick={() => setStep(0)}>
            {t("customers.addModal.actions.previous")}
          </Button>
        ) : (
          <Box sx={{ flex: 1 }} />
        )}

        {step === 0 ? (
          <Button variant="contained" onClick={() => setStep(1)} disabled={!step1Valid}>
            {t("customers.addModal.actions.next")}
          </Button>
        ) : step === 1 ? (
          <Button
            variant="contained"
            onClick={onSubmit}
            disabled={!step2Valid || submitting}
            startIcon={submitting ? <CircularProgress size={16} /> : undefined}
          >
            {submitting ? t("customers.addModal.actions.saving") : t("customers.addModal.actions.finish")}
          </Button>
        ) : (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" onClick={closeAndReset}>
              {t("customers.addModal.actions.close")}
            </Button>
            <Button variant="contained" onClick={goToCadastro}>
              {t("customers.addModal.actions.openRecord")}
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
}