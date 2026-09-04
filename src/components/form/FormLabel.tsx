/** MUI Material. */
import { Typography, useTheme, type TypographyProps } from "@mui/material";
/** React. */
import { forwardRef, type ReactNode } from "react";

/** Props para o componente. */
export type FormLabelProps = Omit<TypographyProps, "children"> & {
  children: ReactNode;
  required?: boolean;
};

/** Label personalizada. */
export const FormLabel = forwardRef<HTMLSpanElement, FormLabelProps>(
  ({ children, required = false, ...props }, ref) => {
    /** Hooks. */
    const theme = useTheme();

    return (
      <Typography ref={ref} {...props}>
        {children}
        {required && (
          <span style={{ color: theme.palette.error.main }}> *</span>
        )}
      </Typography>
    );
  },
);
