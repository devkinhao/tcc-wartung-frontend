import { Chip } from "@mui/material";
import { EXPIRATION_COLORS, getExpirationStatus } from "@/utils/expirationStatus";
import { formatDateBR } from "@/utils/date";

type Props = {
  date: string | null | undefined;
  alertDays: number;
  /** false suprime a cor mesmo se vencida/próxima (ex: inspeção inativa) */
  active?: boolean;
};

// Chip de data de vencimento com cor de alerta — mesma regra usada nas
// tabelas de Empresas e Inspeções: vermelho sólido se vencida, âmbar se
// vence dentro da janela de alerta configurada, texto simples caso contrário.
export function ExpirationChip({ date, alertDays, active = true }: Props) {
  const status = active ? getExpirationStatus(date, alertDays) : null;
  const color = status === "expired" ? EXPIRATION_COLORS.expired
              : status === "near"    ? EXPIRATION_COLORS.near
              : null;

  if (!color) return <>{formatDateBR(date)}</>;

  return (
    <Chip
      size="small"
      label={formatDateBR(date)}
      sx={{
        bgcolor: color,
        color: status === "expired" ? "#fff" : "#000",
        fontWeight: 600,
      }}
    />
  );
}
