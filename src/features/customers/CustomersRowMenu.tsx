import { useNavigate } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { InspectionsQuickViewDialog } from "./components/InspectionsQuickViewDialog";

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
  const [quickViewOpen, setQuickViewOpen] = useState(false);

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

        <MenuItem
          onClick={() => {
            handleClose();
            setQuickViewOpen(true);
          }}
        >
          <ListItemIcon>
            <FactCheckIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("customers.rowMenu.inspections")}</ListItemText>
        </MenuItem>
      </Menu>

      <InspectionsQuickViewDialog open={quickViewOpen} customerId={customerId} onClose={() => setQuickViewOpen(false)} />
    </>
  );
}