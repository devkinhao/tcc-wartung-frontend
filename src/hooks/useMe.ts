import { qk } from "@/api/keys";
import { useAuth } from "@/features/auth/useAuth";
import { getMe } from "@/features/users/api/user.api";
import { useQuery } from "@tanstack/react-query";

/** Retorna os dados do usuário autenticado. */
export function useMe() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: qk.me(),
    queryFn: getMe,
    enabled: isAuthenticated,
  });
}
