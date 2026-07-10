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
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";

import { useUsers, type UserRow } from "../hooks/useUsers";
import { EditUserModal } from "../components/EditUserModal";
import { CreateUserModal } from "../components/CreateUserModal";

type SortableHeaderProps = {
  label: string;
  column: keyof UserRow;
  sortBy: keyof UserRow | null;
  sortDir: "asc" | "desc";
  onSort: (c: keyof UserRow) => void;
  align?: "left" | "center" | "right";
  width?: string;
};

function SortableHeader({ label, column, sortBy, sortDir, onSort, align = "left", width }: SortableHeaderProps) {
  const active = sortBy === column;
  return (
    <TableCell
      align={align}
      onClick={() => onSort(column)}
      sx={{
        cursor: "pointer",
        userSelect: "none",
        width,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      <TableSortLabel
        active={active}
        direction={active ? sortDir : "asc"}
        sx={{
          position: "relative",
          "& .MuiTableSortLabel-icon": {
            position: "absolute",
            left: "100%",
            marginLeft: "4px",
          },
        }}
      >
        <b>{label}</b>
      </TableSortLabel>
    </TableCell>
  );
}

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

  function handleViewEdit() {
    if (!menuUser) return;
    setSelectedUserId(menuUser.id);
    setEditOpen(true);
    closeMenu();
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
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} disabled={isLoading}>
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
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}

        <Table size="small" sx={{ tableLayout: "fixed" }}>
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              <SortableHeader label={t("users.table.username")} column="username" {...sharedSortProps} width="15%" />
              <SortableHeader label={t("users.table.fullName")} column="fullName" {...sharedSortProps} width="40%" />
              <SortableHeader label={t("users.table.email")} column="email" {...sharedSortProps} width="28%" />
              <SortableHeader label={t("users.table.status")} column="isActive" {...sharedSortProps} width="9%" />
              <TableCell align="center" sx={{ width: "8%" }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
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
        <MenuItem onClick={handleDelete}>{t("users.actions.delete")}</MenuItem>
      </Menu>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("users.confirmDelete.title")}</DialogTitle>
        <DialogContent>
          <Typography>
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
    </Paper>
  );
}
