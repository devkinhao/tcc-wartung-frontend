import { qk } from "@/api/keys";
import { Tooltip } from "@/components/Tooltip";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationResponseDTO,
} from "@/features/notifications/api/notifications.api";
import { resolveNotificationLink } from "@/features/notifications/utils";
import { NotificationListItem } from "@/features/notifications/components/NotificationListItem";
import { usePreferences } from "@/features/preferences/usePreferences";
import { playNotificationSound } from "@/utils/notificationSound";
import { paths } from "@/routes/paths";
import { typography } from "@/styles/typography";
import { Close, Notifications } from "@mui/icons-material";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  Fade,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Popper,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

/** Quantidade máxima de notificações exibidas na prévia — poucas o bastante pra
 * caber sem rolagem em telas baixas (1366x768), já com o cabeçalho e o botão
 * "ver todas". A mensagem agora vem em até 3 linhas (ver NotificationListItem),
 * então cada item ocupa mais altura do que antes. */
const PREVIEW_SIZE = 4;

/** Notificações varridas por rodada pra detectar chegadas novas — bem mais que a
 * prévia (4), porque aqui o que importa é não deixar nada passar batido entre uma
 * rodada e outra, não quanto cabe no popover. */
const SCAN_SIZE = 20;

const POLL_INTERVAL_MS = 30_000;

