import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { Modal, type ModalProps } from "./Modal";
import { Button, type ButtonProps } from "./button/Button";

export type ConfirmModalAction = Pick<
  ButtonProps,
  "variant" | "color" | "startIcon" | "endIcon" | "onClick" | "disabled"
> & {
  label: string;
  /** Texto exibido na tooltip do botão. */
  tooltip: string;
};

export type ConfirmModalProps = Omit<ModalProps, "actions" | "children"> & {
  /** Mensagem centralizada abaixo do cabeçalho. */
  message?: ReactNode;
  /** Ações do rodapé, sendo uma só centralizada e com espaço no meio em caso de duas. */
  actions: ConfirmModalAction[];
};

/** Variante padrão do botão pela posição, em que a primeira é secundária e a última é a principal. */
function defaultVariant(index: number, total: number): ButtonProps["variant"] {
  if (total === 1 || index === total - 1) return "contained";
  return index === 0 ? "text" : "outlined";
}

/** Modal padrão de confirmação ou aviso, com título, descrição, mensagem e ações configuráveis. */
export function ConfirmModal({
  message,
  actions,
  ...props
}: ConfirmModalProps) {
  const buttons = actions.map(({ label, ...action }, index) => (
    <Button
      key={label}
      variant={defaultVariant(index, actions.length)}
      {...action}
    >
      {label}
    </Button>
  ));

  const [first, ...rest] = buttons;

  return (
    <Modal
      {...props}
      actions={
        actions.length === 1 ? (
          <Box
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            {first}
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {first}
            <Box sx={{ display: "flex", gap: 1 }}>{rest}</Box>
          </Box>
        )
      }
    >
      {message && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {message}
        </Typography>
      )}
    </Modal>
  );
}
