import { useState } from "react";
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

import { useUsers, type UserRow } from "../hooks/useUsers";
import { EditUserModal } from "../components/EditUserModal";
import { CreateUserModal } from "../components/CreateUserModal";

export default function UsersPage() {
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const { users, isLoading, error, reload, toggleActive, isTogglingActive } = useUsers(query);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Estado do row-menu
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuUser, setMenuUser] = useState<UserRow | null>(null);

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

  function handleToggleActive() {
    if (!menuUser) return;
    toggleActive(menuUser);
    closeMenu();
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
              {String(error)}
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
            disabled={isLoading}
          />
          <Button variant="contained" onClick={() => setCreateOpen(true)} disabled={isLoading}>
            {t("users.actions.newUser")}
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          border: (th) => `1px solid ${th.palette.divider}`,
          borderRadius: 2,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {(isLoading || isTogglingActive) && (
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
              <TableCell align="center"><b>{t("users.table.actions")}</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((u) => (
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
                <TableCell align="center">
                  <IconButton size="small" onClick={(e) => openMenu(e, u)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {!isLoading && users.length === 0 && (
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

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={handleViewEdit}>{t("users.actions.viewEdit")}</MenuItem>
        <MenuItem onClick={handleToggleActive}>
          {menuUser?.isActive ? t("users.actions.inactivate") : t("users.actions.activate")}
        </MenuItem>
      </Menu>

      <EditUserModal
        open={editOpen}
        userId={selectedUserId}
        onClose={() => { setEditOpen(false); setSelectedUserId(null); }}
        onChanged={reload}
      />

      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={reload}
      />
    </Paper>
  );
}
