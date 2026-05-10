import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { qk } from "@/api/keys";
import { useCities } from "@/features/customers/hooks/useCities";
import { EditableCardHeader } from "@/components/EditableCardHeader";
import { CepTextField } from "@/components/CepTextField";
import { MaskedTextField } from "@/components/MaskedTextField";
import { useNotify } from "@/hooks/useNotify";
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

  const cardSx = {
    p: 2,
    borderRadius: 2,
    transition: (th: any) =>
      th.transitions.create("box-shadow", { duration: th.transitions.duration.short }),
    "&:hover": { boxShadow: 4 },
  } as const;

  return (
    <Paper elevation={1} sx={{ maxWidth: 1100, p: 3, borderRadius: 2, bgcolor: "background.paper" }}>
      {/* Cabeçalho com título e botões Edit/Cancel/Save */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} color="primary.main">
          {t("company.title")}
        </Typography>

        <EditableCardHeader
          title=""
          editing={isEditing}
          saving={isSaving}
          onEdit={() => setIsEditing(true)}
          onCancel={handleCancel}
          onSave={handleSave}
        />
      </Stack>

      {/* Dados da empresa */}
      <Card sx={{ ...cardSx, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label={t("company.fields.fantasyName")}
              fullWidth size="small"
              value={draft.fantasyName}
              onChange={(e) => updateField("fantasyName", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label={t("company.fields.legalName")}
              fullWidth size="small"
              value={draft.legalName}
              onChange={(e) => updateField("legalName", e.target.value)}
              disabled={!isEditing}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <MaskedTextField
              mask="cnpj"
              label={t("company.fields.cnpj")}
              fullWidth size="small"
              value={draft.cnpj}
              onChange={(v) => updateField("cnpj", v)}
              disabled={!isEditing}
              required
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <MaskedTextField
              mask="phone"
              label={t("company.fields.phone")}
              fullWidth size="small"
              value={draft.phone}
              onChange={(v) => updateField("phone", v)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <MaskedTextField
              mask="mobile"
              label={t("company.fields.mobile")}
              fullWidth size="small"
              value={draft.mobilePhone}
              onChange={(v) => updateField("mobilePhone", v)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label={t("company.fields.email")}
              fullWidth size="small"
              value={draft.email}
              onChange={(e) => updateField("email", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Endereço */}
      <Typography variant="subtitle1" fontWeight={600} color="primary.main" sx={{ mb: 1.5 }}>
        {t("company.address.title")}
      </Typography>

      <Card sx={cardSx}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label={t("company.address.fields.street")}
              fullWidth size="small"
              value={draft.address.street}
              onChange={(e) => updateAddress("street", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label={t("company.address.fields.number")}
              fullWidth size="small"
              value={draft.address.number}
              onChange={(e) => updateAddress("number", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label={t("company.address.fields.complement")}
              fullWidth size="small"
              value={draft.address.complement}
              onChange={(e) => updateAddress("complement", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              label={t("company.address.fields.neighborhood")}
              fullWidth size="small"
              value={draft.address.neighborhood}
              onChange={(e) => updateAddress("neighborhood", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <CepTextField
              value={draft.address.zipCode}
              onChange={(val) => updateAddress("zipCode", val)}
              onAddressFound={handleCepFound}
              label={t("company.address.fields.zipCode")}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <FormControl fullWidth size="small" disabled={!isEditing}>
              <InputLabel id="company-city-label">
                {t("company.address.fields.city")}
              </InputLabel>
              <Select
                labelId="company-city-label"
                label={t("company.address.fields.city")}
                value={draft.address.cityId ?? ""}
                onChange={(e) =>
                  updateAddress("cityId", e.target.value === "" ? null : Number(e.target.value))
                }
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
      </Card>
    </Paper>
  );
}
