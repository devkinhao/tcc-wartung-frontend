import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/services/userService";
import { useAuth } from "@/auth/useAuth";

export function useMe() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
    enabled: !!token,
  });
}