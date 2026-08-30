import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { formatDateTimeBR } from "@/utils/date";

type Props = {
  createdBy: string | null;
  createdAt: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
};

/**
 * Linha discreta de auditoria (quem cadastrou / alterou e quando), no rodapé
 * de uma tela de detalhe. Substitui a antiga aba/card "Histórico".
 */
export function AuditFooter({ createdBy, createdAt, updatedBy, updatedAt }: Props) {
  const { t } = useTranslation();

  const parts: string[] = [];
  if (createdAt) {
    parts.push(t("audit.created", { by: createdBy ?? "—", at: formatDateTimeBR(createdAt) }));
  }
  if (updatedAt && updatedAt !== createdAt) {
    parts.push(t("audit.updated", { by: updatedBy ?? "—", at: formatDateTimeBR(updatedAt) }));
  }
  if (parts.length === 0) return null;

  return (
    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
      {parts.join("  ·  ")}
    </Typography>
  );
}
