import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/keys";
import { getConfigurations } from "../api/configurations.api";

const DEFAULT_ALERT_DAYS = 30;

/** Lê a configuração DIAS_ALERTA_VENCIMENTO, com fallback caso ausente/inválida */
export function useAlertDays() {
  const { data } = useQuery({
    queryKey: qk.configurations(),
    queryFn: getConfigurations,
    staleTime: 5 * 60 * 1000,
  });

  const parsed = Number(data?.find((c) => c.name === "DIAS_ALERTA_VENCIMENTO")?.value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_ALERT_DAYS;
}
