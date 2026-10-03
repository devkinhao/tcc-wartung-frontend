import { usePreferences } from "@/features/preferences/usePreferences";
import { TourProvider } from "@/features/tour/TourProvider";
import { Box, Toolbar } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ChatButton } from "./chatbot/ChatButton";
import { APPBAR_HEIGHT } from "./header/constants";
import Header from "./header/Header";
import { DRAWER_COLLAPSED_WIDTH, DRAWER_WIDTH } from "./sidebar/constants";
import Sidebar from "./sidebar/Sidebar";

/** Estrutura base das telas autenticadas: sidebar, header fixo e área da rota ativa. */
export default function Layout() {
  /** Hooks. */
  const { preferences } = usePreferences();

  /** Estados. */
  const [collapsed, setCollapsed] = useState(false);

  /** Largura da sidebar no estado atual, usada para deslocar header e conteúdo. */
  const drawerWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  /** Exibe o chatbot, exceto se a preferência global o desativar. */
  const showChatbot = preferences.CHATBOT_ENABLED !== "false";

  return (
    /** Por atravessarem as telas, o estado dos tutoriais fica acima das rotas. */
    <TourProvider>
      <Box sx={{ height: "100dvh", bgcolor: "background.default" }}>
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
          {/** Espaçador com a altura do header fixo, para não cobrir o conteúdo. */}
          <Toolbar sx={{ minHeight: APPBAR_HEIGHT }} />
          <Box component="main" sx={{ p: 3 }}>
            <Outlet />
          </Box>
          {showChatbot && <ChatButton />}
        </Box>
      </Box>
    </TourProvider>
  );
}
