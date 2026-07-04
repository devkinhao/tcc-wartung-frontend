/** Converte SNAKE_CASE para camelCase: SHOW_NOTIFICATIONS → showNotifications */
export function toCamelCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/_([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}
