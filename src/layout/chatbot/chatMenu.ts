import { availableTours } from "@/features/tour/tours";

/**
 * Menu do assistente, em dois níveis: a raiz oferece assuntos, cada assunto
 * oferece o que se pode pedir dentro dele.
 *
 * Hoje só existe o assunto "Ajuda e tutoriais". A hierarquia está aqui desde já
 * porque a lista cresce por assunto, não por opção solta: uma lista plana com
 * três assuntos viraria quinze botões num painel de 360px. Para acrescentar um
 * assunto novo, basta outra `section` em `buildChatMenu` — o painel e a conversa
 * não mudam.
 */
export type ChatOption =
  | ChatSection
  | { kind: "tour"; id: string; labelKey: string; tourId: string }
  | { kind: "answer"; id: string; labelKey: string; answerKey: string; withSupportEmail?: boolean };

export type ChatSection = {
  kind: "section";
  id: string;
  labelKey: string;
  /** O que o bot diz ao abrir o assunto. */
  introKey: string;
  options: ChatOption[];
};

/**
 * Monta o menu para as permissões do usuário. Os tutoriais vêm da própria
 * definição dos tours, então um tutorial de tela que ele não acessa não aparece
 * aqui — a regra de permissão fica em um lugar só (ver `availableTours`).
 */
export function buildChatMenu(permissions: string[]): ChatSection {
  return {
    kind: "section",
    id: "root",
    labelKey: "chatbot.title",
    introKey: "chatbot.prompt",
    options: [
      {
        kind: "section",
        id: "help",
        labelKey: "chatbot.sections.help.label",
        introKey: "chatbot.sections.help.intro",
        options: availableTours(permissions).map((tour) => ({
          kind: "tour" as const,
          id: `tour:${tour.id}`,
          labelKey: tour.titleKey,
          tourId: tour.id,
        })),
      },
      {
        kind: "answer",
        id: "support",
        labelKey: "chatbot.options.support",
        answerKey: "chatbot.answers.support",
        withSupportEmail: true,
      },
    ],
  };
}

/** Desce o caminho de seções abertas; um caminho inválido volta para a raiz. */
export function resolveSection(root: ChatSection, path: string[]): ChatSection {
  let current = root;

  for (const id of path) {
    const next = current.options.find((option) => option.id === id);
    if (next?.kind !== "section") return root;
    current = next;
  }

  return current;
}
