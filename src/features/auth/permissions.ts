export function canAccess(
  userPermissions: string[],
  required?: readonly string[]
): boolean {
  if (!required || required.length === 0) return true;
  return required.some((p) => userPermissions.includes(p));
}