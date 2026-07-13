import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import { Notifications } from "@mui/icons-material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { qk } from "@/api/keys";
import { formatDateTimeBR } from "@/utils/date";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationResponseDTO,
} from "@/features/notifications/api/notifications.api";
import { resolveNotificationLink } from "@/features/notifications/utils";
import { paths } from "@/routes/paths";

const PREVIEW_SIZE = 5;

export function NotificationsMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: qk.notificationsUnreadCount(),
    queryFn: getUnreadNotificationCount,
    refetchInterval: 30_000,
    // A configuração global desativa refetch no foco da janela; para notificações
    // vale a pena reativar aqui — voltar para a aba é um gatilho natural e muito
    // mais comum do que o usuário dar F5 manualmente.
    refetchOnWindowFocus: true,
  });

  const { data, isLoading } = useQuery({
    queryKey: qk.notifications({ onlyUnread: true, page: 1, pageSize: PREVIEW_SIZE }),
    queryFn: () => listNotifications({ onlyUnread: true, page: 1, pageSize: PREVIEW_SIZE }),
    enabled: open,
    // Sempre busca de novo ao abrir o menu — sem isso, reabrir dentro da janela de
    // staleTime global (5 min) mostraria a lista em cache, já desatualizada.
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const items = data?.content ?? [];

  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: qk.notificationsUnreadCount() });
  };

  const { mutate: markAsRead } = useMutation({
    mutationFn: (id: number) => markNotificationAsRead(id),
    onSuccess: invalidateAll,
  });

  const { mutate: markAllAsRead, isPending: markingAllAsRead } = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: invalidateAll,
  });

  const handleItemClick = (notification: NotificationResponseDTO) => {
    if (!notification.read) markAsRead(notification.id);
    setAnchorEl(null);

    const link = resolveNotificationLink(notification);
    if (link) navigate(link);
  };

  return (
    <>
      <IconButton
        aria-label={t("notifications.ariaLabel")}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="large"
      >
        <Badge color="error" badgeContent={unreadCount} max={99}>
          <Notifications />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { width: 360 } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {t("notifications.title")}
          </Typography>

          {unreadCount > 0 && (
            <Button size="small" onClick={() => markAllAsRead()} disabled={markingAllAsRead}>
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
              sx={{ whiteSpace: "normal", alignItems: "flex-start", gap: 1, py: 1.25 }}
            >
              <Box
                sx={{
                  mt: 0.75,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  flexShrink: 0,
                  bgcolor: n.read ? "transparent" : "primary.main",
                }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={n.read ? 400 : 700} noWrap>
                  {n.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                  {n.message}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {formatDateTimeBR(n.createdAt)}
                </Typography>
              </Box>
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
          <Typography variant="body2" color="primary" fontWeight={600}>
            {t("notifications.viewAll")}
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}
