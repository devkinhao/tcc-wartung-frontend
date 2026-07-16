import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Box, Toolbar } from "@mui/material";

import Sidebar from "./sidebar/Sidebar";
import Header from "./header/Header";
import { ChatButton } from "./chatbot/ChatButton";
import { DRAWER_WIDTH, DRAWER_COLLAPSED_WIDTH } from "./sidebar/constants";
import { usePreferences } from "@/features/preferences/usePreferences";

export default function Layout() {
  const [collapsed, setCollapsed] = useState(true);
  const drawerWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;
  const { preferences } = usePreferences();
  const showChatbot = preferences.CHATBOT_ENABLED !== "false";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((p) => !p)}
      />

      <Header drawerWidth={drawerWidth} />

      <Box
        sx={{
          ml: `${drawerWidth}px`,
          transition: (t) =>
            t.transitions.create("margin-left", {
              duration: t.transitions.duration.standard,
            }),
        }}
      >
        <Toolbar />

        <Box component="main" sx={{ p: 3 }}>
          <Outlet />
        </Box>

        {showChatbot && <ChatButton />}
      </Box>
    </Box>
  );
}
