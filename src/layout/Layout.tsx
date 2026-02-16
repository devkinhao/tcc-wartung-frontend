import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Box, Toolbar } from "@mui/material";

import Sidebar from "./sidebar/Sidebar";
import Header from "./header/Header";
import { ChatButton } from "./chatbot/ChatButton";

export const DRAWER_WIDTH = 260;
export const DRAWER_COLLAPSED_WIDTH = 72;

export default function Layout() {
  const [collapsed, setCollapsed] = useState(true);
  const drawerWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* Sidebar FIXED */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((p) => !p)}
        drawerWidth={drawerWidth}
      />

      {/* Header FIXED and aligned with drawer */}
      <Header drawerWidth={drawerWidth} />

      {/* Content shifts/resizes together */}
      <Box
        sx={{
          ml: `${drawerWidth}px`,
          transition: (t) =>
            t.transitions.create("margin-left", {
              duration: t.transitions.duration.standard,
            }),
        }}
      >
        {/* pushes content below fixed AppBar */}
        <Toolbar />

        <Box component="main" sx={{ p: 3 }}>
          <Outlet />
        </Box>

        <ChatButton />
      </Box>
    </Box>
  );
}