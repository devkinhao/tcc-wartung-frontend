import { Tooltip } from "@/components/Tooltip";
import { Chat, Close } from "@mui/icons-material";
import { Fab } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChatPanel } from "./ChatPanel";

export function ChatButton() {
  /** Hooks. */
  const { t } = useTranslation();

  /** Estados. */
  const [open, setOpen] = useState(false);

  return (
    <>
      {/** Painel do assistente que acompanha o estado do botão flutuante. */}
      <ChatPanel open={open} onClose={() => setOpen(false)} />
      <Tooltip
        title={open ? t("common.actions.close") : t("chatbot.tooltip.title")}
        placement="left"
      >
        <Fab
          color="primary"
          aria-label={t("chatbot.tooltip.title")}
          sx={{
            color: "text.contrast",
            position: "fixed",
            bottom: 24,
            right: 24,
            zIndex: 1200,
          }}
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? <Close /> : <Chat />}
        </Fab>
      </Tooltip>
    </>
  );
}
