import { Autocomplete, Grid, TextField } from "@mui/material";
import { useTranslation } from "react-i18next";
import { toUpperCaseInput } from "@/utils/strings";
import {
  CAPACITY_UNIT_KEY,
  getServiceFields,
  MANUFACTURER_SUGGESTIONS,
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
};

const NUMERIC_FIELDS = new Set<EquipmentFieldKey>(["capacity", "cylinderCount", "btu"]);

/** Texto livre gravado em caixa alta pelo backend — o campo já mostra assim ao digitar. */
const UPPERCASE_FIELDS = new Set<EquipmentFieldKey>(["manufacturer", "model"]);

/**
 * Campos de equipamento da inspeção — só os aplicáveis ao serviço escolhido
 * aparecem (ver `serviceCategory.ts`). Usado por criar/editar/renovar
 * inspeção, entre o campo de ART e o de observações.
 *
 * Quando a categoria tem fabricantes conhecidos (ver `MANUFACTURER_SUGGESTIONS`),
 * o campo de fabricante sugere-os enquanto se digita, sem impedir outro nome.
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
        const unitKey = field === "capacity" && category ? CAPACITY_UNIT_KEY[category] : undefined;
        const label = unitKey
          ? `${t(`inspectionDetails.fields.${field}`)} (${t(unitKey)})`
          : t(`inspectionDetails.fields.${field}`);
        const textFieldProps = {
          label,
          size: "small",
          fullWidth: true,
          required: required.includes(field),
          error: !!error,
          helperText: error ? t(error) : undefined,
        } as const;
        const toFieldValue = (value: string) => (UPPERCASE_FIELDS.has(field) ? toUpperCaseInput(value) : value);
        const suggestions = field === "manufacturer" && category ? MANUFACTURER_SUGGESTIONS[category] : undefined;

        return (
          <Grid key={field} size={{ xs: 12, md: mdWidth }}>
            {suggestions ? (
              // Só o texto é controlado: controlar também `value` com o texto
              // digitado faria o Autocomplete parar de filtrar as opções.
              <Autocomplete
                freeSolo
                options={suggestions}
                inputValue={values[field]}
                onInputChange={(_, value) => onChange(field, toFieldValue(value))}
                disabled={disabled}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    {...textFieldProps}
                    slotProps={{ htmlInput: { ...params.inputProps, maxLength: MAX_LENGTH[field] } }}
                  />
                )}
              />
            ) : (
              <TextField
                {...textFieldProps}
                type={NUMERIC_FIELDS.has(field) ? "number" : "text"}
                value={values[field]}
                onChange={(e) => onChange(field, toFieldValue(e.target.value))}
                disabled={disabled}
                slotProps={{
                  htmlInput: NUMERIC_FIELDS.has(field) ? { min: 1 } : { maxLength: MAX_LENGTH[field] },
                }}
              />
            )}
          </Grid>
        );
      })}
    </Grid>
  );
}
