import { SystemLogo } from "@/components/SystemLogo";
import { Tooltip } from "@/components/Tooltip";
import { canAccess } from "@/features/auth/permissions";
import { useMe } from "@/hooks/useMe";
import { paths } from "@/routes/paths";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import { DRAWER_COLLAPSED_WIDTH, DRAWER_WIDTH } from "./constants";
import { mainMenu } from "./menu";
import { MenuItem } from "./menu.types";

type SidebarProps = {
  collapsed: boolean;
  /** Alterna entre os modos de visualização para ampliar ou reduzir o menu. */
  onToggle: () => void;
};

/** Props do item exibido na sidebar. */
type SidebarItemProps = {
  item: MenuItem;
  collapsed: boolean;
  permissions: string[];
};

/** Item de navegação da sidebar. */
const SidebarItem = memo(function SidebarItem({
  item,
  collapsed,
  permissions,
}: SidebarItemProps) {
  /** Hooks. */
  const { t } = useTranslation();

  if (!canAccess(permissions, item.permissions)) return null;

  const Icon = item.icon;
  const label = t(item.label);
  const tooltip = t(item.tooltip);

  const content = (
    <ListItemButton
      component={NavLink}
      to={item.to}
      sx={(theme) => ({
        minHeight: 50,
        px: 0,
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
        }}
      >
        <Icon />
      </ListItemIcon>
      <ListItemText
        primary={label}
        sx={{
          opacity: collapsed ? 0 : 1,
          transition: "opacity 0.2s",
        }}
        slotProps={{
          primary: {
            variant: "body1",
            noWrap: true,
          },
        }}
      />
    </ListItemButton>
  );

  return (
    <Tooltip title={tooltip} placement="right">
      <Box>{content}</Box>
    </Tooltip>
  );
});

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  /** Hooks. */
  const theme = useTheme();
  const { t } = useTranslation();
  const { data: user, isLoading } = useMe();

  /** Largura atual da sidebar conforme o estado recolhido ou expandido. */
  const drawerWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  /** Permissões do usuário para filtrar os itens de menu acessíveis na sidebar. */
  const permissions = user?.permissions ?? [];

  /** Estilos compartilhados da drawer para controlar largura e comportamento de transição. */
  const drawerSx = {
    width: drawerWidth,
    flexShrink: 0,
    "& .MuiDrawer-paper": {
      height: "100dvh",
      width: drawerWidth,
      overflowX: "hidden",
      position: "fixed",
      transition: theme.transitions.create("width", {
        duration: theme.transitions.duration.standard,
      }),
    },
  } as const;

  /**
   * Evita o deslocamento visual enquanto o usuário ainda está sendo carregado.
   * Enquanto isso, a drawer fica vazia para não renderizar um estado incompleto.
   */
  if (isLoading) {
    return <Drawer variant="permanent" open sx={drawerSx} />;
  }

  return (
    <Drawer variant="permanent" open sx={drawerSx}>
      {/** Logo do sistema com link para a home. */}
      <SystemLogo navigable to={paths.home} showLabel={!collapsed} />
      {/** Itens de menu acessíveis para o usuário. */}
      <Box sx={{ flex: 1, py: 1 }}>
        <List disablePadding>
          {mainMenu.map((item) => (
            <SidebarItem
              key={item.to}
              item={item}
              collapsed={collapsed}
              permissions={permissions}
            />
          ))}
        </List>
      </Box>
      {/** Botão para recolher ou expandir a sidebar. */}
      <Box
        sx={{
          display: "flex",
          justifyContent: collapsed ? "center" : "flex-end",
          p: 1,
        }}
      >
        <Tooltip
          title={
            collapsed
              ? t("sidebar.actions.expandMenu")
              : t("sidebar.actions.collapseMenu")
          }
          placement="right"
        >
          <IconButton
            onClick={onToggle}
            aria-label={
              collapsed
                ? t("sidebar.actions.expandMenu")
                : t("sidebar.actions.collapseMenu")
            }
          >
            {collapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        </Tooltip>
      </Box>
    </Drawer>
  );
}
