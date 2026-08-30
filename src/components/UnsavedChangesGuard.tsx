import { useCallback, useEffect } from "react";
import { useBlocker, type BlockerFunction } from "react-router-dom";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

type Props = {
  /** Quando true, qualquer tentativa de sair da tela pede confirmação. */
  when: boolean;
};

/**
 * Protege um formulário em edição contra saídas acidentais:
 *  - navegação dentro do app (sidebar, breadcrumb, botão voltar) → diálogo
 *  - fechar/recarregar a aba → aviso nativo do navegador
 *
 * Basta renderizar <UnsavedChangesGuard when={temAlteracoes} /> na tela.
 */
export function UnsavedChangesGuard({ when }: Props) {
  const { t } = useTranslation();

  const shouldBlock = useCallback<BlockerFunction>(
    ({ currentLocation, nextLocation }) =>
      when && currentLocation.pathname !== nextLocation.pathname,
    [when],
  );

  const blocker = useBlocker(shouldBlock);

  useEffect(() => {
    if (!when) return;

    const warnOnUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", warnOnUnload);
    return () => window.removeEventListener("beforeunload", warnOnUnload);
  }, [when]);

  if (blocker.state !== "blocked") return null;

  return (
    <Dialog open onClose={() => blocker.reset()} maxWidth="xs" fullWidth>
      <DialogTitle>{t("unsavedChanges.title")}</DialogTitle>
      <DialogContent>
        <Typography variant="body2">{t("unsavedChanges.message")}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => blocker.reset()}>{t("unsavedChanges.stay")}</Button>
        <Button color="error" variant="contained" onClick={() => blocker.proceed()}>
          {t("unsavedChanges.leave")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
