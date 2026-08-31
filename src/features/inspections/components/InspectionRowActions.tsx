import { useState } from "react";
import { Button, IconButton, Menu, MenuItem, Stack, Tooltip } from "@mui/material";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import BlockIcon from "@mui/icons-material/Block";
import { useTranslation } from "react-i18next";

import type { InspectionListItem } from "../api/inspections.list.api";

type Props = {
  item: InspectionListItem;
  onRenew: (item: InspectionListItem) => void;
  onDeactivate: (item: InspectionListItem) => void;
};

/** Ações da linha na lista de inspeções: Renovar (botão) + menu "Não renovar". */
export function InspectionRowActions({ item, onRenew, onDeactivate }: Props) {
  const { t } = useTranslation();
  const [menuEl, setMenuEl] = useState<HTMLElement | null>(null);

  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      justifyContent="flex-end"
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="outlined"
        size="small"
        startIcon={<AutorenewIcon />}
        onClick={() => onRenew(item)}
        sx={{ textTransform: "none" }}
      >
        {t("inspections.renewModal.actions.confirmShort")}
      </Button>

      <Tooltip title={t("common.actions.more")}>
        <IconButton size="small" onClick={(e) => setMenuEl(e.currentTarget)} aria-label={t("common.actions.more")}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={menuEl} open={Boolean(menuEl)} onClose={() => setMenuEl(null)}>
        <MenuItem
          onClick={() => {
            setMenuEl(null);
            onDeactivate(item);
          }}
        >
          <BlockIcon fontSize="small" sx={{ mr: 1 }} />
          {t("inspections.deactivate.action")}
        </MenuItem>
      </Menu>
    </Stack>
  );
}
