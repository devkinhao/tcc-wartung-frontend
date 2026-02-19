import { useState } from "react";
import { Badge, IconButton, Menu, MenuItem, Typography, Box } from "@mui/material";
import { Notifications } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export function NotificationsMenu() {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        aria-label={t("notifications.ariaLabel")}
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="large"
      >
        <Badge color="error" variant="dot">
          <Notifications />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { width: 320 } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {t("notifications.title")}
          </Typography>
        </Box>

        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            {t("notifications.empty")}
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}