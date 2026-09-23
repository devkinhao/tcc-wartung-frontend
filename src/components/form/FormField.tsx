import type { SvgIconComponent } from "@mui/icons-material";
import { Grid, TextField, type TextFieldProps } from "@mui/material";
import { forwardRef, type ReactNode } from "react";
import { FormLabel } from "./FormLabel";

export type FormFieldProps = Omit<TextFieldProps, "label"> & {
  label?: ReactNode;
  startIcon?: SvgIconComponent;
  endIcon?: ReactNode;
};

/** Campo de texto reutilizável que permite renderização de label. */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, required, startIcon: StartIcon, endIcon, ...props }, ref) => (
    <Grid container>
      {label && <FormLabel required={required}>{label}</FormLabel>}
      <TextField
        fullWidth
        size="small"
        margin="dense"
        ref={ref}
        required={required}
        {...props}
        slotProps={{
          ...props.slotProps,
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
      />
    </Grid>
  ),
);
