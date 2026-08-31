import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";

import { useUsers, type UserRow } from "../hooks/useUsers";
import { EditUserModal } from "../components/EditUserModal";
import { CreateUserModal } from "../components/CreateUserModal";
import { SortableHeader } from "@/components/SortableHeader";
import { DataTableContainer } from "@/components/DataTableContainer";
import { Breadcrumb } from "@/layout/header/Breadcrumb";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { paths } from "@/routes/paths";

export default function UsersPage() {
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const { users, isLoading, error, reload, deleteUser, isDeleting, sort } = useUsers(query);
  const sharedSortProps = { sortBy: sort.by, sortDir: sort.dir, onSort: sort.handle };

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRow | null>(null);

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

  // Ação principal: clicar na linha abre a edição (mesmo padrão de Inspeções e
  // Empresas). O menu ⋮ fica só para "Excluir" — ação rara e destrutiva.
  function openEdit(u: UserRow) {
    setSelectedUserId(u.id);
    setEditOpen(true);
  }

  function handleDelete() {
    if (!menuUser) return;
    setDeleteTarget(menuUser);
    closeMenu();
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteUser(deleteTarget);
    setDeleteTarget(null);
  }

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Breadcrumb items={breadcrumbMap[paths.users]} size="large" />
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
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} disabled={isLoading}>
            {t("users.actions.newUser")}
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ position: "relative" }}>
        {(isLoading || isDeleting) && (
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
              borderRadius: 2,
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}

        <DataTableContainer>
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              <SortableHeader label={t("users.table.username")} column="username" {...sharedSortProps} width="15%" />
              <SortableHeader label={t("users.table.fullName")} column="fullName" {...sharedSortProps} width="40%" />
              <SortableHeader label={t("users.table.email")} column="email" {...sharedSortProps} width="28%" />
              <SortableHeader label={t("users.table.status")} column="isActive" {...sharedSortProps} width="9%" />
              <TableCell align="right" sx={{ width: "8%" }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover sx={{ cursor: "pointer" }} onClick={() => openEdit(u)}>
                <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={u.username}>
                  {u.username}
                </TableCell>
                <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={u.fullName}>
                  {u.fullName}
                </TableCell>
                <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={u.email}>
                  {u.email}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={u.isActive ? t("common.status.active") : t("common.status.inactive")}
                    color={u.isActive ? "success" : "default"}
                    variant={u.isActive ? "filled" : "outlined"}
                  />
                </TableCell>
                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                  <IconButton
                    size="small"
                    onClick={(e) => openMenu(e, u)}
                    aria-label={t("common.actions.more")}
                  >
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
        </DataTableContainer>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={handleDelete}>{t("users.actions.delete")}</MenuItem>
      </Menu>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("users.confirmDelete.title")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            {t("users.confirmDelete.message", { name: deleteTarget?.fullName ?? "" })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>{t("common.actions.cancel")}</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            {t("common.actions.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

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
    </Box>
  );
}
