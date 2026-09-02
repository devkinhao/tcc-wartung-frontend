import {
  Box,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { EditableCardHeader } from "@/components/EditableCardHeader";
import { CepTextField } from "@/components/CepTextField";
import type { ViaCepResponseDTO } from "@/api/cep.api";
import type { CustomerDetailResponseDTO } from "../../types/customerDetail";
import type { City } from "../../types/City";
import type { UseMutationResult } from "@tanstack/react-query";
import type { CustomerUpdateAddressRequestDTO } from "../../api/customers.detail.api";

type Props = {
  view: CustomerDetailResponseDTO;
  editing: boolean;
  saving: boolean;
  cities: { id: number; name: string }[];
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onCepFound: (data: ViaCepResponseDTO) => void;
  updateAddress: <K extends keyof CustomerDetailResponseDTO["address"]>(
    field: K,
    value: CustomerDetailResponseDTO["address"][K]
  ) => void;
};

export function CustomerAddressTab({
  view,
  editing,
  saving,
  cities,
  onEdit,
  onCancel,
  onSave,
  onCepFound,
  updateAddress,
}: Props) {
  const { t } = useTranslation();

  const addressString = `${view.address.street}, ${view.address.number} - ${view.address.neighborhood}, ${view.address.zipCode}`;
  const mapQuery = encodeURIComponent(addressString);

  // Espelha as constraints do AddressRequestDTO do backend (@NotBlank street,
  // @NotBlank + @Pattern zipCode, @NotNull cityId) — feedback instantâneo,
  // sem depender de round-trip pro backend pra saber que algo está errado.
  const CEP_REGEX = /^\d{5}-\d{3}$/;
  const zipCode = view.address.zipCode?.trim() ?? "";
  const street = view.address.street?.trim() ?? "";

  const zipCodeFormatError = zipCode !== "" && !CEP_REGEX.test(zipCode);
  const isAddressValid = street !== "" && CEP_REGEX.test(zipCode) && !!view.address.city?.id;

  return (
    <Grid container spacing={2} sx={{ maxWidth: 1400 }}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card
          sx={{
            borderRadius: 2,
            height: 360,
            transition: (th) => th.transitions.create("box-shadow", { duration: th.transitions.duration.short }),
            "&:hover": { boxShadow: 4 },
          }}
        >
          <CardContent>
            <EditableCardHeader
              title={t("customerDetails.address.title")}
              editing={editing}
              saving={saving}
              saveDisabled={!isAddressValid}
              onEdit={onEdit}
              onCancel={onCancel}
              onSave={onSave}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <CepTextField
                  value={view.address.zipCode ?? ""}
                  onChange={(val) => updateAddress("zipCode", val)}
                  onAddressFound={onCepFound}
                  label={t("customerDetails.address.fields.zipCode")}
                  disabled={!editing}
                  required
                  error={zipCodeFormatError}
                  helperText={zipCodeFormatError ? t("validation.cepInvalid") : undefined}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <FormControl fullWidth size="small" disabled={!editing}>
                  <InputLabel id="city-label" required>{t("customerDetails.address.fields.city")}</InputLabel>
                  <Select
                    labelId="city-label"
                    label={t("customerDetails.address.fields.city")}
                    value={view.address.city?.id ?? ""}
                    onChange={(e) =>
                      updateAddress("city", {
                        ...(view.address.city ?? { id: 0, name: "" }),
                        id: Number(e.target.value),
                        name: cities.find((c) => c.id === Number(e.target.value))?.name ?? view.address.city?.name ?? "",
                      } as City)
                    }
                  >
                    {cities.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label={t("customerDetails.address.fields.street")}
                  size="small" fullWidth disabled={!editing}
                  required
                  value={view.address.street ?? ""}
                  onChange={(e) => updateAddress("street", e.target.value)}
                  inputProps={{ maxLength: 100 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  label={t("customerDetails.address.fields.complement")}
                  size="small" fullWidth disabled={!editing}
                  value={view.address.complement ?? ""}
                  onChange={(e) => updateAddress("complement", e.target.value)}
                  inputProps={{ maxLength: 75 }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label={t("customerDetails.address.fields.number")}
                  size="small" fullWidth disabled={!editing}
                  value={view.address.number ?? ""}
                  onChange={(e) => updateAddress("number", e.target.value)}
                  inputProps={{ maxLength: 20 }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  label={t("customerDetails.address.fields.neighborhood")}
                  size="small" fullWidth disabled={!editing}
                  value={view.address.neighborhood ?? ""}
                  onChange={(e) => updateAddress("neighborhood", e.target.value)}
                  inputProps={{ maxLength: 75 }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            height: 360,
            transition: (th) => th.transitions.create("box-shadow", { duration: th.transitions.duration.short }),
            "&:hover": { boxShadow: 4 },
          }}
        >
          <Box
            component="iframe"
            title={t("customerDetails.address.mapTitle")}
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
            sx={{ border: 0, width: "100%", height: "100%", display: "block" }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </Card>
      </Grid>
    </Grid>
  );
}
