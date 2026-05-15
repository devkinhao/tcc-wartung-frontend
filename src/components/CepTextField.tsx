import { useEffect } from "react";
import { TextField, InputAdornment, CircularProgress, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchCep, normalizeCep, type ViaCepResponseDTO } from "@/api/cep.api";
import { maskCep } from "@/utils/masks";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onAddressFound: (data: ViaCepResponseDTO) => void;
  disabled?: boolean;
  label?: string;
  size?: "small" | "medium";
  helperText?: string;
  required?: boolean;
  error?: boolean;
};

/** CEP normalizado para 8 dígitos — pronto para consulta */
function isValidCep(raw: string): boolean {
  return normalizeCep(raw).length === 8;
}

/**
 * TextField de CEP com autocomplete via backend.
 *
 * Assim que o usuário digitar um CEP válido (8 dígitos, com ou sem traço),
 * consulta `GET /integrations/cep/{cep}` e chama `onAddressFound` com os dados.
 * Exibe loading e erro inline — sem estado extra no componente pai.
 */
export function CepTextField({
  value,
  onChange,
  onAddressFound,
  disabled = false,
  label,
  size = "small",
  helperText,
  required = false,
  error: externalError = false,
}: Props) {
  const { t } = useTranslation();
  const normalizedCep = normalizeCep(value);

  const { data, isFetching, isError, isSuccess } = useQuery({
    queryKey: ["cep", normalizedCep],
    queryFn: () => fetchCep(normalizedCep),
    enabled: !disabled && isValidCep(value),
    retry: false,
    staleTime: 1000 * 60 * 60, // CEPs raramente mudam — 1 h de cache
    gcTime: 1000 * 60 * 60,
  });

  // Dispara o callback para o pai preencher os campos de endereço
  useEffect(() => {
    if (isSuccess && data) {
      onAddressFound(data);
    }
    // onAddressFound é estável no pai (useCallback) — não precisa estar nas deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, data]);

  const errorMessage = isError ? t("common.cep.notFound", "CEP não encontrado") : undefined;
  const displayHelper = errorMessage ?? helperText;
  const hasError = isError || externalError;

  return (
    <TextField
      label={label ?? t("common.fields.zipCode", "CEP")}
      size={size}
      fullWidth
      required={required}
      value={value}
      onChange={(e) => onChange(maskCep(e.target.value))}
      inputMode="numeric"
      inputProps={{ inputMode: "numeric" }}
      disabled={disabled}
      error={hasError}
      helperText={displayHelper}
      placeholder="00000-000"
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            {isFetching ? (
              <CircularProgress size={16} />
            ) : isError ? (
              <Tooltip title={t("common.cep.notFound", "CEP não encontrado")}>
                <ErrorOutlineIcon fontSize="small" color="error" />
              </Tooltip>
            ) : isValidCep(value) ? (
              <SearchIcon fontSize="small" color="success" />
            ) : null}
          </InputAdornment>
        ),
      }}
    />
  );
}
