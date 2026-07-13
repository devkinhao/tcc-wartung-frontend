import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { City } from "../types/City";
import { qk } from "@/api/keys";

export function useCities() {
  const { data = [] } = useQuery({
    queryKey: qk.cities(),
    queryFn: () => api.get<City[]>("/cities").then((r) => r.data),
    staleTime: 1000 * 60 * 30, // cidades raramente mudam — 30 min de cache
  });
  return data;
}
