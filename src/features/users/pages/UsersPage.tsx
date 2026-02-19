import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Menu,
  MenuItem,
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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTranslation } from "react-i18next";

import { usersApi, type UserResponseDTO } from "../api/usersApi";
import { EditUserModal } from "../components/EditUserModal";
import { CreateUserModal } from "../components/CreateUserModal";

type UserRow = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
};

function roleFromPermissions(perms: string[] | undefined) {
  const p = perms ?? [];
  if (p.includes("ROLE_ADMIN")) return "ADMIN";
  if (p.includes("ROLE_USER")) return "USER";
  return p[0]?.replace("ROLE_", "") ?? "—";
}

function toRow(u: UserResponseDTO): UserRow {
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email ?? "—",
    role: roleFromPermissions(u.permissions),
    isActive: Boolean(u.isActive),
  };
}

export default function UsersPage() {
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  // Edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Row menu (single menu for the table)
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuUser, setMenuUser] = useState<UserRow | null>(null);

  async function loadUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.findAll();
      setUsers(data.map(toRow));
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || t("common.noDataAvailable");
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [query, users]);

  function handleCreate() {
    setCreateOpen(true);
  }

  function openMenu(e: React.MouseEvent<HTMLElement>, u: UserRow) {
    setMenuAnchor(e.currentTarget);
    setMenuUser(u);
  }

  function closeMenu() {
    setMenuAnchor(null);
    setMenuUser(null);
  }

  function handleViewEdit() {
    if (!menuUser) return;
    setSelectedUserId(menuUser.id);
    setEditOpen(true);
    closeMenu();
  }

  async function handleToggleActive() {
    if (!menuUser) return;

    try {
      if (menuUser.isActive) {
        await usersApi.delete(menuUser.id);
      } else {
        await usersApi.activate(menuUser.id);
      }

      await loadUsers();
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || t("common.noDataAvailable");
      setError(String(msg));
    } finally {
      closeMenu();
    }
  }

  function closeEdit() {
    setEditOpen(false);
    setSelectedUserId(null);
  }

  return (
    <Paper elevation={1} sx={{ maxWidth: 1100, p: 3, borderRadius: 2, bgcolor: "background.paper" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            {t("users.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("users.description")}
          </Typography>

          {error && (
            <Typography variant="body2" sx={{ mt: 1 }} color="error">
              {error}
            </Typography>
          )}
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <TextField
            size="small"
            label={t("users.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ minWidth: 260 }}
            disabled={loading}
          />

          <Button variant="contained" onClick={handleCreate} disabled={loading}>
            {t("users.actions.newUser")}
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          border: (t) => `1px solid ${t.palette.divider}`,
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {loading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "background.paper",
              opacity: 0.7,
              zIndex: 2,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><b>{t("users.table.name")}</b></TableCell>
              <TableCell><b>{t("users.table.email")}</b></TableCell>
              <TableCell><b>{t("users.table.role")}</b></TableCell>
              <TableCell><b>{t("users.table.status")}</b></TableCell>

              {/* Centered header */}
              <TableCell align="center">
                <b>{t("users.table.actions")}</b>
              </TableCell>
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
                    label={u.isActive ? t("common.status.active") : t("common.status.inactive")}
                    color={u.isActive ? "success" : "default"}
                    variant={u.isActive ? "filled" : "outlined"}
                  />
                </TableCell>

                {/* Centered 3-dots menu */}
                <TableCell align="center">
                  <IconButton size="small" onClick={(e) => openMenu(e, u)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography variant="body2" color="text.secondary">
                    {t("users.empty")}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      {/* Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={handleViewEdit}>{t("users.actions.viewEdit") || "View / Edit"}</MenuItem>
        <MenuItem onClick={handleToggleActive}>
          {menuUser?.isActive
            ? t("users.actions.inactivate") || "Inactivate user"
            : t("users.actions.activate") || "Activate user"}
        </MenuItem>
      </Menu>

      {/* Modal */}
      <EditUserModal
        open={editOpen}
        userId={selectedUserId}
        onClose={closeEdit}
        onChanged={loadUsers}
      />

      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={loadUsers}
      />
    </Paper>
  );
}