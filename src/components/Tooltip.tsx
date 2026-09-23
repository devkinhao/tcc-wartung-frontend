import { typography } from "@/styles/typography";
import {
  Tooltip as MuiTooltip,
  type TooltipProps as MuiTooltipProps,
} from "@mui/material";
import { forwardRef, type ReactElement, type ReactNode } from "react";

export type TooltipProps = Omit<MuiTooltipProps, "children" | "slotProps"> & {
  title: ReactNode;
  children: ReactElement;
};

/** Tooltip com aparência padronizada do design system, substituindo o estilo padrão do MUI. */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(
  ({ title, children, ...props }, ref) => (
    <MuiTooltip
      disableInteractive
      ref={ref}
      title={title}
      {...props}
      slotProps={{
        /** Fundo, cor de texto e tamanho de fonte padronizados para todas as tooltips do sistema. */
        tooltip: {
          sx: {
            fontSize: typography.textScale.xs,
            bgcolor: "background.paper",
            color: "text.secondary",
            boxShadow: 3,
          },
        },
        /** Aproxima a tooltip do elemento âncora, compensando o espaçamento padrão do MUI. */
        popper: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, -7],
              },
            },
          ],
        },
      }}
    >
      {children}
    </MuiTooltip>
  ),
);
