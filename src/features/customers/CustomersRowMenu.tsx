import { useNavigate } from "react-router-dom";
import MoreVertIcon   from "@mui/icons-material/MoreVert";
import FactCheckIcon  from "@mui/icons-material/FactCheck";
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  customerId: number;
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
};

/**
 * Menu de ações da linha — simplificado.
 *
 * "Ver cliente" foi removido por ser redundante com o clique na linha da tabela
 * (Heurística Nielsen #8 — minimalismo).
 *
 * "Inspeções" navega diretamente para a aba de inspeções do cliente,
 * eliminando o modal que quebrava o contexto de navegação.
 */
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
            navigate(`/customers/${customerId}?tab=inspections`);
          }}
        >
          <ListItemIcon>
            <FactCheckIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t("customers.rowMenu.inspections")}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
