import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

type UserRow = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
};

export default function UsersPage() {
  const [query, setQuery] = useState("");

  const users: UserRow[] = [
    { id: "1", fullName: "Admin Master", email: "admin@empresa.com", role: "ADMIN", isActive: true },
    { id: "2", fullName: "João Silva", email: "joao@empresa.com", role: "USER", isActive: true },
    { id: "3", fullName: "Maria Souza", email: "maria@empresa.com", role: "USER", isActive: false },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [query]);

  function handleCreate() {
    console.log("Novo usuário");
  }

  function handleEdit(id: string) {
    console.log("Editar usuário:", id);
  }

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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            Usuários
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie usuários, permissões e status.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <TextField
            size="small"
            label="Buscar"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ minWidth: 260 }}
          />

          <Button variant="contained" onClick={handleCreate}>
            Novo usuário
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          border: (t) => `1px solid ${t.palette.divider}`,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><b>Nome</b></TableCell>
              <TableCell><b>E-mail</b></TableCell>
              <TableCell><b>Perfil</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell align="right"><b>Ações</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.fullName}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={u.isActive ? "Ativo" : "Inativo"}
                    color={u.isActive ? "success" : "default"}
                    variant={u.isActive ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => handleEdit(u.id)}>
                    Editar
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    Nenhum usuário encontrado.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}