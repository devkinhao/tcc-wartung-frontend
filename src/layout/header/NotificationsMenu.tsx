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

const PAGE_SIZE = 10;

/** Rotas para onde cada tipo de notificação deve levar ao ser clicada */
function resolveNotificationLink(notification: NotificationResponseDTO): string | null {
  if (notification.referenceId == null) return null;

  switch (notification.type) {
    case "INSPECTION_NEAR_EXPIRATION":
    case "INSPECTION_EXPIRED":
      return `/inspections/${notification.referenceId}`;
    default:
      return null;
  }
}

export function NotificationsMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: qk.notificationsUnreadCount(),
    queryFn: getUnreadNotificationCount,
    refetchInterval: 60_000,
  });

  const { data, isLoading } = useQuery({
    queryKey: qk.notifications({ page: 1, pageSize: PAGE_SIZE }),
    queryFn: () => listNotifications({ page: 1, pageSize: PAGE_SIZE }),
    enabled: open,
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
              {t("notifications.empty")}
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
      </Menu>
    </>
  );
}
