import MoreVertIcon from "@mui/icons-material/MoreVert";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
};

export function CustomersRowMenu({ open, onToggle, onClose }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) setAnchorEl(null);
  }, [open]);

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    onToggle();
  };

  const handleClose = () => {
    onClose();
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen} aria-label="Ações">
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon><VisibilityIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Ver cliente</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon><FactCheckIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Inspeções</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}