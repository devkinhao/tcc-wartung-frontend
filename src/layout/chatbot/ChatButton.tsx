import { useState } from "react";
import { Fab } from "@mui/material";
import { Chat, Close } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { ChatPanel } from "./ChatPanel";

export function ChatButton() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <>
      <ChatPanel open={open} onClose={() => setOpen(false)} />
      <Fab
        color="primary"
        aria-label={t("chatbot.openLabel")}
        sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1200 }}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <Close /> : <Chat />}
      </Fab>
    </>
  );
}
