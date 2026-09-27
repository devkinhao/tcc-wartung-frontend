import { useCallback, useMemo, useState } from "react";

import { useTour } from "@/features/tour/TourContext";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { useMe } from "@/hooks/useMe";
import { buildChatMenu, resolveSection, type ChatOption } from "./chatMenu";
import { CHAT_CONVERSATION_KEY } from "./storage";

export type ChatMessage = {
  id: string;
  from: "user" | "bot";
  /**
   * Chave de i18n, não o texto já traduzido: guardar a chave faz o histórico
   * acompanhar a troca de idioma em vez de congelar no idioma em que a conversa
   * aconteceu.
   */
  textKey: string;
  /** Acrescenta o endereço de contato ao balão. */
  withSupportEmail?: boolean;
};

/** Conversas antigas não têm valor; o limite evita crescer o localStorage sem fim. */
const HISTORY_LIMIT = 40;

let sequence = 0;

/**
 * O prefixo por carga de página evita colidir com ids restaurados do
 * localStorage, que vieram de um contador zerado da sessão anterior.
 */
function createId(): string {
  sequence += 1;
  return `${Date.now().toString(36)}-${sequence}`;
}

function message(from: "user" | "bot", textKey: string, withSupportEmail = false): ChatMessage {
  return { id: createId(), from, textKey, withSupportEmail };
}

/** Abertura da conversa, usada só quando não há histórico salvo. */
const OPENING: ChatMessage[] = [
  message("bot", "chatbot.greeting"),
  message("bot", "chatbot.prompt"),
];

/**
 * Estado da conversa do assistente.
 *
 * O assistente é um chatbot de menu: o usuário "responde" escolhendo uma opção,
 * e cada escolha vira um balão dele no histórico. O que o bot entrega não é
 * texto — escolher um tutorial dispara a condução passo a passo na própria tela
 * (ver src/features/tour).
 */
export function useChatConversation() {
  const { data: me } = useMe();
  const { activeTour, start, isCompleted } = useTour();

  const [messages, setMessages] = useLocalStorageState<ChatMessage[]>(
    CHAT_CONVERSATION_KEY,
    OPENING
  );

  /**
   * Assunto aberto. Não é persistido de propósito: reabrir o assistente começa
   * pela pergunta inicial, que é o que faz sentido em uma conversa nova.
   */
  const [path, setPath] = useState<string[]>([]);

  const menu = useMemo(() => buildChatMenu(me?.permissions ?? []), [me?.permissions]);
  const section = resolveSection(menu, path);

  const append = useCallback(
    (...added: ChatMessage[]) => {
      setMessages((previous) => [...previous, ...added].slice(-HISTORY_LIMIT));
    },
    [setMessages]
  );

  /**
   * Fecha o assunto quando um tutorial termina. O ajuste é feito durante a
   * renderização, e não em um efeito, porque é o padrão do React para reagir à
   * mudança de um valor externo: o re-render acontece antes da pintura, sem o
   * quadro intermediário que um efeito produziria.
   */
  const runningTourId = activeTour?.id ?? null;
  const [lastSeenTourId, setLastSeenTourId] = useState<string | null>(runningTourId);

  if (lastSeenTourId !== runningTourId) {
    setLastSeenTourId(runningTourId);
    if (lastSeenTourId && !runningTourId) {
      const finished = isCompleted(lastSeenTourId);
      setMessages((previous) =>
        [
          ...previous,
          message("bot", finished ? "chatbot.answers.tourFinished" : "chatbot.answers.tourStopped"),
        ].slice(-HISTORY_LIMIT)
      );
    }
  }

  const select = useCallback(
    (option: ChatOption) => {
      const reply = message("user", option.labelKey);

      switch (option.kind) {
        case "section":
          setPath((previous) => [...previous, option.id]);
          append(reply, message("bot", option.introKey));
          return;
        case "tour":
          append(reply, message("bot", "chatbot.answers.startingTour"));
          start(option.tourId);
          return;
        case "answer":
          append(reply, message("bot", option.answerKey, option.withSupportEmail));
          return;
      }
    },
    [append, start]
  );

  /** Volta um assunto e reabre a pergunta do nível anterior, para a conversa não perder o fio. */
  const goBack = useCallback(() => {
    const parentPath = path.slice(0, -1);
    setPath(parentPath);
    append(message("bot", resolveSection(menu, parentPath).introKey));
  }, [append, menu, path]);

  return {
    messages,
    options: section.options,
    canGoBack: path.length > 0,
    isCompleted,
    select,
    goBack,
  };
}
