import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/api/keys";
import { useCities } from "@/features/customers/hooks/useCities";
import { fieldError } from "@/validation/fields";
import {
  companyGeneralSchema,
  companyContactsSchema,
  companyAddressSchema,
} from "@/features/customers/schemas";
import { CepTextField } from "@/components/CepTextField";
import { MaskedTextField } from "@/components/MaskedTextField";
import { useNotify } from "@/hooks/useNotify";
import { Breadcrumb } from "@/layout/header/Breadcrumb";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { paths } from "@/routes/paths";
import type { ViaCepResponseDTO } from "@/api/cep.api";
import {
  getCompany,
  updateCompany,
  type CompanyResponseDTO,
  type CompanyUpdateRequestDTO,
} from "../api/company.api";

// ---- Draft shape (alinha campos opcionais com strings para os inputs) ----

type CompanyDraft = {
  fantasyName: string;
  legalName: string;
  cnpj: string;
  phone: string;
  mobilePhone: string;
  email: string;
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    zipCode: string;
    cityId: number | null;
  };
};

function toDraft(data: CompanyResponseDTO): CompanyDraft {
  return {
    fantasyName: data.fantasyName ?? "",
    legalName: data.legalName,
    cnpj: data.cnpj,
    phone: data.phone ?? "",
    mobilePhone: data.mobilePhone ?? "",
    email: data.email ?? "",
    address: {
      street: data.address?.street ?? "",
      number: data.address?.number ?? "",
      complement: data.address?.complement ?? "",
      neighborhood: data.address?.neighborhood ?? "",
      zipCode: data.address?.zipCode ?? "",
      cityId: data.address?.city?.id ?? null,
    },
  };
}

function toRequestDTO(draft: CompanyDraft): CompanyUpdateRequestDTO {
  return {
    fantasyName: draft.fantasyName || null,
    legalName: draft.legalName,
    cnpj: draft.cnpj,
    phone: draft.phone || null,
    mobilePhone: draft.mobilePhone || null,
    email: draft.email || null,
    address: {
      street: draft.address.street,
      number: draft.address.number,
      complement: draft.address.complement || null,
      neighborhood: draft.address.neighborhood,
      zipCode: draft.address.zipCode,
      cityId: draft.address.cityId as number,
    },
  };
}

// ---- Page ----

