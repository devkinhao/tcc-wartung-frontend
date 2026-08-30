/**
 * Link para compor um e-mail no Gmail web, já com o destinatário preenchido.
 * Requer que o usuário esteja logado no Gmail no navegador.
 */
export function buildGmailComposeLink(email: string): string {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}
