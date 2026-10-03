import type { NotificationResponseDTO } from "./api/notifications.api";
import { paths } from "@/routes/paths";

/** Rotas para onde cada tipo de notificação deve levar ao ser clicada */
export function resolveNotificationLink(notification: NotificationResponseDTO): string | null {
  if (notification.referenceId == null) return null;

  switch (notification.type) {
    case "INSPECTION_NEAR_EXPIRATION":
    case "INSPECTION_EXPIRED":
      return paths.inspectionDetails(notification.referenceId);
    // Lembrete não tem página própria — a Home é onde ele aparece (widget +
    // cards soltos), com ou sem empresa/inspeção vinculada.
    case "REMINDER_DUE_SOON":
    case "REMINDER_OVERDUE":
      return paths.home;
    default:
      return null;
  }
}

export type NotificationSeverity = "overdue" | "upcoming" | null;

const OVERDUE_TYPES = new Set(["INSPECTION_EXPIRED", "REMINDER_OVERDUE"]);
const UPCOMING_TYPES = new Set(["INSPECTION_NEAR_EXPIRATION", "REMINDER_DUE_SOON"]);

/** Urgência do tipo de notificação — mesmo semáforo error/warning usado no
 * `ExpirationChip` (inspeção vencida/lembrete vencido = vermelho; próximo do
 * vencimento = âmbar). `null` pra um tipo futuro que não se refira a vencimento. */
export function notificationSeverity(type: string): NotificationSeverity {
  if (OVERDUE_TYPES.has(type)) return "overdue";
  if (UPCOMING_TYPES.has(type)) return "upcoming";
  return null;
}
