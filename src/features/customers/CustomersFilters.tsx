import type { City } from "@/types/City";
import { Box, Button, Card, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";

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
  // Mantém as props para não quebrar a página.
  // (O filtro "Cliente?" não existia visualmente na versão anterior.)
  void isCustomer;
  void setIsCustomer;

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} flexWrap="wrap">
        <TextField
          size="small"
          label="Buscar"
          placeholder="Buscar por razão social ou CNPJ"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: { xs: "100%", md: 340 } }}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel id="customers-city">Cidade</InputLabel>
          <Select
            labelId="customers-city"
            label="Cidade"
            value={city}
            onChange={(e) => setCity(String(e.target.value))}
          >
            <MenuItem value="">Todas as cidades</MenuItem>
            {cities.map((c) => (
              <MenuItem key={c.id} value={c.name}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 190 }}>
          <InputLabel id="customers-month">Mês</InputLabel>
          <Select
            labelId="customers-month"
            label="Mês"
            value={month}
            onChange={(e) => setMonth(String(e.target.value))}
          >
            <MenuItem value="">Todos os meses</MenuItem>
            <MenuItem value="1">Janeiro</MenuItem>
            <MenuItem value="2">Fevereiro</MenuItem>
            <MenuItem value="3">Março</MenuItem>
            <MenuItem value="4">Abril</MenuItem>
            <MenuItem value="5">Maio</MenuItem>
            <MenuItem value="6">Junho</MenuItem>
            <MenuItem value="7">Julho</MenuItem>
            <MenuItem value="8">Agosto</MenuItem>
            <MenuItem value="9">Setembro</MenuItem>
            <MenuItem value="10">Outubro</MenuItem>
            <MenuItem value="11">Novembro</MenuItem>
            <MenuItem value="12">Dezembro</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ flex: 1 }} />

        <Button variant="outlined" onClick={onClearFilters} disabled={!hasActiveFilters}>
          Limpar filtros
        </Button>
      </Stack>
    </Card>
  );
}