import { usePreferences } from "@/features/preferences/usePreferences";
import { AppBar, Box, Toolbar } from "@mui/material";
import { NotificationsMenu } from "./NotificationsMenu";
import { UserMenu } from "./UserMenu";

/** Cabeçalho fixo da aplicação, acompanhando a largura da sidebar. */
export default function Header({ drawerWidth }: { drawerWidth: number }) {
  /** Hooks. */
  const { preferences } = usePreferences();

  /** Mostra o menu de notificações caso a preferência esteja ativa para o usuário. */
  const showNotifications = preferences.SHOW_NOTIFICATIONS !== "false";

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        /** Ajusta o cabeçalho para ficar ao lado da sidebar em largura dinâmica. */
        ml: `${drawerWidth}px`,
        width: `calc(100% - ${drawerWidth}px)`,
        zIndex: (th) => th.zIndex.drawer + 1,
        transition: (th) =>
          th.transitions.create(["margin-left", "width"], {
            duration: th.transitions.duration.standard,
          }),
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <NotificationsMenu disabled={!showNotifications} />
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
