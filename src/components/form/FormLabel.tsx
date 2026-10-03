import { Box, Typography, type TypographyProps } from "@mui/material";
import { forwardRef, type ReactNode } from "react";

export type FormLabelProps = Omit<TypographyProps, "children"> & {
  children: ReactNode;
  /** Exibe o asterisco de campo obrigatório. */
  required?: boolean;
  /** Esmaece o texto e o asterisco, para acompanhar campos desabilitados. */
  disabled?: boolean;
};

/** Rótulo exibido acima de um campo de formulário, com asterisco quando o campo é obrigatório. */
export const FormLabel = forwardRef<HTMLSpanElement, FormLabelProps>(
  ({ children, required = false, disabled = false, sx, ...props }, ref) => (
    <Typography
      ref={ref}
      {...props}
      sx={[
        disabled && { color: "text.disabled" },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
      {required && (
        <Box
          component="span"
          sx={{ color: disabled ? "text.disabled" : "error.main" }}
        >
          {" *"}
        </Box>
      )}
    </Typography>
  ),
);
