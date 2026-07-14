import { useState } from "react";
import {
  Box,
  Button,
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

import { useServiceTypes } from "../hooks/useServiceTypes";
import type { ServiceTypeResponseDTO } from "../api/serviceTypes.api";
import { CreateServiceTypeModal } from "../components/CreateServiceTypeModal";
import { EditServiceTypeModal } from "../components/EditServiceTypeModal";
import { DataTableContainer } from "@/components/DataTableContainer";

export default function ServiceTypesPage() {
  const { t } = useTranslation();

  const [query, setQuery] = useState("");
  const { serviceTypes, isLoading, error, reload, deleteServiceType, isDeleting } = useServiceTypes(query);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ServiceTypeResponseDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceTypeResponseDTO | null>(null);

  // Estado do row-menu
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuItem, setMenuItem] = useState<ServiceTypeResponseDTO | null>(null);

  function openMenu(e: React.MouseEvent<HTMLElement>, s: ServiceTypeResponseDTO) {
    setMenuAnchor(e.currentTarget);
    setMenuItem(s);
  }

  function closeMenu() {
    setMenuAnchor(null);
    setMenuItem(null);
  }

  function handleEdit() {
    if (!menuItem) return;
    setEditTarget(menuItem);
    closeMenu();
  }

  function handleDelete() {
    if (!menuItem) return;
    setDeleteTarget(menuItem);
    closeMenu();
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    deleteServiceType(deleteTarget);
    setDeleteTarget(null);
  }

  return (
    <Paper elevation={1} sx={{ maxWidth: 800, p: 3, borderRadius: 2, bgcolor: "background.paper" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600} color="text.primary">
            {t("serviceTypes.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("serviceTypes.description")}
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
            label={t("serviceTypes.search")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ minWidth: 260 }}
            disabled={isLoading}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} disabled={isLoading}>
            {t("serviceTypes.actions.new")}
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
            }}
          >
            <CircularProgress size={28} />
          </Box>
        )}

        <DataTableContainer>
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              <TableCell sx={{ width: "85%" }}><b>{t("serviceTypes.table.name")}</b></TableCell>
              <TableCell align="center" sx={{ width: "15%" }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {serviceTypes.map((s) => (
              <TableRow key={s.id} hover>
                <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={s.name}>
                  {s.name}
                </TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={(e) => openMenu(e, s)}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {!isLoading && serviceTypes.length === 0 && (
              <TableRow>
                <TableCell colSpan={2}>
                  <Typography variant="body2" color="text.secondary">
                    {t("serviceTypes.empty")}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </DataTableContainer>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem onClick={handleEdit}>{t("serviceTypes.actions.edit")}</MenuItem>
        <MenuItem onClick={handleDelete}>{t("serviceTypes.actions.delete")}</MenuItem>
      </Menu>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("serviceTypes.confirmDelete.title")}</DialogTitle>
        <DialogContent>
          <Typography>
            {t("serviceTypes.confirmDelete.message", { name: deleteTarget?.name ?? "" })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>{t("common.actions.cancel")}</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            {t("common.actions.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      <CreateServiceTypeModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={reload} />

      <EditServiceTypeModal
        open={Boolean(editTarget)}
        serviceType={editTarget}
        onClose={() => setEditTarget(null)}
        onUpdated={reload}
      />
    </Paper>
  );
}
