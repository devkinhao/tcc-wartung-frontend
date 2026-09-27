import { useEffect, useRef } from "react";
import {
  Box,
  Button,
  Fade,
  IconButton,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

import { Tooltip } from "@/components/Tooltip";
import type { ChatOption } from "./chatMenu";
import { useChatConversation, type ChatMessage } from "./useChatConversation";

const SUPPORT_EMAIL = "ermaas@furb.br";

type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
};

function MessageBubble({ message }: { message: ChatMessage }) {
  const { t } = useTranslation();
  const fromUser = message.from === "user";

  return (
    <Box
      sx={{
        alignSelf: fromUser ? "flex-end" : "flex-start",
        bgcolor: fromUser ? "primary.main" : "action.hover",
        color: fromUser ? "primary.contrastText" : "text.primary",
        borderRadius: 2,
        px: 1.5,
        py: 1,
        maxWidth: "85%",
      }}
    >
      <Typography variant="body2">{t(message.textKey)}</Typography>
      {message.withSupportEmail && (
        <Link href={`mailto:${SUPPORT_EMAIL}`} variant="body2" underline="hover">
          {SUPPORT_EMAIL}
        </Link>
      )}
    </Box>
  );
}

/**
 * Seta para assunto que abre um submenu, visto para tutorial já concluído.
 * Nada para quem só responde.
 */
function optionEndIcon(option: ChatOption, isCompleted: (tourId: string) => boolean) {
  if (option.kind === "section") return <ChevronRightIcon fontSize="small" />;
  if (option.kind === "tour" && isCompleted(option.tourId)) {
    return <CheckCircleIcon fontSize="small" color="success" />;
  }
  return undefined;
}

/**
 * Assistente do sistema: um chatbot de menu, em que o usuário responde escolhendo
 * uma opção. O que ele entrega não é texto — cada tutorial escolhido vira uma
 * condução passo a passo na própria tela (ver src/features/tour). Só o contato do
 * suporte continua sendo resposta escrita, porque não existe em nenhuma outra tela.
 */
export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const { t } = useTranslation();
  const { messages, options, canGoBack, isCompleted, select, goBack } = useChatConversation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ block: "end" });
  }, [open, messages]);

  if (!open) return null;

  return (
    <Fade in={open}>
      <Paper
        elevation={6}
        sx={{
          position: "fixed",
          bottom: 96,
          right: 24,
          width: 360,
          maxWidth: "calc(100vw - 48px)",
          height: 500,
          maxHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          zIndex: 1300,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle1">{t("chatbot.title")}</Typography>
          <Tooltip title={t("common.actions.close")}>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: "inherit" }}
              aria-label={t("common.actions.close")}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Stack spacing={1} sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* As opções são a vez do usuário na conversa: ele responde escolhendo. */}
          <Stack spacing={0.75} sx={{ pt: 0.5 }}>
            {options.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                {t("chatbot.empty")}
              </Typography>
            ) : (
              options.map((option) => (
                <Button
                  key={option.id}
                  variant="outlined"
                  fullWidth
                  onClick={() => select(option)}
                  endIcon={optionEndIcon(option, isCompleted)}
                  sx={{ justifyContent: "flex-start", textTransform: "none" }}
                >
                  {t(option.labelKey)}
                </Button>
              ))
            )}
            {canGoBack && (
              <Button
                variant="text"
                fullWidth
                startIcon={<ArrowBackIcon fontSize="small" />}
                onClick={goBack}
                sx={{ justifyContent: "flex-start", textTransform: "none" }}
              >
                {t("chatbot.actions.back")}
              </Button>
            )}
          </Stack>

          <div ref={bottomRef} />
        </Stack>
      </Paper>
    </Fade>
  );
}
