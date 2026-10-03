import { applyMask, MASK_PLACEHOLDERS, type MaskType } from "@/utils/masks";
import type { SvgIconComponent } from "@mui/icons-material";
import {
  Box,
  Grid,
  MenuItem,
  TextField,
  type TextFieldProps,
} from "@mui/material";
import { forwardRef, type ChangeEvent, type ReactNode } from "react";
import { FormLabel } from "./FormLabel";

/** Texto de ajuda vazio que reserva a linha do erro, evitando que o campo mude de altura quando um erro aparece. */
export const EMPTY_HELPER_TEXT = " ";

export type FormFieldProps = Omit<TextFieldProps, "label"> & {
  label?: ReactNode;
  startIcon?: SvgIconComponent;
  endIcon?: ReactNode;
  /** Máscara aplicada no campo ao digitar. */
  mask?: MaskType;
  /** Em selects, o nome do item inicial é exibido com aparência de placeholder. */
  emptyOptionLabel?: ReactNode;
};

/** Campo de texto reutilizável que permite renderização de label. */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      required,
      startIcon: StartIcon,
      endIcon,
      emptyOptionLabel,
      mask,
      onChange,
      placeholder,
      children,
      ...props
    },
    ref,
  ) => {
    /** Aplica a máscara no valor do evento antes de repassá-lo ao onChange. */
    const handleChange = mask
      ? (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          event.target.value = applyMask(event.target.value, mask);
          onChange?.(event);
        }
      : onChange;

    return (
      <Grid container>
        {label && (
          <FormLabel required={required} disabled={props.disabled}>
            {label}
          </FormLabel>
        )}
        <TextField
          fullWidth
          size="small"
          margin="dense"
          ref={ref}
          required={required}
          {...props}
          onChange={handleChange}
          placeholder={
            placeholder ?? (mask ? MASK_PLACEHOLDERS[mask] : undefined)
          }
          slotProps={{
            ...props.slotProps,
            /** Máscaras são numéricas, então abre o teclado numérico em dispositivos móveis. */
            htmlInput: mask
              ? { inputMode: "numeric", ...props.slotProps?.htmlInput }
              : props.slotProps?.htmlInput,
            /** Em selects, exibe o item de valor vazio em vez de ocultá-lo. */
            select: props.select
              ? { displayEmpty: true, ...props.slotProps?.select }
              : props.slotProps?.select,
            /** Permite inserir ícones de início/fim no campo de texto. */
            input: {
              ...props.slotProps?.input,
              startAdornment: StartIcon && (
                <StartIcon
                  fontSize="small"
                  sx={{ p: 0.2, mr: 0.5, color: "action.disabled" }}
                />
              ),
              endAdornment: endIcon,
            },
          }}
          sx={{
            ...props.sx,
            "& .MuiOutlinedInput-root": {
              /** Mantém a borda do input com espessura consistente no estado normal e focado. */
              "& fieldset": { borderWidth: 1 },
              "&.Mui-focused fieldset": { borderWidth: 1 },
              /** Ajusta o fundo quando o navegador preenche o campo automaticamente. */
              "&:has(input:-webkit-autofill)": {
                backgroundColor: (theme) => theme.palette.autofill,
              },
              "& input:-webkit-autofill": {
                WebkitBoxShadow: (theme) =>
                  `0 0 0 1000px ${theme.palette.autofill} inset`,
                WebkitTextFillColor: "inherit",
              },
            },
          }}
        >
          {props.select && emptyOptionLabel && (
            <MenuItem value="">
              <Box component="span" sx={{ opacity: 0.42 }}>
                {emptyOptionLabel}
              </Box>
            </MenuItem>
          )}
          {children}
        </TextField>
      </Grid>
    );
  },
);
