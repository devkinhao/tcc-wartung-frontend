import {
  fetchCnpj,
  isValidCnpj,
  normalizeCnpj,
  type ReceitaWsResponseDTO,
} from "@/api/cnpj.api";
import { qk } from "@/api/keys";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

/** Estágio da consultaque pode ser vazio, inválido (formato ou dígitos), em andamento, encontrado ou não encontrado. */
export type CnpjLookupStatus =
  | "empty"
  | "invalid"
  | "loading"
  | "found"
  | "notFound";

type UseCnpjLookupParams = {
  /** CNPJ digitado, com ou sem máscara. */
  value: string;
  /** Recebe os dados da empresa quando a consulta encontra o CNPJ. */
  onFound: (data: ReceitaWsResponseDTO) => void;
  /** Chamado a cada mudança de estágio da consulta. */
  onStatusChange?: (status: CnpjLookupStatus) => void;
  /** Impede a consulta. */
  disabled?: boolean;
};

/** Consulta o CNPJ na ReceitaWS (via backend) quando ele é válido e devolve o estado da consulta. */
export function useCnpjLookup({
  value,
  onFound,
  onStatusChange,
  disabled = false,
}: UseCnpjLookupParams) {
  /** Hooks. */
  const { t } = useTranslation();

  /** CNPJs com dígitos verificadores incorretos não são consultados. */
  const isValid = isValidCnpj(value);
  const normalizedCnpj = normalizeCnpj(value);

  const { data, isFetching, isError, isSuccess } = useQuery({
    queryKey: qk.cnpjLookup(normalizedCnpj),
    queryFn: () => fetchCnpj(normalizedCnpj),
    enabled: !disabled && isValid,
    retry: false,
    /** Dados de CNPJ raramente mudam, então ficam em cache por 1 hora. */
    staleTime: 1000 * 60 * 60,
    gcTime: 1000 * 60 * 60,
  });

  /**
   * Entrega os dados encontrados ao formulário.
   * Como o onFound precisa ser estável (useCallback) no pai, fica fora das dependências.
   */
  useEffect(() => {
    if (isSuccess && data) onFound(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, data]);

  let status: CnpjLookupStatus;
  if (value.trim() === "") status = "empty";
  else if (!isValid) status = "invalid";
  else if (isSuccess) status = "found";
  else if (isError) status = "notFound";
  else status = "loading";

  /** Notifica o estágio da consulta, em que o onStatusChange também fica fora das dependências. */
  useEffect(() => {
    onStatusChange?.(status);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return {
    status,
    isFetching,
    isError,
    isValid,
    errorMessage: isError ? t("common.cnpj.notFound") : undefined,
  };
}
