import type { SvgIconComponent } from "@mui/icons-material";
import {
  Button as MuiButton,
  type ButtonProps as MuiButtonProps,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/system";
import { forwardRef } from "react";
import { Tooltip } from "../Tooltip";

export type ButtonProps = Omit<MuiButtonProps, "sx" | "startIcon"> & {
  tooltip: string;
  startIcon?: SvgIconComponent;
  sx?: SxProps<Theme>;
};

/** Botão padrão da aplicação para ações principais, com tooltip. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { tooltip, variant = "contained", sx, startIcon: StartIcon, ...props },
    ref,
  ) => {
    return (
      <Tooltip title={tooltip}>
        <MuiButton
          ref={ref}
          variant={variant}
          startIcon={StartIcon && <StartIcon fontSize="small" />}
          sx={{
            whiteSpace: "nowrap",
            color: variant === "text" ? "text.secondary" : "text.contrast",
            ...sx,
          }}
          {...props}
        />
      </Tooltip>
    );
  },
);
