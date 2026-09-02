import { memo } from "react";
import { NavLink } from "react-router-dom";
import {
  Box,
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
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

import { menuPrincipal } from "./menu";
import { MenuItem } from "./menu.types";
import { canAccess } from "@/features/auth/permissions";
import { useMe } from "@/hooks/useMe";
import { paths } from "@/routes/paths";
import { DRAWER_WIDTH, DRAWER_COLLAPSED_WIDTH } from "./constants";
import { typography } from "@/styles/typography";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

type SidebarItemProps = {
  item: MenuItem;
  collapsed: boolean;
  permissions: string[];
};

const SidebarItem = memo(function SidebarItem({ item, collapsed, permissions }: SidebarItemProps) {
  const { t } = useTranslation();

  if (!canAccess(permissions, item.permissions)) return null;

  const Icon = item.icon;
  const label = t(item.label);

  const content = (
    <ListItemButton
      component={NavLink}
      to={item.to}
      sx={(theme) => ({
        my: 0.5,
        mx: 0,
        borderRadius: 0,
        minHeight: 44,
        px: 0,
        justifyContent: "flex-start",
        "&.active": {
          backgroundColor: theme.palette.action.selected,
        },
      })}
    >
      <ListItemIcon
        sx={{
          minWidth: DRAWER_COLLAPSED_WIDTH,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "inherit",
        }}
      >
        <Icon sx={{ fontSize: 22 }} />
      </ListItemIcon>

      <ListItemText
        primary={label}
        sx={{
          opacity: collapsed ? 0 : 1,
          transition: "opacity 0.2s",
          m: 0,
        }}
        slotProps={{
          primary: {
            noWrap: true,
            variant: "body2",
            fontWeight: typography.weight.medium,
          }
        }}
      />
    </ListItemButton>
  );

  return collapsed ? (
    <Tooltip title={label} placement="right">
      <Box>{content}</Box>
    </Tooltip>
  ) : (
    <Box>{content}</Box>
  );
});

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { data: user, isLoading } = useMe();

  const drawerWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;
  const permissions = user?.permissions ?? [];

  const drawerSx = {
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
  } as const;

  // Retorna drawer vazio durante loading para evitar layout shift
  if (isLoading) {
    return <Drawer variant="permanent" open sx={drawerSx} />;
  }

  return (
    <Drawer variant="permanent" open sx={drawerSx}>
      {/* Logo */}
      <Box
        component={NavLink}
        to={paths.home}
        sx={{
          display: "flex",
          alignItems: "center",
          px: 0,
          py: 1.5,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <Box
          sx={{
            width: DRAWER_COLLAPSED_WIDTH,
            display: "flex",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Box component="img" src="/logo.png" alt={t("common.logoAlt")} sx={{ height: 32, width: "auto" }} />
        </Box>

        {!collapsed && (
          <Typography variant="subtitle1" fontWeight={typography.weight.bold} noWrap sx={{ ml: 1 }}>
            {t("app.brandName")}
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, py: 1 }}>
        <List disablePadding>
          {menuPrincipal.map((item) => (
            <SidebarItem key={item.to} item={item} collapsed={collapsed} permissions={permissions} />
          ))}
        </List>
      </Box>

      {/* Collapse toggle */}
      <Box sx={{ display: "flex", justifyContent: collapsed ? "center" : "flex-end", p: 1 }}>
        <Tooltip
          title={collapsed ? t("sidebar.actions.expandMenu") : t("sidebar.actions.collapseMenu")}
          placement="right"
        >
          <IconButton
            onClick={onToggle}
            aria-label={collapsed ? t("sidebar.actions.expandMenu") : t("sidebar.actions.collapseMenu")}
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}
