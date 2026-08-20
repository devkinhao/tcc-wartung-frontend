import { AppBar, Box, Toolbar } from "@mui/material";
import { UserMenu } from "./UserMenu";
import { NotificationsMenu } from "./NotificationsMenu";
import { usePreferences } from "@/features/preferences/usePreferences";

export default function Header({ drawerWidth }: { drawerWidth: number }) {
  const { preferences } = usePreferences();
  const showNotifications = preferences.SHOW_NOTIFICATIONS !== "false";

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        ml: `${drawerWidth}px`,
        width: `calc(100% - ${drawerWidth}px)`,
        zIndex: (th) => th.zIndex.drawer + 1,
        transition: (th) =>
          th.transitions.create(["margin-left", "width"], {
            duration: th.transitions.duration.standard,
          }),
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <NotificationsMenu disabled={!showNotifications} />
          <UserMenu />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
