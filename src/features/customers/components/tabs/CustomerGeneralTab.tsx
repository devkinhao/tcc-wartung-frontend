import {
  Card,
  CardContent,
  Chip,
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
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import { useTranslation } from "react-i18next";
import { EditableCardHeader } from "@/components/EditableCardHeader";
import { AuditFooter } from "@/components/AuditFooter";
import { MaskedTextField } from "@/components/MaskedTextField";
import type { CustomerDetailResponseDTO } from "../../types/customerDetail";
import { buildWhatsAppLink } from "@/utils/whatsapp";

type Props = {
  view: CustomerDetailResponseDTO;
  audit: {
    createdBy: string | null;
    createdAt: string | null;
    updatedBy: string | null;
    updatedAt: string | null;
  };
  // Geral
  editingGeneral: boolean;
  savingGeneral: boolean;
  onEditGeneral: () => void;
  onCancelGeneral: () => void;
  onSaveGeneral: () => void;
  // Contatos
  editingContacts: boolean;
  savingContacts: boolean;
  onEditContacts: () => void;
  onCancelContacts: () => void;
  onSaveContacts: () => void;
  // Draft update
  updateField: <K extends keyof CustomerDetailResponseDTO>(field: K, value: CustomerDetailResponseDTO[K]) => void;
};

const cardSx = {
  borderRadius: 2,
  transition: (t: any) => t.transitions.create("box-shadow", { duration: t.transitions.duration.short }),
  "&:hover": { boxShadow: 4 },
} as const;

// Espelha as constraints do CustomerUpdateContactsRequestDTO do backend
// (@Pattern phone/mobilePhone, @Email email) — feedback instantâneo, sem
// depender de round-trip pro backend pra saber que algo está errado.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\(\d{2}\) \d{4}-\d{4}$/;
const MOBILE_REGEX = /^\(\d{2}\) \d{5}-\d{4}$/;

export function CustomerGeneralTab({
  view,
  audit,
  editingGeneral, savingGeneral, onEditGeneral, onCancelGeneral, onSaveGeneral,
  editingContacts, savingContacts, onEditContacts, onCancelContacts, onSaveContacts,
  updateField,
}: Props) {
  const { t } = useTranslation();

  const isGeneralValid = view.legalName.trim() !== "";

  const phone = view.phone?.trim() ?? "";
  const mobile = view.mobilePhone?.trim() ?? "";
  const email = view.email?.trim() ?? "";
  const phoneError = phone !== "" && !PHONE_REGEX.test(phone);
  const mobileError = mobile !== "" && !MOBILE_REGEX.test(mobile);
  const emailError = email !== "" && !EMAIL_REGEX.test(email);
  const isContactsValid = !phoneError && !mobileError && !emailError;

  return (
    <Stack spacing={2}>
      {/* Card: Dados Gerais */}
      <Card sx={cardSx}>
        <CardContent>
          <EditableCardHeader
            title={t("customerDetails.general.title")}
            editing={editingGeneral}
            saving={savingGeneral}
            saveDisabled={!isGeneralValid}
            onEdit={onEditGeneral}
            onCancel={onCancelGeneral}
            onSave={onSaveGeneral}
          />

          <Grid container spacing={2} sx={{ maxWidth: 1100 }}>
            <Grid item xs={12} md={9}>
              <TextField
                label={t("customerDetails.general.fields.legalName")}
                value={view.legalName}
                size="small" fullWidth
                disabled={!editingGeneral}
                required
                onChange={(e) => updateField("legalName", e.target.value)}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small" disabled={!editingGeneral}>
                <InputLabel id="abvtex-label">{t("customerDetails.general.fields.abvtexSeal")}</InputLabel>
                <Select
                  labelId="abvtex-label"
                  label={t("customerDetails.general.fields.abvtexSeal")}
                  value={view.abvtexSeal}
                  onChange={(e) =>
                    updateField("abvtexSeal", e.target.value as CustomerDetailResponseDTO["abvtexSeal"])
                  }
                >
                  <MenuItem value="NAO_POSSUI">{t("abvtex.none")}</MenuItem>
                  <MenuItem value="COBRE">{t("abvtex.copper")}</MenuItem>
                  <MenuItem value="BRONZE">{t("abvtex.bronze")}</MenuItem>
                  <MenuItem value="PRATA">{t("abvtex.silver")}</MenuItem>
                  <MenuItem value="OURO">{t("abvtex.gold")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <MaskedTextField
                mask="cnpj"
                label={t("customerDetails.general.fields.cnpj")}
                value={view.cnpj}
                size="small" fullWidth
                disabled
                onChange={() => {}}
              />
            </Grid>

            <Grid item xs={12} md={7}>
              <TextField
                label={t("customerDetails.general.fields.fantasyName")}
                value={view.fantasyName}
                size="small" fullWidth
                disabled={!editingGeneral}
                onChange={(e) => updateField("fantasyName", e.target.value)}
                inputProps={{ maxLength: 100 }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">
                  {t("customerDetails.general.fields.customerActive")}
                </Typography>
                <Chip
                  label={view.isCustomer ? t("common.yes") : t("common.no")}
                  color={view.isCustomer ? "success" : "default"}
                  variant={view.isCustomer ? "filled" : "outlined"}
                  sx={{ width: "fit-content" }}
                  onClick={
                    editingGeneral
                      ? () => updateField("isCustomer", !view.isCustomer)
                      : undefined
                  }
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Card: Contatos */}
      <Card sx={cardSx}>
        <CardContent>
          <EditableCardHeader
            title={t("customerDetails.contacts.title")}
            editing={editingContacts}
            saving={savingContacts}
            saveDisabled={!isContactsValid}
            onEdit={onEditContacts}
            onCancel={onCancelContacts}
            onSave={onSaveContacts}
          />

          <Grid container spacing={2} sx={{ maxWidth: 1100 }}>
            <Grid item xs={12} md={4}>
              <MaskedTextField
                mask="phone"
                label={t("customerDetails.contacts.fields.phone")}
                value={view.phone ?? ""}
                size="small" fullWidth
                disabled={!editingContacts}
                onChange={(v) => updateField("phone", v)}
                error={phoneError}
                helperText={phoneError ? t("validation.phoneInvalid") : undefined}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <MaskedTextField
                mask="mobile"
                label={t("customerDetails.contacts.fields.mobile")}
                value={view.mobilePhone ?? ""}
                size="small" fullWidth
                disabled={!editingContacts}
                onChange={(v) => updateField("mobilePhone", v)}
                error={mobileError}
                helperText={mobileError ? t("validation.mobileInvalid") : undefined}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size="small"
                      aria-label={t("customerDetails.actions.whatsapp")}
                      onClick={() => window.open(buildWhatsAppLink(view.mobilePhone), "_blank")}
                      disabled={!view.mobilePhone}
                    >
                      <WhatsAppIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label={t("customerDetails.contacts.fields.email")}
                value={view.email ?? ""}
                size="small" fullWidth
                disabled={!editingContacts}
                onChange={(e) => updateField("email", e.target.value)}
                error={emailError}
                helperText={emailError ? t("validation.emailInvalid") : undefined}
                inputProps={{ maxLength: 75 }}
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size="small"
                      aria-label={t("customerDetails.actions.email")}
                      onClick={() => window.open(`mailto:${view.email}`, "_blank")}
                      disabled={!view.email}
                    >
                      <EmailIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <AuditFooter {...audit} />
    </Stack>
  );
}
