import { useSnackbar, type VariantType } from "notistack";
import { useTranslation } from "react-i18next";
import { useCallback, useMemo } from "react";
import { isAxiosError } from "axios";

/**
 * Extrai uma mensagem localizada a partir de um erro Axios/JS.
 *
 * Estratégia:
 * 1. Sem response (timeout, rede) → chave "network"
 * 2. Status HTTP conhecido (400, 403, 404…) → chave i18n correspondente
 * 3. Status desconhecido → chave "unknown"
 *
 * Nunca exibe a mensagem crua do backend — garante que o feedback
 * seja sempre no idioma selecionado pelo usuário.
 */
function resolveErrorMessage(err: unknown, t: (k: string) => string): string {
  if (!isAxiosError(err) || !err.response) {
    return t("notify.httpErrors.network");
  }

  const status = err.response.status;

  const key = `notify.httpErrors.${status}`;
  const translated = t(key);

  // Se i18n encontrou uma tradução para este status, usa
  // (chave não encontrada retorna a própria chave no react-i18next)
  if (translated !== key) {
    return translated;
  }

  // Status sem mapeamento específico → fallback genérico
  return t("notify.httpErrors.unknown");
}

/**
 * Hook centralizado de notificações toast.
 *
 * Uso:
 * ```ts
 * const notify = useNotify();
 * notify.success("notify.success.saved");
 * notify.error("notify.error.saveFailed");    // chave i18n
 * notify.fromError(err);                       // traduz pelo status HTTP
 * notify.fromError(err, "notify.error.saveFailed"); // fallback se quiser
 * ```
 */
export function useNotify() {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const show = useCallback(
    (message: string, variant: VariantType) => {
      enqueueSnackbar(message, {
        variant,
        autoHideDuration: variant === "error" ? 5000 : 3000,
        anchorOrigin: { vertical: "bottom", horizontal: "left" },
        preventDuplicate: true,
      });
    },
    [enqueueSnackbar]
  );

  /**
   * Resolve a chave i18n: se começa com "notify." traduz,
   * senão usa diretamente (permite passar t("alguma.chave") já traduzido).
   */
  const resolve = useCallback(
    (messageOrKey: string) =>
      messageOrKey.startsWith("notify.") ? t(messageOrKey) : messageOrKey,
    [t]
  );

  // Memoizado para que consumidores possam incluir `notify` em arrays de
  // dependência (useEffect/useCallback) sem disparar reexecuções a cada render.
  return useMemo(
    () => ({
      success: (key: string) => show(resolve(key), "success"),
      error:   (key: string) => show(resolve(key), "error"),
      warning: (key: string) => show(resolve(key), "warning"),
      info:    (key: string) => show(resolve(key), "info"),

      /**
       * Exibe um toast de erro com mensagem localizada pelo status HTTP.
       * Nunca exibe mensagens em inglês do backend ao usuário.
       */
      fromError: (err: unknown) => {
        show(resolveErrorMessage(err, t), "error");
      },
    }),
    [show, resolve, t]
  );
}
