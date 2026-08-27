/**
 * Página oficial do CREA-SC para validação de autenticidade da ART.
 * https://www.crea-sc.org.br/creanet/valcertidao_art.php
 *
 * O formulário do site tem um único campo (`<input name="espelho">`) que o
 * usuário preenche manualmente — não há como pré-preencher por URL. O melhor
 * que dá para fazer é abrir a página e copiar o número para a área de
 * transferência, para o usuário colar no campo.
 */
export const CREA_SC_ART_VALIDATION_URL =
  "https://www.crea-sc.org.br/creanet/valcertidao_art.php";

/**
 * Abre a página de validação da ART do CREA-SC em nova aba e copia o número
 * informado para a área de transferência (best-effort, sem bloquear a abertura).
 */
export function openCreaScArtValidation(artNumber: string): void {
  window.open(CREA_SC_ART_VALIDATION_URL, "_blank", "noopener,noreferrer");
  void navigator.clipboard?.writeText(artNumber.trim()).catch(() => {});
}
