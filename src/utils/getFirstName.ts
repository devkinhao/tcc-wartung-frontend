export function getFirstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0];
}