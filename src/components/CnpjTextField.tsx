import { useEffect } from "react";
import { TextField, InputAdornment, CircularProgress, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchCnpj, normalizeCnpj, type ReceitaWsResponseDTO } from "@/api/cnpj.api";
import { maskCnpj } from "@/utils/masks";

/** Estágio da consulta do CNPJ à ReceitaWS, exposto ao formulário pai. */
export type CnpjLookupStatus = "empty" | "invalid" | "loading" | "found" | "notFound";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onCompanyFound: (data: ReceitaWsResponseDTO) => void;
  /** Notifica o pai a cada mudança de estágio da consulta (para travar/destravar campos). */
  onStatusChange?: (status: CnpjLookupStatus) => void;
  disabled?: boolean;
  label?: string;
  size?: "small" | "medium";
  helperText?: string;
  required?: boolean;
  error?: boolean;
};

/** CNPJ normalizado para 14 dígitos — pronto para consulta */
function isValidCnpj(raw: string): boolean {
  return normalizeCnpj(raw).length === 14;
}

/**
 * TextField de CNPJ com autocomplete via ReceitaWS (backend).
 *
 * Assim que o usuário digitar um CNPJ válido (14 dígitos, com ou sem máscara),
 * consulta `GET /integrations/cnpj/{cnpj}` e chama `onCompanyFound` com os dados.
 * Exibe loading e erro inline — sem estado extra no componente pai.
 */
export function CnpjTextField({
  value,
  onChange,
  onCompanyFound,
  onStatusChange,
  disabled = false,
  label,
  size = "small",
  helperText,
  required = false,
  error: externalError = false,
}: Props) {
  const { t } = useTranslation();
  const normalizedCnpj = normalizeCnpj(value);

  const { data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["cnpj", normalizedCnpj],
    queryFn: () => fetchCnpj(normalizedCnpj),
    enabled: !disabled && isValidCnpj(value),
    retry: false,
    staleTime: 1000 * 60 * 60, // CNPJs raramente mudam — 1 h de cache
    gcTime: 1000 * 60 * 60,
  });

  // Dispara o callback para o pai preencher os demais campos
  useEffect(() => {
    if (isSuccess && data) {
      onCompanyFound(data);
    }
    // onCompanyFound é estável no pai (useCallback) — não precisa estar nas deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, data]);

  let status: CnpjLookupStatus;
  if (value.trim() === "") status = "empty";
  else if (!isValidCnpj(value)) status = "invalid";
  else if (isSuccess) status = "found";
  else if (isError) status = "notFound";
  else status = "loading";

  useEffect(() => {
    onStatusChange?.(status);
    // onStatusChange é estável no pai — segue o mesmo padrão de onCompanyFound
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const errorMessage = isError ? t("common.cnpj.notFound") : undefined;
  const displayHelper = errorMessage ?? helperText;
  const hasError = isError || externalError;

  return (
    <TextField
      label={label ?? t("common.fields.cnpj")}
      size={size}
      fullWidth
      required={required}
      value={value}
      onChange={(e) => onChange(maskCnpj(e.target.value))}
      inputMode="numeric"
      disabled={disabled}
      error={hasError}
      helperText={displayHelper}
      placeholder="00.000.000/0000-00"
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              {isFetching ? (
                <CircularProgress size={16} />
              ) : isError ? (
                <Tooltip title={t("common.cnpj.notFound")}>
                  <ErrorOutlineIcon fontSize="small" color="error" />
                </Tooltip>
              ) : isValidCnpj(value) ? (
                <SearchIcon fontSize="small" color="success" />
              ) : null}
            </InputAdornment>
          ),
        },

        htmlInput: { inputMode: "numeric" }
      }}
      />
  );
}
