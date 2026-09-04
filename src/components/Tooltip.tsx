/** Estilização. */
import { typography } from "@/styles/typography";
/** MUI Material. */
import {
  Tooltip as MuiTooltip,
  type TooltipProps as MuiTooltipProps,
} from "@mui/material";
/** React. */
import { forwardRef, type ReactElement, type ReactNode } from "react";

/** Props para o componente. */
export type TooltipProps = Omit<MuiTooltipProps, "children" | "slotProps"> & {
  title: ReactNode;
  children: ReactElement;
};

/** Tooltip personalizada. */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(
  ({ title, children, ...props }, ref) => (
    <MuiTooltip
      disableInteractive
      ref={ref}
      title={title}
      {...props}
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: "background.paper",
            color: "text.secondary",
            boxShadow: 3,
            fontSize: typography.size.chartTooltip,
          },
        },
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
