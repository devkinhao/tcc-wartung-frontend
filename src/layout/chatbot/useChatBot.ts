import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMe } from "@/hooks/useMe";
import { canAccess } from "@/features/auth/permissions";
import { chatIntents } from "./chatRules";
import { normalize } from "./normalize";

export type ChatMessage = {
  id: string;
  from: "user" | "bot";
  text: string;
};

let nextId = 0;
function createId(): string {
  nextId += 1;
  return `msg-${nextId}`;
}

export function useChatBot() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: me } = useMe();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: createId(), from: "bot", text: t("chatbot.responses.greeting") },
  ]);

  const sendMessage = useCallback(
    (rawText: string) => {
      const text = rawText.trim();
      if (!text) return;

      const normalized = normalize(text);
      const permissions = me?.permissions ?? [];
      const matched = chatIntents.find((intent) =>
        intent.patterns.some((pattern) => pattern.test(normalized))
      );

      let responseText: string;
      if (!matched) {
        responseText = t("chatbot.responses.fallback");
      } else if (matched.permissions && !canAccess(permissions, matched.permissions)) {
        responseText = t("chatbot.responses.forbidden");
      } else {
        responseText = matched.respond({ navigate, t });
      }

      setMessages((prev) => [
        ...prev,
        { id: createId(), from: "user", text },
        { id: createId(), from: "bot", text: responseText },
      ]);
    },
    [me, navigate, t]
  );

  return { messages, sendMessage };
}
