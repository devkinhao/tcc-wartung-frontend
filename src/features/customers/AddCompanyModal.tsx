import { useMemo, useState } from "react";
import type { City } from "@/types/City";
import type { AbvtexSealType } from "./types/abvtexSeal";
import { api } from "@/api/client";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

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

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [form, setForm] = useState<NewCompanyForm>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    setCreatedId(null);
    onClose();
  };

  const CNPJ_REGEX = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
  const CEP_REGEX = /^\d{5}-\d{3}$/;
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const step1Valid =
    form.fantasyName.trim() !== "" &&
    form.legalName.trim() !== "" &&
    CNPJ_REGEX.test(form.cnpj.trim()) &&
    form.abvtexSeal !== "" &&
    form.phone.trim() !== "" &&
    form.mobile.trim() !== "" &&
    EMAIL_REGEX.test(form.email.trim());

  const step2Valid =
    CEP_REGEX.test(form.zipCode.trim()) &&
    form.street.trim() !== "" &&
    form.number.trim() !== "" &&
    form.neighborhood.trim() !== "" &&
    form.cityId !== "";

  const onSubmit = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        fantasyName: form.fantasyName.trim(),
        legalName: form.legalName.trim(),
        cnpj: form.cnpj.trim(),
        phone: form.phone.trim(),
        mobilePhone: form.mobile.trim(),
        email: form.email.trim(),
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
      console.error("Erro ao criar cliente:", e);
      setError(t("customers.addModal.errors.createFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const goToCadastro = () => {
    if (createdId) navigate(`/customers/${createdId}`);
    else navigate("/customers");
    closeAndReset();
  };

  return (
    <Dialog open={open} onClose={closeAndReset} fullWidth maxWidth="md">
      <DialogTitle>{t("customers.addModal.title")}</DialogTitle>

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

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

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
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label={t("customers.addModal.fields.cnpj")}
                placeholder={t("customers.addModal.placeholders.cnpj")}
                value={form.cnpj}
                onChange={(e) => setForm((p) => ({ ...p, cnpj: e.target.value }))}
                fullWidth
                size="small"
                helperText={t("customers.addModal.helpers.cnpjFormat")}
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
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="abvtex">{t("customers.addModal.fields.abvtexSeal")}</InputLabel>
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
              <TextField
                label={t("customers.addModal.fields.phone")}
                placeholder={t("customers.addModal.placeholders.phone")}
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label={t("customers.addModal.fields.mobile")}
                placeholder={t("customers.addModal.placeholders.mobile")}
                value={form.mobile}
                onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))}
                fullWidth
                size="small"
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
                helperText={t("customers.addModal.helpers.emailExample")}
              />
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                label={t("customers.addModal.fields.zipCode")}
                placeholder={t("customers.addModal.placeholders.zipCode")}
                value={form.zipCode}
                onChange={(e) => setForm((p) => ({ ...p, zipCode: e.target.value }))}
                fullWidth
                size="small"
                helperText={t("customers.addModal.helpers.zipCodeFormat")}
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
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="city">{t("customers.addModal.fields.city")}</InputLabel>
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