import type { City } from "../types/City";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import { useTranslation } from "react-i18next";

export type CustomerFilterValues = {
  search: string;
  city: string;
  isCustomer: string;
  month: string;
};

type Props = {
  values: CustomerFilterValues;
  onChange: <K extends keyof CustomerFilterValues>(key: K, value: CustomerFilterValues[K]) => void;
  cities: City[];
  hasActiveFilters: boolean;
  onClear: () => void;
};

const MONTHS = [
  "january", "february", "march", "april",
  "may", "june", "july", "august",
  "september", "october", "november", "december",
] as const;

export function CustomersFilters({ values, onChange, cities, hasActiveFilters, onClear }: Props) {
  const { t } = useTranslation();

  return (
    <Box sx={{ mb: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ sm: "center" }}
        flexWrap="wrap"
        useFlexGap
      >
        <TextField
          size="small"
          label={t("customers.filters.searchLabel")}
          placeholder={t("customers.filters.searchPlaceholder")}
          value={values.search}
          onChange={(e) => onChange("search", e.target.value)}
          sx={{ minWidth: { xs: "100%", sm: 220 }, flex: { sm: 1 }, maxWidth: { sm: 320 } }}
        />

        <FormControl size="small" sx={{ width: { xs: "100%", sm: 170 } }}>
          <InputLabel id="customers-city">{t("customers.filters.city")}</InputLabel>
          <Select
            labelId="customers-city"
            label={t("customers.filters.city")}
            value={values.city}
            onChange={(e) => onChange("city", String(e.target.value))}
          >
            <MenuItem value="">{t("customers.filters.allCities")}</MenuItem>
            {cities.map((c) => (
              <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: { xs: "100%", sm: 130 } }}>
          <InputLabel id="customers-isCustomer">{t("customers.filters.isCustomer")}</InputLabel>
          <Select
            labelId="customers-isCustomer"
            label={t("customers.filters.isCustomer")}
            value={values.isCustomer}
            onChange={(e) => onChange("isCustomer", String(e.target.value))}
          >
            <MenuItem value="">{t("customers.filters.all")}</MenuItem>
            <MenuItem value="true">{t("common.yes")}</MenuItem>
            <MenuItem value="false">{t("common.no")}</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ width: { xs: "100%", sm: 130 } }}>
          <InputLabel id="customers-month">{t("customers.filters.month")}</InputLabel>
          <Select
            labelId="customers-month"
            label={t("customers.filters.month")}
            value={values.month}
            onChange={(e) => onChange("month", String(e.target.value))}
          >
            <MenuItem value="">{t("customers.filters.allMonths")}</MenuItem>
            {MONTHS.map((name, i) => (
              <MenuItem key={i + 1} value={String(i + 1)}>
                {t(`months.${name}`)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {hasActiveFilters && (
          <Button
            size="small"
            color="inherit"
            onClick={onClear}
            startIcon={<FilterAltOffIcon fontSize="small" />}
            sx={{ flexShrink: 0, color: "text.secondary", whiteSpace: "nowrap" }}
          >
            {t("customers.filters.clear")}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
