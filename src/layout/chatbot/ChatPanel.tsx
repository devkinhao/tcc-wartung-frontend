import { useEffect, useRef } from "react";
import { Box, Button, IconButton, Paper, Stack, Tooltip, Typography, Fade } from "@mui/material";
import { Close, ArrowBack } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useChatBot } from "./useChatBot";

type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const { t } = useTranslation();
  const { messages, currentOptions, canGoBack, selectOption, goBack } = useChatBot();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentOptions]);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [open]);

  if (!open) return null;

  return (
    <Fade in={open}>
      <Paper
        elevation={6}
        sx={{
          position: "fixed",
          bottom: 96,
          right: 24,
          width: 340,
          height: 460,
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
              <Close fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Stack spacing={1} sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                alignSelf: message.from === "user" ? "flex-end" : "flex-start",
                bgcolor: message.from === "user" ? "primary.main" : "action.hover",
                color: message.from === "user" ? "primary.contrastText" : "text.primary",
                borderRadius: 2,
                px: 1.5,
                py: 1,
                maxWidth: "85%",
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {message.text}
              </Typography>
            </Box>
          ))}

          {(currentOptions.length > 0 || canGoBack) && (
            <Stack spacing={0.75} sx={{ pt: 0.5 }}>
              {currentOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="outlined"
                  fullWidth
                  onClick={() => selectOption(option)}
                  sx={{ justifyContent: "flex-start", textTransform: "none" }}
                >
                  {t(option.labelKey)}
                </Button>
              ))}
              {canGoBack && (
                <Button
                  variant="text"
                  fullWidth
                  startIcon={<ArrowBack fontSize="small" />}
                  onClick={goBack}
                  sx={{ justifyContent: "flex-start", textTransform: "none" }}
                >
                  {t("chatbot.menu.back")}
                </Button>
              )}
            </Stack>
          )}

          <div ref={bottomRef} />
        </Stack>
      </Paper>
    </Fade>
  );
}
