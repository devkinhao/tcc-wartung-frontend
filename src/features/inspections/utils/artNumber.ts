/**
 * Formato do número da ART do CREA-SC: 7 ou 8 dígitos + dígito verificador.
 * ARTs antigas têm 7 dígitos (0154894-9); as novas têm 8 (10154894-9).
 *
 * Espelha o `@Pattern(regexp = "\\d{7,8}-\\d")` do backend
 * (InspectionCreateRequestDTO / InspectionUpdateRequestDTO).
 */
export const ART_NUMBER_PATTERN = /^\d{7,8}-\d$/;

/** `true` se o valor está vazio (campo opcional) ou no formato válido. */
export function isValidArtNumber(value: string | null | undefined): boolean {
  const trimmed = (value ?? "").trim();
  return trimmed === "" || ART_NUMBER_PATTERN.test(trimmed);
}
