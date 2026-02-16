import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

/* ===== TYPES ===== */

type City = {
  id: number;
  name: string;
  state: string;
};

type Company = {
  fantasyName: string;
  legalName: string;
  cnpj: string;
  phone: string;
  mobile: string;
  email: string;
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    zipCode: string;
    cityId: number | null;
  };
};

export default function Company() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [cities, setCities] = useState<City[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [initialCompany, setInitialCompany] = useState<Company | null>(null);

  /* ===== MOCK FETCH ===== */
  useEffect(() => {
    const t = setTimeout(() => {
      const fetchedCities: City[] = [
        { id: 1, name: "São Paulo", state: "SP" },
        { id: 2, name: "Campinas", state: "SP" },
        { id: 3, name: "Rio de Janeiro", state: "RJ" },
      ];

      const fetchedCompany: Company = {
        fantasyName: "Engenharia Maas",
        legalName: "Engenharia Maas LTDA",
        cnpj: "12.345.678/0001-90",
        phone: "(11) 3333-3333",
        mobile: "(11) 98888-8888",
        email: "contato@engenhariamaas.com.br",
        address: {
          street: "Rua Exemplo",
          number: "123",
          complement: "Sala 45",
          neighborhood: "Centro",
          zipCode: "01000-000",
          cityId: 1,
        },
      };

      setCities(fetchedCities);
      setCompany(fetchedCompany);
      setInitialCompany(fetchedCompany);
      setLoading(false);
    }, 500);

    return () => clearTimeout(t);
  }, []);

  const cityValue = useMemo(() => {
    if (!company) return "";
    return company.address.cityId ?? "";
  }, [company]);

  if (loading || !company) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <CircularProgress size={18} />
        <Typography variant="body2" color="text.secondary">
          Carregando dados da empresa...
        </Typography>
      </Stack>
    );
  }

  const handleChange = (field: keyof Company, value: string) => {
    setCompany((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleAddressChange = (field: keyof Company["address"], value: string) => {
    setCompany((prev) =>
      prev ? { ...prev, address: { ...prev.address, [field]: value } } : prev
    );
  };

  const handleCityChange = (value: string) => {
    // Select always returns string
    const parsed = value === "" ? null : Number(value);
    setCompany((prev) =>
      prev ? { ...prev, address: { ...prev.address, cityId: Number.isNaN(parsed) ? null : parsed } } : prev
    );
  };

  const handleSave = () => {
    console.log("Salvar empresa (mock)", company);
    setInitialCompany(company);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (initialCompany) setCompany(initialCompany);
    setIsEditing(false);
  };

  return (
    <Paper
      elevation={1}
      sx={{
        maxWidth: 1100,
        p: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      {/* HEADER */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600} color="primary.main">
          Minha empresa
        </Typography>

        {!isEditing ? (
          <Button variant="contained" onClick={() => setIsEditing(true)}>
            Editar
          </Button>
        ) : (
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Salvar alterações
            </Button>
          </Stack>
        )}
      </Stack>

      {/* DADOS DA EMPRESA */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          mb: 3,
          transition: (t) => t.transitions.create("box-shadow", { duration: t.transitions.duration.short }),
          "&:hover": { boxShadow: 4 },
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Nome fantasia"
              fullWidth
              size="small"
              value={company.fantasyName}
              onChange={(e) => handleChange("fantasyName", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Razão social"
              fullWidth
              size="small"
              value={company.legalName}
              onChange={(e) => handleChange("legalName", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="CNPJ"
              fullWidth
              size="small"
              value={company.cnpj}
              onChange={(e) => handleChange("cnpj", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="E-mail"
              fullWidth
              size="small"
              value={company.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Telefone"
              fullWidth
              size="small"
              value={company.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Celular"
              fullWidth
              size="small"
              value={company.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
        </Grid>
      </Card>

      {/* ENDEREÇO */}
      <Typography variant="subtitle1" fontWeight={600} color="primary.main" sx={{ mb: 1.5 }}>
        Endereço
      </Typography>

      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          transition: (t) => t.transitions.create("box-shadow", { duration: t.transitions.duration.short }),
          "&:hover": { boxShadow: 4 },
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Rua"
              fullWidth
              size="small"
              value={company.address.street}
              onChange={(e) => handleAddressChange("street", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Número"
              fullWidth
              size="small"
              value={company.address.number}
              onChange={(e) => handleAddressChange("number", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Complemento"
              fullWidth
              size="small"
              value={company.address.complement}
              onChange={(e) => handleAddressChange("complement", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="Bairro"
              fullWidth
              size="small"
              value={company.address.neighborhood}
              onChange={(e) => handleAddressChange("neighborhood", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              label="CEP"
              fullWidth
              size="small"
              value={company.address.zipCode}
              onChange={(e) => handleAddressChange("zipCode", e.target.value)}
              disabled={!isEditing}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small" disabled={!isEditing}>
              <InputLabel id="city-label">Cidade</InputLabel>
              <Select
                labelId="city-label"
                label="Cidade"
                value={cityValue}
                onChange={(e) => handleCityChange(String(e.target.value))}
              >
                <MenuItem value="">
                  <em>Selecione a cidade</em>
                </MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name} - {city.state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {!isEditing ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Clique em <b>Editar</b> para alterar os dados.
            </Typography>
          </Box>
        ) : null}
      </Card>
    </Paper>
  );
}