import { api } from "@/api/client";
import { type SpringPage, toSpringPageParams } from "@/api/pagination";

export type NotificationResponseDTO = {
  id: number;
  type: string;
  title: string;
  message: string;
  referenceId: number | null;
  read: boolean;
  createdAt: string; // ISO date-time
};

export async function listNotifications(params: {
  onlyUnread?: boolean;
  page: number;
  pageSize: number;
}) {
  const { data } = await api.get<SpringPage<NotificationResponseDTO>>("/notifications", {
    params: {
      onlyUnread: params.onlyUnread || undefined,
      ...toSpringPageParams({ page: params.page, size: params.pageSize }),
    },
  });
  return data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { data } = await api.get<{ count: number }>("/notifications/unread-count");
  return data.count;
}

export async function markNotificationAsRead(id: number) {
  await api.patch(`/notifications/${id}/read`);
}

export async function markAllNotificationsAsRead() {
  await api.patch("/notifications/read-all");
}
