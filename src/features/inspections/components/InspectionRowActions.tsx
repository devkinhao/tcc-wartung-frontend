import { useState } from "react";
import { Button, IconButton, Menu, MenuItem, Stack, Tooltip } from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BlockIcon from "@mui/icons-material/Block";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useTranslation } from "react-i18next";

import type { InspectionListItem } from "../api/inspections.list.api";

type Props = {
  item: InspectionListItem;
  onRenew: (item: InspectionListItem) => void;
  onDeactivate: (item: InspectionListItem) => void;
  onDelete: (item: InspectionListItem) => void;
};

/** Ações da linha na lista de inspeções: Renovar (botão) + menu Desativar / Excluir. */
export function InspectionRowActions({ item, onRenew, onDeactivate, onDelete }: Props) {
  const { t } = useTranslation();
  const [menuEl, setMenuEl] = useState<HTMLElement | null>(null);

  const canRenew = item.isActive && !item.isRenewed;

  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      justifyContent="flex-end"
      onClick={(e) => e.stopPropagation()}
    >
      {canRenew ? (
        <Button
          variant="outlined"
          size="small"
          startIcon={<AutorenewIcon />}
          onClick={() => onRenew(item)}
          sx={{ textTransform: "none" }}
        >
          {t("inspections.renewModal.actions.confirmShort")}
        </Button>
      ) : null}

      <Tooltip title={t("common.actions.more")}>
        <IconButton size="small" onClick={(e) => setMenuEl(e.currentTarget)} aria-label={t("common.actions.more")}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={menuEl} open={Boolean(menuEl)} onClose={() => setMenuEl(null)}>
        {item.isActive ? (
          <MenuItem
            onClick={() => {
              setMenuEl(null);
              onDeactivate(item);
            }}
          >
            <BlockIcon fontSize="small" sx={{ mr: 1 }} />
            {t("inspections.deactivate.action")}
          </MenuItem>
        ) : null}
        <MenuItem
          onClick={() => {
            setMenuEl(null);
            onDelete(item);
          }}
        >
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
          {t("inspectionDetails.actions.delete")}
        </MenuItem>
      </Menu>
    </Stack>
  );
}