export default function CompanyPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const cities = useCities();

  const notify = useNotify();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<CompanyDraft | null>(null);

  // Valida contra os schemas de empresa (espelham CustomerUpdateRequestDTO +
  // AddressRequestDTO no backend). Um `safeParse` por seção.
  const general = companyGeneralSchema.safeParse({
    fantasyName: draft?.fantasyName ?? "",
    legalName: draft?.legalName ?? "",
    cnpj: (draft?.cnpj ?? "").trim(),
  });
  const contacts = companyContactsSchema.safeParse({
    phone: (draft?.phone ?? "").trim(),
    mobilePhone: (draft?.mobilePhone ?? "").trim(),
    email: (draft?.email ?? "").trim(),
  });
  const address = companyAddressSchema.safeParse({
    street: draft?.address.street ?? "",
    number: draft?.address.number ?? "",
    complement: draft?.address.complement ?? "",
    neighborhood: draft?.address.neighborhood ?? "",
    zipCode: (draft?.address.zipCode ?? "").trim(),
    cityId: draft?.address.cityId ?? 0,
  });

  const cnpjError   = isEditing && (draft?.cnpj ?? "").trim() !== ""        && !!fieldError(general, "cnpj");
  const emailError  = isEditing && (draft?.email ?? "").trim() !== ""       && !!fieldError(contacts, "email");
  const phoneError  = isEditing && (draft?.phone ?? "").trim() !== ""       && !!fieldError(contacts, "phone");
  const mobileError = isEditing && (draft?.mobilePhone ?? "").trim() !== "" && !!fieldError(contacts, "mobilePhone");
  const zipCodeFormatError = isEditing && (draft?.address.zipCode ?? "").trim() !== "" && !!fieldError(address, "zipCode");

  const isFormValid = general.success && contacts.success && address.success;

  const { data, isLoading } = useQuery({
    queryKey: qk.company(),
    queryFn: getCompany,
  });

  // Inicializa o draft uma vez quando os dados chegam
  useEffect(() => {
    if (data) setDraft((prev) => prev ?? toDraft(data));
  }, [data]);

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: (dto: CompanyUpdateRequestDTO) => updateCompany(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.company() });
      setIsEditing(false);
      notify.success("notify.success.saved");
    },
    onError: (err) => notify.fromError(err),
  });

  // ---- Handlers de mudança no draft ----

  function updateField<K extends keyof Omit<CompanyDraft, "address">>(
    field: K,
    value: CompanyDraft[K]
  ) {
    setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
  }

  function updateAddress<K extends keyof CompanyDraft["address"]>(
    field: K,
    value: CompanyDraft["address"][K]
  ) {
    setDraft((prev) =>
      prev ? { ...prev, address: { ...prev.address, [field]: value } } : prev
    );
  }

  function handleCancel() {
    if (data) setDraft(toDraft(data));
    setIsEditing(false);
  }

  function handleSave() {
    if (!draft) return;
    save(toRequestDTO(draft));
  }

  // Preenche campos de endereço automaticamente quando o CEP é encontrado
  const handleCepFound = useCallback((cepData: ViaCepResponseDTO) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        address: {
          ...prev.address,
          zipCode: cepData.zipCode,
          street: cepData.street || prev.address.street,
          complement: cepData.complement || prev.address.complement,
          neighborhood: cepData.neighborhood || prev.address.neighborhood,
          cityId: cepData.cityId ? Number(cepData.cityId) : prev.address.cityId,
        },
      };
    });
  }, []);

  // ---- Render states ----

  if (isLoading || !draft) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <CircularProgress size={18} />
        <Typography variant="body2" color="text.secondary">
          {t("company.loading")}
        </Typography>
      </Stack>
    );
  }

  return (
    <Box sx={{ maxWidth: 960 }}>
      <Box sx={{ mb: 3 }}>
        <Breadcrumb items={breadcrumbMap[paths.company]} size="large" />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          {t("company.description")}
        </Typography>
      </Box>

      <Card sx={{ borderRadius: 2 }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            {t("company.generalTitle")}
          </Typography>
          <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label={t("company.fields.fantasyName")}
              fullWidth size="small"
              value={draft.fantasyName}
              onChange={(e) => updateField("fantasyName", e.target.value)}
              disabled={!isEditing}
              slotProps={{
                htmlInput: { maxLength: 100 }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label={t("company.fields.legalName")}
              fullWidth size="small"
              value={draft.legalName}
              onChange={(e) => updateField("legalName", e.target.value)}
              disabled={!isEditing}
              required
              slotProps={{
                htmlInput: { maxLength: 100 }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <MaskedTextField
              mask="cnpj"
              label={t("company.fields.cnpj")}
              fullWidth size="small"
              value={draft.cnpj}
              onChange={(v) => updateField("cnpj", v)}
              disabled={!isEditing}
              required
              error={cnpjError}
              helperText={cnpjError ? t("validation.cnpjInvalid") : undefined}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <MaskedTextField
              mask="phone"
              label={t("company.fields.phone")}
              fullWidth size="small"
              value={draft.phone}
              onChange={(v) => updateField("phone", v)}
              disabled={!isEditing}
              error={phoneError}
              helperText={phoneError ? t("validation.phoneInvalid") : undefined}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <MaskedTextField
              mask="mobile"
              label={t("company.fields.mobile")}
              fullWidth size="small"
              value={draft.mobilePhone}
              onChange={(v) => updateField("mobilePhone", v)}
              disabled={!isEditing}
              error={mobileError}
              helperText={mobileError ? t("validation.mobileInvalid") : undefined}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label={t("company.fields.email")}
              fullWidth size="small"
              value={draft.email}
              onChange={(e) => updateField("email", e.target.value)}
              disabled={!isEditing}
              error={emailError}
              helperText={emailError ? t("validation.emailInvalid") : undefined}
              slotProps={{
                htmlInput: { maxLength: 75 }
              }}
            />
          </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            {t("company.address.title")}
          </Typography>
          <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label={t("company.address.fields.street")}
              fullWidth size="small"
              required
              value={draft.address.street}
              onChange={(e) => updateAddress("street", e.target.value)}
              disabled={!isEditing}
              slotProps={{
                htmlInput: { maxLength: 100 }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label={t("company.address.fields.number")}
              fullWidth size="small"
              value={draft.address.number}
              onChange={(e) => updateAddress("number", e.target.value)}
              disabled={!isEditing}
              slotProps={{
                htmlInput: { maxLength: 20 }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label={t("company.address.fields.complement")}
              fullWidth size="small"
              value={draft.address.complement}
              onChange={(e) => updateAddress("complement", e.target.value)}
              disabled={!isEditing}
              slotProps={{
                htmlInput: { maxLength: 75 }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label={t("company.address.fields.neighborhood")}
              fullWidth size="small"
              value={draft.address.neighborhood}
              onChange={(e) => updateAddress("neighborhood", e.target.value)}
              disabled={!isEditing}
              slotProps={{
                htmlInput: { maxLength: 75 }
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <CepTextField
              value={draft.address.zipCode}
              onChange={(val) => updateAddress("zipCode", val)}
              onAddressFound={handleCepFound}
              label={t("company.address.fields.zipCode")}
              disabled={!isEditing}
              required
              error={zipCodeFormatError}
              helperText={zipCodeFormatError ? t("validation.cepInvalid") : undefined}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <FormControl fullWidth size="small" disabled={!isEditing}>
              <InputLabel id="company-city-label" required>
                {t("company.address.fields.city")}
              </InputLabel>
              <Select
                labelId="company-city-label"
                label={t("company.address.fields.city")}
                value={draft.address.cityId ?? ""}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  updateAddress("cityId", id > 0 ? id : null);
                }}
              >
                <MenuItem value="">
                  <em>{t("company.address.actions.selectCity")}</em>
                </MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            {!isEditing ? (
              <Button variant="contained" onClick={() => setIsEditing(true)}>
                {t("common.actions.edit")}
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={handleCancel} disabled={isSaving}>
                  {t("common.actions.cancel")}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={isSaving || !isFormValid}
                >
                  {t("common.actions.save")}
                </Button>
              </Stack>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
