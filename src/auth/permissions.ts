export function canAccess(
  userPermissions: string[],
  required?: string[]
): boolean {
  if (!required || required.length === 0) return true;
  return required.some((p) => userPermissions.includes(p));
}