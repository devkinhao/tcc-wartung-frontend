import { useEffect, useRef, useState, type FormEvent } from "react";
import { Box, IconButton, Paper, Stack, TextField, Typography, Fade } from "@mui/material";
import { Send, Close } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useChatBot } from "./useChatBot";

type ChatPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function ChatPanel({ open, onClose }: ChatPanelProps) {
  const { t } = useTranslation();
  const { messages, sendMessage } = useChatBot();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

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
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: "inherit" }}
            aria-label={t("common.actions.close")}
          >
            <Close fontSize="small" />
          </IconButton>
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
          <div ref={bottomRef} />
        </Stack>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", gap: 1, p: 1.5, borderTop: 1, borderColor: "divider" }}
        >
          <TextField
            size="small"
            fullWidth
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={t("chatbot.placeholder")}
            autoComplete="off"
          />
          <IconButton type="submit" color="primary" aria-label={t("chatbot.send")}>
            <Send />
          </IconButton>
        </Box>
      </Paper>
    </Fade>
  );
}
