import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/keys";
import { getConfigurations } from "../api/configurations.api";

const DEFAULT_ALERT_DAYS = 30;

/** Lê a configuração EXPIRATION_ALERT_DAYS, com fallback caso ausente/inválida */
export function useAlertDays() {
  const { data } = useQuery({
    queryKey: qk.configurations(),
    queryFn: getConfigurations,
    staleTime: 5 * 60 * 1000,
  });

  const parsed = Number(data?.find((c) => c.name === "EXPIRATION_ALERT_DAYS")?.value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_ALERT_DAYS;
}
