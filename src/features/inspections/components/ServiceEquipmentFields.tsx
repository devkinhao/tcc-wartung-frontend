import { Grid, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import {
  getServiceFields,
  type EquipmentFieldKey,
  type EquipmentFieldValues,
  type ServiceCategory,
} from "../serviceCategory";

type Props = {
  category: ServiceCategory | null | undefined;
  values: EquipmentFieldValues;
  onChange: (field: EquipmentFieldKey, value: string) => void;
  disabled?: boolean;
  errors?: Partial<Record<EquipmentFieldKey, string>>;
};

const MAX_LENGTH: Partial<Record<EquipmentFieldKey, number>> = {
  manufacturer: 60,
  model: 60,
  capacity: 30,
};

const NUMERIC_FIELDS = new Set<EquipmentFieldKey>(["cylinderCount", "btu"]);

/**
 * Campos de equipamento da inspeção — só os aplicáveis ao serviço escolhido
 * aparecem (ver `serviceCategory.ts`). Usado por criar/editar/renovar
 * inspeção, entre o campo de ART e o de observações.
 */
export function ServiceEquipmentFields({ category, values, onChange, disabled = false, errors = {} }: Props) {
  const { t } = useTranslation();

  const { fields, required } = getServiceFields(category);
  if (fields.length === 0) return null;

  const mdWidth = fields.length === 1 ? 6 : fields.length === 2 ? 6 : 4;

  return (
    <Grid container spacing={2}>
      {fields.map((field) => {
        const error = errors[field];
        return (
          <Grid key={field} size={{ xs: 12, md: mdWidth }}>
            <TextField
              label={t(`inspectionDetails.fields.${field}`)}
              size="small"
              fullWidth
              required={required.includes(field)}
              type={NUMERIC_FIELDS.has(field) ? "number" : "text"}
              value={values[field]}
              onChange={(e) => onChange(field, e.target.value)}
              disabled={disabled}
              error={!!error}
              helperText={error ? t(error) : undefined}
              slotProps={{
                htmlInput: NUMERIC_FIELDS.has(field) ? { min: 1 } : { maxLength: MAX_LENGTH[field] },
              }}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}
