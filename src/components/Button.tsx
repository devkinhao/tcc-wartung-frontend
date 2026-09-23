import {
  Button as MuiButton,
  type ButtonProps as MuiButtonProps,
} from "@mui/material";
import { forwardRef } from "react";
import { Tooltip } from "./Tooltip";

export type ButtonProps = MuiButtonProps & {
  tooltip: string;
};

/** Botão padrão da aplicação para ações principais, com tooltip. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ tooltip, variant = "contained", ...props }, ref) => {
    return (
      <Tooltip title={tooltip}>
        <MuiButton ref={ref} variant={variant} {...props} />
      </Tooltip>
    );
  },
);
