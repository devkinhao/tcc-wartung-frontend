import { useLocation } from "react-router-dom";
import { AppBar, Box, Toolbar } from "@mui/material";
import { Breadcrumb } from "./Breadcrumb";
import { UserMenu } from "./UserMenu";
import { NotificationsMenu } from "./NotificationsMenu";
import { breadcrumbMap } from "./breadcrumbMap";

export default function Header({ drawerWidth }: { drawerWidth: number }) {
  const location = useLocation();
  const pathname = location.pathname;

  // Static crumbs (exact match)
  let crumbs = breadcrumbMap[pathname];

  // Dynamic crumbs (pattern match)
  if (!crumbs) {
    // Customers details: /customers/:id
    if (/^\/customers\/\d+$/.test(pathname)) {
      crumbs = [
        { label: "Início", path: "/dashboard" },
        { label: "Lista de Empresas", path: "/customers" },
        { label: "Detalhes do cliente" },
      ];
    }
  }

  if (!crumbs) crumbs = [{ label: "Início", path: "/dashboard" }];

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        ml: `${drawerWidth}px`,
        width: `calc(100% - ${drawerWidth}px)`,
        zIndex: (t) => t.zIndex.drawer + 1,
        transition: (t) => t.transitions.create(["margin-left", "width"], {
          duration: t.transitions.duration.standard,
        }),
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Breadcrumb items={crumbs} />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <NotificationsMenu />
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}