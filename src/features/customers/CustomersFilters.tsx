import type { City } from "@/types/City";
import {
  Box,
  Button,
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
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
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} flexWrap="wrap">
        <TextField
          size="small"
          label={t("customers.filters.searchLabel")}
          placeholder={t("customers.filters.searchPlaceholder")}
          value={values.search}
          onChange={(e) => onChange("search", e.target.value)}
          sx={{ minWidth: { xs: "100%", md: 240 } }}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
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

        <FormControl size="small" sx={{ minWidth: 150 }}>
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

        <FormControl size="small" sx={{ minWidth: 150 }}>
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

        <Box sx={{ flex: 1 }} />

        <Button variant="outlined" onClick={onClear} disabled={!hasActiveFilters}>
          {t("customers.filters.clear")}
        </Button>
      </Stack>
    </Card>
  );
}
