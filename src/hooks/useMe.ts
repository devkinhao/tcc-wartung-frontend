import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/features/users/api/user.api";
import { useAuth } from "@/features/auth/useAuth";

export function useMe() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: !!token,
  });
}