/** Exibe o menu de notificações não lidas. */
export function NotificationsMenu({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { preferences } = usePreferences();
  // Subconfiguração de SHOW_NOTIFICATIONS, opt-in (padrão desligado) — ver
  // PreferencesPage e UserService.DEFAULT_PREFERENCES.
  const soundEnabled = preferences.NOTIFICATION_SOUND_ENABLED === "true";
  // Estado (não ref) porque o Popper do aviso precisa do elemento durante a
  // renderização pra se ancorar nele — ler `ref.current` no JSX não é permitido.
  const [bellEl, setBellEl] = useState<HTMLButtonElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Aviso simples e persistente ("Nova notificação: ...") que aparece colado no sino
  // quando chega algo novo — sem abrir a lista inteira, sem cronômetro. Fica até o
  // usuário fechar (no X) ou clicar nele, que aí sim abre o menu completo.
  const [indicator, setIndicator] = useState<string | null>(null);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: qk.notificationsUnreadCount(),
    queryFn: getUnreadNotificationCount,
    enabled: !disabled,
    refetchInterval: POLL_INTERVAL_MS,
    // A configuração global desativa refetch no foco da janela; para notificações
    // vale a pena reativar aqui — voltar para a aba é um gatilho natural e muito
    // mais comum do que o usuário dar F5 manualmente.
    refetchOnWindowFocus: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: qk.notifications({
      onlyUnread: true,
      page: 1,
      pageSize: PREVIEW_SIZE,
    }),
    queryFn: () =>
      listNotifications({ onlyUnread: true, page: 1, pageSize: PREVIEW_SIZE }),
    enabled: open && !disabled,
    // Sempre busca de novo ao abrir o menu — sem isso, reabrir dentro da janela de
    // staleTime global (5 min) mostraria a lista em cache, já desatualizada.
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Varredura em segundo plano (independente do menu estar aberto) só pra saber se
  // chegou algo novo — ver `lastSeenId` abaixo. Compara pelo maior `id` já visto: como
  // os ids são sequenciais e nunca se repetem, qualquer um maior é genuinamente novo,
  // mesmo que já tenha saído da janela das `SCAN_SIZE` mais recentes até a próxima
  // rodada.
  const { data: scanData } = useQuery({
    queryKey: qk.notifications({ onlyUnread: true, page: 1, pageSize: SCAN_SIZE }),
    queryFn: () => listNotifications({ onlyUnread: true, page: 1, pageSize: SCAN_SIZE }),
    enabled: !disabled,
    refetchInterval: POLL_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  const lastSeenId = useRef<number | null>(null);

  useEffect(() => {
    if (!scanData) return;

    const maxId = scanData.content.reduce((max, n) => Math.max(max, n.id), 0);

    if (lastSeenId.current === null) {
      // Primeira carga desta sessão de aba (login, F5) — só estabelece a base, sem
      // abrir o menu sozinho pra tudo que já estava pendente de antes.
      lastSeenId.current = maxId;
      return;
    }

    const newOnes = scanData.content.filter((n) => n.id > lastSeenId.current!);
    lastSeenId.current = maxId;

    if (newOnes.length === 1) {
      setIndicator(t("notifications.indicator.single", { title: newOnes[0].title }));
    } else if (newOnes.length > 1) {
      setIndicator(t("notifications.indicator.multiple", { count: newOnes.length }));
    }

    if (newOnes.length > 0 && soundEnabled) {
      playNotificationSound();
    }
  }, [scanData, t, soundEnabled]);

  const items = data?.content ?? [];

  /** Atualiza as consultas relacionadas às notificações. */
  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: qk.notificationsAll });
    qc.invalidateQueries({ queryKey: qk.notificationsUnreadCount() });
  };

  /** Marca uma notificação como lida e atualiza os dados exibidos. */
  const { mutate: markAsRead } = useMutation({
    mutationFn: (id: number) => markNotificationAsRead(id),
    onSuccess: invalidateAll,
  });

  /** Marca todas as notificações como lidas e atualiza os dados exibidos. */
  const { mutate: markAllAsRead, isPending: markingAllAsRead } = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: invalidateAll,
  });

  /** Marca a notificação selecionada como lida e navega para seu destino. */
  const handleItemClick = (notification: NotificationResponseDTO) => {
    if (!notification.read) markAsRead(notification.id);
    setAnchorEl(null);

    const link = resolveNotificationLink(notification);
    if (link) navigate(link);
  };

  return (
    <>
      {/** Botão de notificações. */}
      <Tooltip title={t("notifications.tooltip.title")}>
        <IconButton
          ref={setBellEl}
          aria-label={t("notifications.ariaLabel")}
          onClick={(e) => {
            setIndicator(null);
            setAnchorEl(e.currentTarget);
          }}
          disabled={disabled}
        >
          <Badge
            color="error"
            badgeContent={disabled ? 0 : unreadCount}
            max={99}
          >
            <Notifications />
          </Badge>
        </IconButton>
      </Tooltip>

      {/** Aviso persistente de notificação nova — não rouba o foco de onde o usuário
          estava (não é modal) e não some sozinho; clicar nele abre o menu completo,
          o X só fecha o aviso. */}
      <Popper
        open={indicator !== null}
        anchorEl={bellEl}
        placement="bottom-end"
        transition
        sx={{ zIndex: (th) => th.zIndex.snackbar }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={200}>
            <Paper
              elevation={8}
              role="status"
              onClick={() => {
                setAnchorEl(bellEl);
                setIndicator(null);
              }}
              sx={{
                position: "relative",
                mt: 2,
                px: 2,
                py: 1.25,
                display: "flex",
                alignItems: "center",
                gap: 1,
                maxWidth: 320,
                // Raio fixo em px, não o multiplicador do tema (que aqui é bem grande,
                // 30px — pensado pra botões tipo "pílula", não pra esse balão) — com
                // ele, a ponta do rabinho caía bem em cima da curva do canto e parecia
                // flutuando, solta da bolha.
                borderRadius: "12px",
                cursor: "pointer",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                // Rabinho de balão de fala, apontando pro sino — mesma cor do fundo,
                // um quadrado rotacionado 45° "colado" na borda de cima, numa região
                // reta (fora do raio de 12px do canto).
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: -6,
                  right: 20,
                  width: 12,
                  height: 12,
                  bgcolor: "primary.main",
                  transform: "rotate(45deg)",
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {indicator}
              </Typography>
              <IconButton
                size="small"
                aria-label={t("notifications.indicator.dismiss")}
                onClick={(e) => {
                  e.stopPropagation();
                  setIndicator(null);
                }}
                sx={{ color: "inherit", ml: "auto" }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Paper>
          </Fade>
        )}
      </Popper>

      {/** Menu de notificações. */}
      <Menu
        anchorEl={anchorEl}
        open={open && !disabled}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { width: 360 } } }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1 }}
        >
          <Typography variant="subtitle2">
            {t("notifications.title")}
          </Typography>

          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={() => markAllAsRead()}
              disabled={markingAllAsRead}
            >
              {t("notifications.markAllRead")}
            </Button>
          )}
        </Stack>

        <Divider />

        {isLoading ? (
          <Box sx={{ px: 2, py: 3, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={20} />
          </Box>
        ) : items.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2" color="text.secondary">
              {t("notifications.emptyUnread")}
            </Typography>
          </MenuItem>
        ) : (
          items.map((n) => (
            <MenuItem
              key={n.id}
              onClick={() => handleItemClick(n)}
              sx={{
                whiteSpace: "normal",
                alignItems: "flex-start",
                gap: 1,
                py: 1.25,
              }}
            >
              <NotificationListItem notification={n} dense />
            </MenuItem>
          ))
        )}

        <Divider />

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            navigate(paths.notifications);
          }}
          sx={{ justifyContent: "center" }}
        >
          <Typography
            variant="body2"
            color="primary"
            fontWeight={typography.weight.semibold}
          >
            {t("notifications.viewAll")}
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
