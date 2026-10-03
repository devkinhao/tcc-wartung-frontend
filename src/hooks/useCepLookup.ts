import { fetchCep, normalizeCep, type ViaCepResponseDTO } from "@/api/cep.api";
import { qk } from "@/api/keys";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

type UseCepLookupParams = {
  /** CEP digitado, com ou sem máscara. */
  value: string;
  /** Recebe o endereço quando a consulta encontra o CEP. */
  onFound: (data: ViaCepResponseDTO) => void;
  /** Impede a consulta. */
  disabled?: boolean;
};

/** Indica se o CEP tem os 8 dígitos necessários para a consulta. */
function isCompleteCep(raw: string) {
  return normalizeCep(raw).length === 8;
}

/** Indica se a consulta falhou por indisponibilidade do serviço (sem resposta, erro 5xx ou limite de requisições), e não porque o CEP não existe. */
function isLookupServiceFailure(error: unknown) {
  if (!isAxiosError(error)) return true;
  const status = error.response?.status;
  return !status || status >= 500 || status === 429;
}

/** Consulta o CEP (via backend) quando ele está completo e devolve o estado da consulta. */
export function useCepLookup({
  value,
  onFound,
  disabled = false,
}: UseCepLookupParams) {
  /** Hooks. */
  const { t } = useTranslation();

  const isValid = isCompleteCep(value);
  const normalizedCep = normalizeCep(value);

  const { data, error, isFetching, isError, isSuccess, refetch } = useQuery({
    queryKey: qk.cepLookup(normalizedCep),
    queryFn: () => fetchCep(normalizedCep),
    enabled: !disabled && isValid,
    retry: false,
    /** Dados de CEP raramente mudam, então ficam em cache por 1 hora. */
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
  });

  /**
   * Entrega o endereço encontrado ao formulário.
   * O onFound precisa ser estável (useCallback) no pai, por isso fica fora das dependências.
   */
  useEffect(() => {
    if (isSuccess && data) onFound(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, data]);

  return {
    isFetching,
    isError,
    isSuccess,
    isValid,
    /** Falha do serviço que permite tentar de novo, mas não CEP inexistente. */
    isUnavailable: isError && isLookupServiceFailure(error),
    retry: () => refetch(),
    errorMessage: isError
      ? t(
          isLookupServiceFailure(error)
            ? "common.cep.unavailable"
            : "common.cep.notFound",
        )
      : undefined,
  };
}
