import { api } from "@/api/client";
import { qk } from "@/api/keys";
import { getDashboard } from "@/features/dashboard/api/dashboard.api";
import { getUnreadNotificationCount } from "@/features/notifications/api/notifications.api";
import type { ChatMenuOption } from "./chatMenu";

type CustomersCountResponse = {
  page: { totalElements: number };
};

async function fetchCustomersTotal(): Promise<number> {
  const { data } = await api.get<CustomersCountResponse>("/customers", {
    params: { page: 0, size: 1, isCustomer: true },
  });
  return data.page.totalElements;
}

export const dataActions: ChatMenuOption[] = [
  {
    id: "data-inspections-expired",
    kind: "action",
    labelKey: "chatbot.menu.actions.inspectionsExpired",
    respond: async ({ queryClient, t }) => {
      const data = await queryClient.fetchQuery({
        queryKey: qk.dashboard(),
        queryFn: getDashboard,
      });
      return t("chatbot.responses.inspectionsExpired", {
        count: data.inspectionStatus.expired,
      });
    },
  },
  {
    id: "data-inspections-near",
    kind: "action",
    labelKey: "chatbot.menu.actions.inspectionsNear",
    respond: async ({ queryClient, t }) => {
      const data = await queryClient.fetchQuery({
        queryKey: qk.dashboard(),
        queryFn: getDashboard,
      });
      return t("chatbot.responses.inspectionsNear", {
        count: data.inspectionStatus.nearExpiration,
      });
    },
  },
  {
    id: "data-inspections-ontrack",
    kind: "action",
    labelKey: "chatbot.menu.actions.inspectionsOnTrack",
    respond: async ({ queryClient, t }) => {
      const data = await queryClient.fetchQuery({
        queryKey: qk.dashboard(),
        queryFn: getDashboard,
      });
      return t("chatbot.responses.inspectionsOnTrack", {
        count: data.inspectionStatus.onTrack,
      });
    },
  },
  {
    id: "data-notifications-unread",
    kind: "action",
    labelKey: "chatbot.menu.actions.notificationsUnread",
    respond: async ({ queryClient, t }) => {
      const count = await queryClient.fetchQuery({
        queryKey: qk.notificationsUnreadCount(),
        queryFn: getUnreadNotificationCount,
      });
      return t("chatbot.responses.notificationsUnread", { count });
    },
  },
  {
    id: "data-customers-total",
    kind: "action",
    labelKey: "chatbot.menu.actions.customersTotal",
    respond: async ({ queryClient, t }) => {
      const count = await queryClient.fetchQuery({
        queryKey: qk.customers({ page: 1, pageSize: 1, isCustomer: true }),
        queryFn: fetchCustomersTotal,
      });
      return t("chatbot.responses.customersTotal", { count });
    },
  },
];
