import { useState } from "react";
import { Badge, IconButton, Menu, MenuItem, Typography, Box } from "@mui/material";
import { Notifications } from "@mui/icons-material";

export function NotificationsMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        aria-label="Notificações"
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
            Notificações
          </Typography>
        </Box>

        <MenuItem disabled>
          <Typography variant="body2" color="text.secondary">
            Nenhuma notificação no momento
          </Typography>
        </MenuItem>
      </Menu>
    </>
  );
}