import type { NotificationResponseDTO } from "./api/notifications.api";
import { paths } from "@/routes/paths";

/** Rotas para onde cada tipo de notificação deve levar ao ser clicada */
export function resolveNotificationLink(notification: NotificationResponseDTO): string | null {
  if (notification.referenceId == null) return null;

  switch (notification.type) {
    case "INSPECTION_NEAR_EXPIRATION":
    case "INSPECTION_EXPIRED":
      return paths.inspectionDetails(notification.referenceId);
    default:
      return null;
  }
}
