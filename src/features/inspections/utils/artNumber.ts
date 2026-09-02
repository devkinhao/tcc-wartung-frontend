/**
 * Formato do número da ART do CREA-SC: 7 ou 8 dígitos + dígito verificador.
 * ARTs antigas têm 7 dígitos (0154894-9); as novas têm 8 (10154894-9).
 *
 * Espelha o `@Pattern(regexp = "\\d{7,8}-\\d")` do backend
 * (InspectionCreateRequestDTO / InspectionUpdateRequestDTO).
 *
 * Consumido por `@/validation/fields` (schema `artNumber`) — a validação dos
 * formulários passa por lá.
 */
export const ART_NUMBER_PATTERN = /^\d{7,8}-\d$/;
