import { useSnackbar, type VariantType } from "notistack";
import { useTranslation } from "react-i18next";
import { useCallback, useMemo } from "react";
import { isAxiosError } from "axios";

// Corpo de erro no formato RFC 7807 (Problem Details) que o backend devolve.
// `code` é um campo opcional e estável (ex: "CNPJ_ALREADY_EXISTS") que o
// backend anexa às BusinessException — só existe para regras de negócio
// conhecidas, então nem todo erro vai ter um.
type BackendProblemDetail = {
  code?: string;
};

/**
 * Extrai uma mensagem localizada a partir de um erro Axios/JS.
 *
 * Estratégia:
 * 1. Sem response (timeout, rede) → chave "network"
 * 2. `code` de negócio conhecido (ex: CNPJ_ALREADY_EXISTS) → mensagem
 *    específica traduzida, uma por código, nas 3 línguas
 * 3. Sem `code` (ou desconhecido) → status HTTP conhecido (400, 403, 404…)
 *    → chave i18n genérica correspondente
 * 4. Status desconhecido → chave "unknown"
 *
 * Nunca exibe a mensagem crua do backend (`detail`, sempre em inglês) —
 * garante que o feedback seja sempre no idioma selecionado pelo usuário.
 */
function resolveErrorMessage(err: unknown, t: (k: string) => string): string {
  if (!isAxiosError(err) || !err.response) {
    return t("notify.httpErrors.network");
  }

  const code = (err.response.data as BackendProblemDetail | undefined)?.code;
  if (code) {
    const codeKey = `notify.errorCodes.${code}`;
    const translatedCode = t(codeKey);
    // chave não encontrada retorna a própria chave no react-i18next
    if (translatedCode !== codeKey) {
      return translatedCode;
    }
  }

  const status = err.response.status;
  const key = `notify.httpErrors.${status}`;
  const translated = t(key);

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
