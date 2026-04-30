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
import type { CustomerDetailResponseDTO, CityResponseDTO } from "../../types/customerDetail";
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
  updateAddress,
}: Props) {
  const { t } = useTranslation();

  const addressString = `${view.address.street}, ${view.address.number} - ${view.address.neighborhood}, ${view.address.zipCode}`;
  const mapQuery = encodeURIComponent(addressString);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
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
              onEdit={onEdit}
              onCancel={onCancel}
              onSave={onSave}
            />

            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  label={t("customerDetails.address.fields.zipCode")}
                  size="small"
                  fullWidth
                  disabled={!editing}
                  value={view.address.zipCode ?? ""}
                  onChange={(e) => updateAddress("zipCode", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={8}>
                <FormControl fullWidth size="small" disabled={!editing}>
                  <InputLabel id="city-label">{t("customerDetails.address.fields.city")}</InputLabel>
                  <Select
                    labelId="city-label"
                    label={t("customerDetails.address.fields.city")}
                    value={view.address.city?.id ?? ""}
                    onChange={(e) =>
                      updateAddress("city", {
                        ...(view.address.city ?? { id: 0, name: "" }),
                        id: Number(e.target.value),
                        name: cities.find((c) => c.id === Number(e.target.value))?.name ?? view.address.city?.name ?? "",
                      } as CityResponseDTO)
                    }
                  >
                    {cities.map((c) => (
                      <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label={t("customerDetails.address.fields.street")}
                  size="small" fullWidth disabled={!editing}
                  value={view.address.street ?? ""}
                  onChange={(e) => updateAddress("street", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  label={t("customerDetails.address.fields.complement")}
                  size="small" fullWidth disabled={!editing}
                  value={view.address.complement ?? ""}
                  onChange={(e) => updateAddress("complement", e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  label={t("customerDetails.address.fields.number")}
                  size="small" fullWidth disabled={!editing}
                  value={view.address.number ?? ""}
                  onChange={(e) => updateAddress("number", e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label={t("customerDetails.address.fields.neighborhood")}
                  size="small" fullWidth disabled={!editing}
                  value={view.address.neighborhood ?? ""}
                  onChange={(e) => updateAddress("neighborhood", e.target.value)}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
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
