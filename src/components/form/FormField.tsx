/** MUI Material. */
import { Grid, TextField, type TextFieldProps } from "@mui/material";
/** React. */
import { forwardRef, type ReactNode } from "react";
/** Componentes. */
import { FormLabel } from "./FormLabel";

/** Props para o componente. */
export type FormFieldProps = Omit<TextFieldProps, "label"> & {
  label?: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
};

/** Campo de texto personalizado, com e sem label. */
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, required, startIcon, endIcon, ...props }, ref) => (
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
          input: {
            ...props.slotProps?.input,
            startAdornment: startIcon,
            endAdornment: endIcon,
          },
        }}
        sx={{
          ...props.sx,
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderWidth: 1 },
            "&.Mui-focused fieldset": { borderWidth: 1 },
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
