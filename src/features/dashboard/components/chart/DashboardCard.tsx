import { Card, CardContent, Typography } from "@mui/material";
import type { ReactNode } from "react";

type Props = {
  title: string;
  /** Linha de apoio abaixo do título (ex: "próximos 12 meses"). */
  subtitle?: string;
  /** Card ocupa 100% da altura da célula do grid (padrão). Desligue em cards de largura total. */
  fullHeight?: boolean;
  children: ReactNode;
};

/** Casca comum dos cards do dashboard: título, subtítulo opcional e realce sutil no hover. */
export function DashboardCard({ title, subtitle, fullHeight = true, children }: Props) {
  return (
    <Card
      sx={{
        ...(fullHeight ? { height: "100%" } : {}),
        transition: (t) => t.transitions.create("box-shadow"),
        "&:hover": { boxShadow: 4 },
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" color="text.primary" gutterBottom={!subtitle}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            {subtitle}
          </Typography>
        ) : null}
        {children}
      </CardContent>
    </Card>
  );
}
