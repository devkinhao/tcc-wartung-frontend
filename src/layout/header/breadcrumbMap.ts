export type BreadcrumbItem = {
  label: string;
  path?: string;
};

export const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  "/dashboard": [{ label: "Início", path: "/dashboard" }],
  "/customers": [
    { label: "Início", path: "/dashboard" },
    { label: "Lista de Empresas" },
  ],
  "/inspections": [
    { label: "Início", path: "/dashboard" },
    { label: "Lista de Inspeções" },
  ],
  "/reports": [
    { label: "Início", path: "/dashboard" },
    { label: "Relatórios" },
  ],
  "/company": [
    { label: "Início", path: "/dashboard" },
    { label: "Minha Empresa" },
  ],
  "/users": [
    { label: "Início", path: "/dashboard" },
    { label: "Usuários" },
  ],
  "/configurations": [
    { label: "Início", path: "/dashboard" },
    { label: "Configurações" },
  ],
  "/help": [
    { label: "Início", path: "/dashboard" },
    { label: "Ajuda" },
  ],
  "/users/me": [
    { label: "Início", path: "/dashboard" },
    { label: "Meu Perfil" },
  ],
  "/users/me/preferences": [
    { label: "Início", path: "/dashboard" },
    { label: "Meu Perfil", path: "/users/me" },
    { label: "Preferências" },
  ],
};