// Fonte única de verdade para quais permissões cada área do app exige.
// Usado tanto pelo menu lateral (esconder o link) quanto pelo guard de rota
// (bloquear o acesso de verdade) — evita duplicar a mesma lista de permissões
// em dois lugares que podem divergir.
export const ROUTE_PERMISSIONS = {
  admin: ["ROLE_ADMIN"],
  reports: ["ROLE_ACCESS_REPORTS"],
} as const;
