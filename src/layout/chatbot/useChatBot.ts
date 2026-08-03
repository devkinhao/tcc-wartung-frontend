import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useMe } from "@/hooks/useMe";
import { canAccess } from "@/features/auth/permissions";
import { chatMenuRoot, type ChatMenuOption } from "./chatMenu";

export type ChatMessage = {
  id: string;
  from: "user" | "bot";
  text: string;
  pending?: boolean;
};

const STORAGE_KEY = "chatbot:v1:messages";
const HISTORY_LIMIT = 50;

let nextId = 0;
function createId(): string {
  nextId += 1;
  return `msg-${nextId}`;
}

function loadStoredMessages(): ChatMessage[] | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function useChatBot() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: me } = useMe();
  const [messages, setMessages] = useState<ChatMessage[]>(
    () =>
      loadStoredMessages() ?? [
        { id: createId(), from: "bot", text: t("chatbot.menu.root.intro") },
      ]
  );
  const [stack, setStack] = useState<ChatMenuOption[]>([chatMenuRoot]);

  useEffect(() => {
    const bounded = messages.slice(-HISTORY_LIMIT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bounded));
  }, [messages]);

  const permissions = me?.permissions ?? [];
  const currentCategory = stack[stack.length - 1];
  const currentOptions = useMemo(() => {
    if (currentCategory.kind !== "category") return [];
    return currentCategory.children.filter(
      (child) => !("permissions" in child) || !child.permissions || canAccess(permissions, child.permissions)
    );
  }, [currentCategory, permissions]);

  const goBack = useCallback(() => {
    setStack([chatMenuRoot]);
  }, []);

  const selectOption = useCallback(
    async (option: ChatMenuOption) => {
      setMessages((prev) => [...prev, { id: createId(), from: "user", text: t(option.labelKey) }]);

      if (option.kind === "category") {
        setStack((prev) => [...prev, option]);
        setMessages((prev) => [...prev, { id: createId(), from: "bot", text: t(option.introKey) }]);
        return;
      }

      const result = option.respond({ navigate, t, queryClient });

      if (typeof result === "string") {
        setMessages((prev) => [...prev, { id: createId(), from: "bot", text: result }]);
        return;
      }

      const pendingId = createId();
      setMessages((prev) => [
        ...prev,
        { id: pendingId, from: "bot", text: t("chatbot.responses.loading"), pending: true },
      ]);

      try {
        const resolvedText = await result;
        setMessages((prev) =>
          prev.map((message) =>
            message.id === pendingId ? { ...message, text: resolvedText, pending: false } : message
          )
        );
      } catch {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === pendingId
              ? { ...message, text: t("chatbot.responses.queryError"), pending: false }
              : message
          )
        );
      }
    },
    [navigate, queryClient, t]
  );

  return {
    messages,
    currentOptions,
    canGoBack: stack.length > 1,
    selectOption,
    goBack,
  };
}
