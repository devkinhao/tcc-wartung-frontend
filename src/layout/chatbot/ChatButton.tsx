import { Fab } from "@mui/material";
import { Chat } from "@mui/icons-material";

export function ChatButton() {
  return (
    <Fab
      color="primary"
      aria-label="Chat"
      sx={{ position: "fixed", bottom: 24, right: 24, zIndex: 1200 }}
      onClick={() => {
        // TODO: open chatbot
      }}
    >
      <Chat />
    </Fab>
  );
}