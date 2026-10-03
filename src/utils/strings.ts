/** Converte SNAKE_CASE para camelCase: SHOW_NOTIFICATIONS → showNotifications */
export function toCamelCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

/**
 * Caixa alta para os campos de texto livre que o backend grava normalizados
 * (fabricante, modelo e observações da inspeção). Aplicada a cada tecla, para
 * que o que aparece no formulário seja exatamente o que será salvo.
 */
export function toUpperCaseInput(value: string): string {
  return value.toUpperCase();
}
