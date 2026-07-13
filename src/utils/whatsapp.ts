import { digitsOnly } from "./masks";

/** Monta o link do WhatsApp a partir de um telefone (com ou sem máscara) */
export function buildWhatsAppLink(phone: string): string {
  return `https://wa.me/${digitsOnly(phone)}`;
}
