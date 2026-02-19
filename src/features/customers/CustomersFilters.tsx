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

type Props = {
  search: string;
  setSearch: (v: string) => void;

  city: string;
  setCity: (v: string) => void;

  cities: City[];

  isCustomer: string;
  setIsCustomer: (v: string) => void;

  month: string;
  setMonth: (v: string) => void;

  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

export function CustomersFilters({
  search,
  setSearch,
  city,
  setCity,
  cities,
  isCustomer,
  setIsCustomer,
  month,
  setMonth,
  hasActiveFilters,
  onClearFilters,
}: Props) {
  const { t } = useTranslation();

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} flexWrap="wrap">
        <TextField
          size="small"
          label={t("customers.filters.searchLabel")}
          placeholder={t("customers.filters.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: { xs: "100%", md: 340 } }}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="customers-city">{t("customers.filters.city")}</InputLabel>
          <Select
            labelId="customers-city"
            label={t("customers.filters.city")}
            value={city}
            onChange={(e) => setCity(String(e.target.value))}
          >
            <MenuItem value="">{t("customers.filters.allCities")}</MenuItem>
            {cities.map((c) => (
              <MenuItem key={c.id} value={c.name}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 190 }}>
          <InputLabel id="customers-isCustomer">{t("customers.filters.isCustomer")}</InputLabel>
          <Select
            labelId="customers-isCustomer"
            label={t("customers.filters.isCustomer")}
            value={isCustomer}
            onChange={(e) => setIsCustomer(String(e.target.value))}
          >
            <MenuItem value="">{t("customers.filters.all")}</MenuItem>
            <MenuItem value="true">{t("common.yes")}</MenuItem>
            <MenuItem value="false">{t("common.no")}</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 190 }}>
          <InputLabel id="customers-month">{t("customers.filters.month")}</InputLabel>
          <Select
            labelId="customers-month"
            label={t("customers.filters.month")}
            value={month}
            onChange={(e) => setMonth(String(e.target.value))}
          >
            <MenuItem value="">{t("customers.filters.allMonths")}</MenuItem>
            <MenuItem value="1">{t("months.january")}</MenuItem>
            <MenuItem value="2">{t("months.february")}</MenuItem>
            <MenuItem value="3">{t("months.march")}</MenuItem>
            <MenuItem value="4">{t("months.april")}</MenuItem>
            <MenuItem value="5">{t("months.may")}</MenuItem>
            <MenuItem value="6">{t("months.june")}</MenuItem>
            <MenuItem value="7">{t("months.july")}</MenuItem>
            <MenuItem value="8">{t("months.august")}</MenuItem>
            <MenuItem value="9">{t("months.september")}</MenuItem>
            <MenuItem value="10">{t("months.october")}</MenuItem>
            <MenuItem value="11">{t("months.november")}</MenuItem>
            <MenuItem value="12">{t("months.december")}</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }} />

        <Button variant="outlined" onClick={onClearFilters} disabled={!hasActiveFilters}>
          {t("customers.filters.clear")}
        </Button>
      </Stack>
    </Card>
  );
}