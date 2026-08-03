import type { ChatMenuOption } from "./chatMenu";

export const faqActions: ChatMenuOption[] = [
  {
    id: "faq-add-customer",
    kind: "action",
    labelKey: "chatbot.menu.actions.faqAddCustomer",
    respond: ({ t }) => t("help.faq.q1.answer"),
  },
  {
    id: "faq-preferences",
    kind: "action",
    labelKey: "chatbot.menu.actions.faqPreferences",
    respond: ({ t }) => t("help.faq.q2.answer"),
  },
  {
    id: "faq-reports",
    kind: "action",
    labelKey: "chatbot.menu.actions.faqReports",
    respond: ({ t }) => t("help.faq.q3.answer"),
  },
  {
    id: "faq-support",
    kind: "action",
    labelKey: "chatbot.menu.actions.faqSupport",
    respond: ({ t }) =>
      `${t("help.support.description")} ${t("help.support.emailLabel")} suporte@empresa.com`,
  },
];
