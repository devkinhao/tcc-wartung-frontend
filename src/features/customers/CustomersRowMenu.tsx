import { useNavigate } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  customerId: number;
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
};

export function CustomersRowMenu({ customerId, open, onToggle, onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      <IconButton size="small" onClick={handleOpen} aria-label={t("customers.rowMenu.actionsLabel")}>
        <MoreVertIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            handleClose();
            navigate(`/customers/${customerId}`);
          }}
        >
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("customers.rowMenu.view")}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("common.actions.edit")}</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <FactCheckIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("customers.rowMenu.inspections")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}