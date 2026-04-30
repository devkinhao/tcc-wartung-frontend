import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/features/users/api/user.api";
import { useAuth } from "@/features/auth/useAuth";
import { qk } from "@/api/keys";

export function useMe() {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: qk.me(),
    queryFn: getMe,
    enabled: isAuthenticated,
  });
}
