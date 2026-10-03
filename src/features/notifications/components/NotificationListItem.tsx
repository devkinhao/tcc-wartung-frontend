import { Box, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { Tooltip } from "@/components/Tooltip";
import { typography } from "@/styles/typography";
import { daysFromToday, formatDateBR, formatDateTimeBR, formatTimeBR } from "@/utils/date";
import type { NotificationResponseDTO } from "../api/notifications.api";
import { notificationSeverity } from "../utils";

/** Mesmo semáforo error/warning do `ExpirationChip` — vermelho vencido, âmbar próximo.
 * `primary.main` é o fallback pra um tipo futuro sem urgência definida. */
const DOT_COLOR: Record<NonNullable<ReturnType<typeof notificationSeverity>> | "default", string> = {
  overdue: "error.main",
  upcoming: "warning.main",
  default: "primary.main",
};

type Props = {
  notification: NotificationResponseDTO;
  /** Prévia no menu do sininho: título trunca numa linha só, pra caber num popover estreito. */
  dense?: boolean;
};

/** Versão compacta pro menu: só a hora quando chegou hoje — mostrar "14:30" de algo
 * que chegou ontem ou há semanas parece recém-chegado. Fora de hoje, mostra a data
 * (sem hora, pra caber no espaço apertado do popover). */
function denseTimestamp(createdAt: string): string {
  return daysFromToday(createdAt) === 0 ? formatTimeBR(createdAt) : formatDateBR(createdAt);
}

/**
 * Conteúdo de uma notificação — bolinha de não lida, título com a data de recebimento
 * alinhada à direita na mesma linha (padrão comum em lista de notificações), e a
 * mensagem logo abaixo, em até 3 linhas (texto do lembrete/inspeção, empresa vinculada
 * quando houver, e a data/hora de vencimento — ver NotificationScheduler). Usado tanto
 * no menu do sininho (`NotificationsMenu`) quanto na listagem completa
 * (`NotificationsPage`), cada um com seu próprio container clicável.
 *
 * No menu (`dense`), o popover é estreito (360px) e a prévia mostra poucos itens pra
 * caber na tela sem rolar — então cada linha trunca numa só, em vez de quebrar e
 * esticar o item; passar o mouse mostra a mensagem completa num tooltip. "Recebida em
 * dd/MM/yyyy HH:mm" inteiro também espremia o título; mostra só a hora quando é de
 * hoje (ver `denseTimestamp`), senão a data. A versão completa, sem truncar nada, fica
 * pra tela cheia de notificações.
 */
export function NotificationListItem({ notification, dense = false }: Props) {
  const { t } = useTranslation();
  const severity = notificationSeverity(notification.type);
  const messageLines = notification.message.split("\n");

  const message = (
    <Box>
      {messageLines.map((line, i) => (
        <Typography key={i} variant="body2" color="text.secondary" noWrap={dense} sx={{ display: "block" }}>
          {line}
        </Typography>
      ))}
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          mt: 0.75,
          width: 8,
          height: 8,
          borderRadius: "50%",
          flexShrink: 0,
          bgcolor: notification.read ? "transparent" : DOT_COLOR[severity ?? "default"],
        }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" spacing={1} alignItems="baseline" justifyContent="space-between">
          <Typography
            variant="body2"
            fontWeight={notification.read ? typography.weight.regular : typography.weight.bold}
            noWrap={dense}
            sx={{ minWidth: 0 }}
          >
            {notification.title}
          </Typography>

          <Typography variant="caption" color="text.disabled" sx={{ flexShrink: 0, whiteSpace: "nowrap" }}>
            {dense
              ? denseTimestamp(notification.createdAt)
              : t("notifications.receivedAt", { date: formatDateTimeBR(notification.createdAt) })}
          </Typography>
        </Stack>

        {dense ? (
          <Tooltip title={<Box sx={{ whiteSpace: "pre-line" }}>{notification.message}</Box>}>
            {message}
          </Tooltip>
        ) : (
          message
        )}
      </Box>
    </>
  );
}
