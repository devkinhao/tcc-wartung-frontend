import { usePreferences } from "@/features/preferences/usePreferences";
import { Box, Toolbar } from "@mui/material";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { ChatButton } from "./chatbot/ChatButton";
import Header from "./header/Header";
import { DRAWER_COLLAPSED_WIDTH, DRAWER_WIDTH } from "./sidebar/constants";
import Sidebar from "./sidebar/Sidebar";

export default function Layout() {
  /** Hooks. */
  const { preferences } = usePreferences();

  /** Estado da sidebar, iniciando expandido e alternando entre os modos recolhido e expandido conforme a interação do usuário. */
  const [collapsed, setCollapsed] = useState(false);

  /** Largura atual da navegação lateral, ajustada conforme o estado de recolhimento. */
  const drawerWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

  /** Exibe o chatbot somente quando a preferência global não desativa esse recurso. */
  const showChatbot = preferences.CHATBOT_ENABLED !== "false";

  return (
    <Box sx={{ height: "100dvh", bgcolor: "background.default" }}>
      {/** Navegação lateral principal. */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((p) => !p)} />
      {/** Cabeçalho global do sistema, com ajuste de largura conforme a sidebar. */}
      <Header drawerWidth={drawerWidth} />
      <Box
        sx={{
          /** Compensa a largura da sidebar para manter o conteúdo principal alinhado. */
          ml: `${drawerWidth}px`,
          transition: (t) =>
            t.transitions.create("margin-left", {
              duration: t.transitions.duration.standard,
            }),
        }}
      >
        {/** Reserva o espaço vertical do AppBar fixo no topo para o conteúdo da página não ficar escondido atrás do cabeçalho. */}
        <Toolbar />
        {/** Área principal da aplicação onde a rota ativa é renderizada. */}
        <Box component="main" sx={{ p: 3 }}>
          <Outlet />
        </Box>
        {showChatbot && <ChatButton />}
      </Box>
    </Box>
  );
}
