import { NavLink } from "react-router-dom";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { ChevronRight, MenuOpen } from "@mui/icons-material";

import { menuPrincipal, menuOutros } from "./menu";
import { MenuItem } from "./menu.types";
import { canAccess } from "@/features/auth/permissions";
import { useMe } from "@/hooks/useMe";

export const DRAWER_WIDTH = 260;
export const DRAWER_COLLAPSED_WIDTH = 72;

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  drawerWidth: number;
};

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const theme = useTheme();
  const { data: user, isLoading } = useMe();
  if (isLoading) return null;

  const permissions = user?.permissions ?? [];
  const drawerWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  const renderItem = (item: MenuItem) => {
    if (!canAccess(permissions, item.permissions)) return null;

    const Icon = item.icon;

    const content = (
      <ListItemButton
        component={NavLink}
        to={item.to}
        sx={(theme) => ({
          my: 0.5,
          mx: 0,           // 0 margin ensures the button always spans full width
          borderRadius: 0, // Set to 0 or use a different style for active state
          minHeight: 44,
          px: 0,           // 0 padding so we control centering manually
          justifyContent: "flex-start",
          "&.active": {
            backgroundColor: theme.palette.action.selected,
          },
        })}
      >
        <ListItemIcon
          sx={{
            minWidth: DRAWER_COLLAPSED_WIDTH, // Fixed width matching the drawer
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "inherit",
          }}
        >
          <Icon sx={{ fontSize: 22 }} />
        </ListItemIcon>

        <ListItemText
          primary={item.label}
          primaryTypographyProps={{
            noWrap: true,
            fontSize: 14,
            fontWeight: 500,
          }}
          sx={{
            opacity: collapsed ? 0 : 1,
            transition: "opacity 0.2s",
            m: 0,
          }}
        />
      </ListItemButton>
    );

    return collapsed ? (
      <Tooltip key={item.to} title={item.label} placement="right">
        <Box>{content}</Box>
      </Tooltip>
    ) : (
      <Box key={item.to}>{content}</Box>
    );
  };

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          overflowX: "hidden",
          boxSizing: "border-box",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          transition: theme.transitions.create("width", {
            duration: theme.transitions.duration.standard,
          }),
        },
      }}
    >
      {/* Logo */}
      <Box
        component={NavLink}
        to="/dashboard"
        sx={{
          display: "flex",
          alignItems: "center",
          px: 0, // Remove padding to control spacing via the icon container
          py: 1.5,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <Box 
          sx={{ 
            width: DRAWER_COLLAPSED_WIDTH, // Match the sidebar width
            display: "flex", 
            justifyContent: "center", 
            flexShrink: 0 
          }}
        >
          <Box component="img" src="/logo.png" alt="Logo" sx={{ height: 32, width: "auto" }} />
        </Box>
        
        {!collapsed && (
          <Typography variant="subtitle1" fontWeight={700} noWrap sx={{ ml: 1 }}>
            Engenharia Maas
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, py: 1 }}>
        <List disablePadding>{menuPrincipal.map(renderItem)}</List>

        <Divider sx={{ my: 1 }} />

        <List disablePadding>{menuOutros.map(renderItem)}</List>
      </Box>

      {/* Collapse */}
      <Box sx={{ display: "flex", justifyContent: collapsed ? "center" : "flex-end", p: 1 }}>
        <IconButton onClick={onToggle} aria-label={collapsed ? "Expandir menu" : "Recolher menu"}>
          {collapsed ? <ChevronRight /> : <MenuOpen />}
        </IconButton>
      </Box>
    </Drawer>
  );
}