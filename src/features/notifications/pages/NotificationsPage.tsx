import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { qk } from "@/api/keys";
import { Pagination } from "@/components/Pagination";
import { formatDateTimeBR } from "@/utils/date";
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationResponseDTO,
} from "../api/notifications.api";
import { resolveNotificationLink } from "../utils";

type FilterKey = "unread" | "all";

export default function NotificationsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [filter, setFilter] = useState<FilterKey>("unread");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading } = useQuery({
    queryKey: qk.notifications({ onlyUnread: filter === "unread", page, pageSize }),
    queryFn: () => listNotifications({ onlyUnread: filter === "unread", page, pageSize }),
    placeholderData: (prev) => prev,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const items = data?.content ?? [];
  const total = data?.page.totalElements ?? 0;

  const { data: unreadCount = 0 } = useQuery({
    queryKey: qk.notificationsUnreadCount(),
    queryFn: getUnreadNotificationCount,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

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

  function handleFilterChange(value: FilterKey) {
    setFilter(value);
    setPage(1);
  }

  function handleItemClick(notification: NotificationResponseDTO) {
    if (!notification.read) markAsRead(notification.id);

    const link = resolveNotificationLink(notification);
    if (link) navigate(link);
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600} color="primary.main">
            {t("notifications.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("notifications.description")}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          onClick={() => markAllAsRead()}
          disabled={markingAllAsRead || unreadCount === 0}
        >
          {t("notifications.markAllRead")}
        </Button>
      </Stack>

      <Tabs
        value={filter}
        onChange={(_, v) => handleFilterChange(v)}
        sx={{ mb: 2, borderBottom: (th) => `1px solid ${th.palette.divider}` }}
      >
        <Tab value="unread" label={t("notifications.filters.unread")} />
        <Tab value="all" label={t("notifications.filters.all")} />
      </Tabs>

      <Box sx={{ border: (th) => `1px solid ${th.palette.divider}`, borderRadius: 2, overflow: "hidden", bgcolor: "background.paper" }}>
        {isLoading ? (
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="center" sx={{ py: 4 }}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              {t("common.loading")}
            </Typography>
          </Stack>
        ) : items.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
            {filter === "unread" ? t("notifications.emptyUnread") : t("notifications.empty")}
          </Typography>
        ) : (
          items.map((n, index) => (
            <Box
              key={n.id}
              onClick={() => handleItemClick(n)}
              sx={{
                display: "flex",
                gap: 1.5,
                alignItems: "flex-start",
                px: 2,
                py: 1.5,
                cursor: "pointer",
                borderTop: index === 0 ? "none" : (th) => `1px solid ${th.palette.divider}`,
                "&:hover": { bgcolor: "action.hover" },
              }}
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
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" fontWeight={n.read ? 400 : 700}>
                  {n.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {n.message}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  {formatDateTimeBR(n.createdAt)}
                </Typography>
              </Box>
            </Box>
          ))
        )}
      </Box>

      <Box sx={{ mt: 1 }}>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </Box>
    </Paper>
  );
}
