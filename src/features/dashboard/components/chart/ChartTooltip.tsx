import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { typography } from "@/styles/typography";

type Props = {
  /** Rótulo da categoria (nome do serviço, mês, cidade...). */
  label?: ReactNode;
  value: ReactNode;
  /** Sufixo do valor (ex: "inspeções", "clientes"). */
  unit?: string;
};

/** Balão de tooltip compartilhado pelos gráficos do dashboard (recharts `content`). */
export function ChartTooltip({ label, value, unit }: Props) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        border: (t) => `1px solid ${t.palette.divider}`,
        borderRadius: 1,
        px: 1.5,
        py: 1,
      }}
    >
      {label ? (
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
      ) : null}
      <Typography variant="body2" fontWeight={typography.weight.semibold}>
        {value}
        {unit ? ` ${unit}` : ""}
      </Typography>
    </Box>
  );
}
