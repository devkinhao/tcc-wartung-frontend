import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  type DialogProps,
} from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "./Tooltip";

export type ModalProps = Omit<DialogProps, "title" | "onClose"> & {
  open: boolean;
  onClose?: () => void;
  /** Título exibido no cabeçalho do modal, ao lado do botão de fechar. */
  title?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

/** Modal padrão do sistema com título, botão de fechar, conteúdo e rodapé de ações opcionais. */
export function Modal({
  open,
  onClose,
  title,
  actions,
  children,
  ...props
}: ModalProps) {
  /** Hooks. */
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" {...props}>
      {title && (
        <DialogTitle
          variant="h4"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            p: 3,
          }}
        >
          {title}
          {onClose && (
            <Tooltip title={t("common.actions.close")}>
              <IconButton
                onClick={onClose}
                aria-label={t("common.actions.close")}
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </DialogTitle>
      )}
      <DialogContent>{children}</DialogContent>
      {actions && (
        <DialogActions sx={{ px: 3, pb: 3, alignSelf: "center" }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
