import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
  type DialogProps,
} from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Tooltip } from "./Tooltip";

export type ModalProps = Omit<DialogProps, "title" | "onClose"> & {
  open: boolean;
  onClose?: () => void;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
};

/** Modal padrão do sistema com título, descrição, botão de fechar, conteúdo e rodapé de ações opcionais. */
export function Modal({
  open,
  onClose,
  title,
  description,
  actions,
  children,
  ...props
}: ModalProps) {
  /** Hooks. */
  const { t } = useTranslation();

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs" {...props}>
      <>
        <Stack direction="row" sx={{ px: 3, pt: 3 }}>
          <Stack direction="column" sx={{ flex: 1 }}>
            <DialogTitle variant="h4" sx={{ p: 0, pb: 1 }}>
              {title}
            </DialogTitle>
            {description && (
              <Typography variant="body2" color="text.secondary" sx={{ pb: 1 }}>
                {description}
              </Typography>
            )}
          </Stack>
          {/** Botão de fechar fixo no canto superior direito. */}
          {onClose && (
            <Tooltip title={t("common.actions.close")}>
              <IconButton
                size="small"
                aria-label={t("common.actions.close")}
                onClick={onClose}
                sx={{ alignSelf: "flex-start" }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </>
      <DialogContent>{children}</DialogContent>
      {actions && (
        <DialogActions sx={{ px: 3, pb: 3, pt: 0, justifyContent: "center" }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
