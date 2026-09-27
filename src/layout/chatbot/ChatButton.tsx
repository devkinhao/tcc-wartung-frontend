import { Tooltip } from "@/components/Tooltip";
import { useTour } from "@/features/tour/TourContext";
import { Chat, Close } from "@mui/icons-material";
import { Fab } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChatPanel } from "./ChatPanel";

export function ChatButton() {
  /** Hooks. */
  const { t } = useTranslation();
  const { activeTour } = useTour();

  /** Estados. */
  const [open, setOpen] = useState(false);

  /** Durante um tutorial quem conduz é o balão, então o assistente sai da frente. */
  const runningTour = activeTour !== null;

  return (
    <>
      {/** Painel do assistente que acompanha o estado do botão flutuante. Fica
           sempre montado — mesmo escondido durante um tutorial — para a conversa
           não perder o fio e poder comentar o fim do tutorial quando ele acabar. */}
      <ChatPanel open={open && !runningTour} onClose={() => setOpen(false)} />
      {!runningTour && (
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
      )}
    </>
  );
}
