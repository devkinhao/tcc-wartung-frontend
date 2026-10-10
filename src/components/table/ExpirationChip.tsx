import { formatDateBR } from "@/utils/date";
import {
  getExpirationStatus,
  type ExpirationStatus,
} from "@/utils/expirationStatus";
import { Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { Tooltip } from "../Tooltip";

type ExpirationChipProps = {
  date: string | null | undefined;
  /** Quantidade de dias antes do vencimento em que a data passa a ser destacada. */
  alertDays: number;
  /** Quando falso, exibe a data sem destaque, mesmo se vencida ou próxima. */
  active?: boolean;
};

/** Cor da paleta do tema para cada situação do vencimento. */
const STATUS_COLOR = {
  expired: "error",
  near: "warning",
  ok: "success",
} as const satisfies Record<ExpirationStatus, string>;

/** Data de vencimento em um chip de fundo suave, colorido conforme a situação. */
export function ExpirationChip({
  date,
  alertDays,
  active = true,
}: ExpirationChipProps) {
  /** Hooks. */
  const { t } = useTranslation();

  /** Data formatada. */
  const formattedDate = formatDateBR(date);

  /** Status do vencimento com base na data e nos dias de alerta. */
  const status = active ? getExpirationStatus(date, alertDays) : null;

  /** Sem destaque, mostra apenas a data. */
  if (status == null) return <>{formattedDate}</>;

  /** Chave para o tooltip com base no status. */
  const tooltipKey =
    status === "expired"
      ? "expiration.tooltip.expired"
      : "expiration.tooltip.due";

  return (
    <Tooltip title={t(tooltipKey, { date: formattedDate })} placement="left">
      <Chip
        size="small"
        label={formattedDate}
        sx={({ palette }) => {
          const color = palette[STATUS_COLOR[status]];
          return {
            bgcolor: alpha(color.main, 0.2),
            color: palette.mode === "dark" ? color.light : color.dark,
          };
        }}
      />
    </Tooltip>
  );
}
