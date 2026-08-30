import { Navigate, Outlet } from "react-router-dom";
import { useMe } from "@/hooks/useMe";
import { canAccess } from "@/features/auth/permissions";
import { paths } from "./paths";

type Props = {
  permissions?: readonly string[];
};

// Guarda de rota por permissão — hoje canAccess() só era usado para esconder
// links do menu lateral, então qualquer usuário autenticado podia navegar
// direto para uma URL admin (ex: /users) mesmo sem a permissão, contando 100%
// com o backend rejeitar as chamadas de API por trás da tela.
export function RequirePermission({ permissions }: Props) {
  const { data: user, isLoading } = useMe();

  if (isLoading) return null;

  const userPermissions = user?.permissions ?? [];
  if (!canAccess(userPermissions, permissions)) {
    return <Navigate to={paths.home} replace />;
  }

  return <Outlet />;
}
