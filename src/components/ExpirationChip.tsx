import { Chip, Tooltip } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { getExpirationStatus } from "@/utils/expirationStatus";
import { formatDateBR } from "@/utils/date";

type Props = {
  date: string | null | undefined;
  alertDays: number;
  /** false suprime a cor mesmo se vencida/próxima (ex: inspeção inativa) */
  active?: boolean;
};

// Chip de data de vencimento no estilo "badge suave" (fundo levemente tingido
// + texto na cor). Usa a mesma paleta semântica error/warning/success da home:
// vermelho (vencida), âmbar (vence logo), verde (em dia) — o mesmo semáforo em
// todo o sistema.
export function ExpirationChip({ date, alertDays, active = true }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";

  const status = active ? getExpirationStatus(date, alertDays) : null;
  if (status == null) return <>{formatDateBR(date)}</>;

  const c =
    status === "expired" ? theme.palette.error
    : status === "near"  ? theme.palette.warning
    : theme.palette.success;

  const tooltip =
    status === "expired"
      ? t("expiration.tooltip.expired", { date: formatDateBR(date) })
      : t("expiration.tooltip.due", { date: formatDateBR(date) });

  return (
    <Tooltip title={tooltip}>
      <Chip
        size="small"
        label={formatDateBR(date)}
        sx={{
          bgcolor: alpha(c.main, dark ? 0.24 : 0.14),
          color: dark ? c.light : c.dark,
          border: `1px solid ${alpha(c.main, 0.35)}`,
          fontWeight: 600,
        }}
      />
    </Tooltip>
  );
}
