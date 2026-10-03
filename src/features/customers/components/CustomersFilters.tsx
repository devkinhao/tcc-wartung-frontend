import { Button } from "@/components/button/Button";
import { FormField } from "@/components/form/FormField";
import { MONTHS } from "@/utils/months";
import { SearchOutlined } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { MenuItem, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import type { City } from "../types/City";

type CustomersFiltersProps = {
  values: CustomerFilterValues;
  onChange: <K extends keyof CustomerFilterValues>(
    key: K,
    value: CustomerFilterValues[K],
  ) => void;
  cities: City[];
  hasActiveFilters: boolean;
  onClear: () => void;
  onAddCompany: () => void;
};

/** Valores atuais dos filtros da listagem de clientes. */
export type CustomerFilterValues = {
  search: string;
  city: string;
  /** O status da empresa pode ser customer, non-customer e inactive. */
  status: string;
  month: string;
};

/** Opções do select de status, na ordem exibida ao usuário. */
const STATUS_OPTIONS = [
  { value: "customer", labelKey: "customers.filters.statusCustomer" },
  { value: "non-customer", labelKey: "customers.filters.statusNonCustomer" },
  { value: "inactive", labelKey: "customers.filters.statusInactive" },
] as const;

/** Filtros da listagem de clientes com busca, cidade, status e mês, além de ações para limpar/adicionar empresa. */
export function CustomersFilters({
  values,
  onChange,
  cities,
  hasActiveFilters,
  onClear,
  onAddCompany,
}: CustomersFiltersProps) {
  /** Hooks. */
  const { t } = useTranslation();

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      alignItems={{ sm: "center" }}
      flexWrap="wrap"
      useFlexGap
      sx={{ mb: 1.5 }}
    >
      <FormField
        placeholder={t("customers.filters.placeholder.search")}
        value={values.search}
        onChange={(e) => onChange("search", e.target.value)}
        startIcon={SearchOutlined}
        sx={{ minWidth: { xs: "100%", sm: 280 } }}
      />
      <FormField
        select
        emptyOptionLabel={t("customers.filters.cities")}
        value={values.city}
        onChange={(e) => onChange("city", String(e.target.value))}
        sx={{ width: { xs: "100%", sm: 180 } }}
      >
        {cities.map((c) => (
          <MenuItem key={c.id} value={c.name}>
            {c.name}
          </MenuItem>
        ))}
      </FormField>
      <FormField
        select
        emptyOptionLabel={t("customers.filters.status")}
        value={values.status}
        onChange={(e) => onChange("status", String(e.target.value))}
        sx={{ width: { xs: "100%", sm: 140 } }}
      >
        {STATUS_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {t(option.labelKey)}
          </MenuItem>
        ))}
      </FormField>
      <FormField
        select
        emptyOptionLabel={t("customers.filters.months")}
        value={values.month}
        onChange={(e) => onChange("month", String(e.target.value))}
        sx={{ width: { xs: "100%", sm: 130 } }}
      >
        {MONTHS.map((name, i) => (
          <MenuItem key={i + 1} value={String(i + 1)}>
            {t(`months.${name}`)}
          </MenuItem>
        ))}
      </FormField>
      <Button
        variant="text"
        tooltip={t("customers.filters.tooltip.clear")}
        onClick={onClear}
        disabled={!hasActiveFilters}
        startIcon={FilterAltOffIcon}
      >
        {t("customers.filters.clear")}
      </Button>
      <Button
        tooltip={t("customers.actions.tooltip.addCompany")}
        startIcon={AddIcon}
        onClick={onAddCompany}
        data-tour="customers.add"
        sx={{ ml: "auto" }}
      >
        {t("customers.actions.addCompany")}
      </Button>
    </Stack>
  );
}
