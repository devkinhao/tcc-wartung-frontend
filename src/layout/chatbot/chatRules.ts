import type { NavigateFunction } from "react-router-dom";
import type { TFunction } from "i18next";
import { paths } from "@/routes/paths";

export type ChatIntentContext = {
  navigate: NavigateFunction;
  t: TFunction;
};

export type ChatIntent = {
  id: string;
  patterns: RegExp[];
  permissions?: string[];
  respond: (ctx: ChatIntentContext) => string;
};

function navIntent(
  id: string,
  patterns: RegExp[],
  path: string,
  labelKey: string,
  permissions?: string[]
): ChatIntent {
  return {
    id,
    patterns,
    permissions,
    respond: ({ navigate, t }) => {
      navigate(path);
      return t("chatbot.responses.navigated", { page: t(labelKey) });
    },
  };
}

export const chatIntents: ChatIntent[] = [
  {
    id: "greeting",
    patterns: [/\b(oi|ola|bom dia|boa tarde|boa noite|hey|hello)\b/],
    respond: ({ t }) => t("chatbot.responses.greeting"),
  },
  navIntent(
    "nav-help-page",
    [/pagina de ajuda|central de ajuda|tela de ajuda/],
    paths.help,
    "nav.help"
  ),
  navIntent(
    "nav-dashboard",
    [/\b(inicio|dashboard|home|pagina inicial)\b/],
    paths.dashboard,
    "nav.home"
  ),
  navIntent("nav-customers", [/\bclientes?\b/], paths.customers, "nav.customersList"),
  navIntent(
    "nav-inspections",
    [/\binspecoes?\b/],
    paths.inspections,
    "nav.inspectionsList"
  ),
  navIntent(
    "nav-notifications",
    [/\bnotificacoes?\b/],
    paths.notifications,
    "nav.notificationsList"
  ),
  navIntent(
    "nav-reports",
    [/\brelatorios?\b/],
    paths.reports,
    "nav.reports",
    ["ROLE_ACCESS_REPORTS"]
  ),
  navIntent(
    "nav-company",
    [/\b(minha )?empresa\b/],
    paths.company,
    "nav.myCompany",
    ["ROLE_ADMIN"]
  ),
  navIntent("nav-users", [/\busuarios?\b/], paths.users, "nav.users", ["ROLE_ADMIN"]),
  navIntent(
    "nav-configurations",
    [/\bconfiguracoes?\b|\bconfig\b/],
    paths.configurations,
    "nav.configurations",
    ["ROLE_ADMIN"]
  ),
  navIntent(
    "nav-profile",
    [/\b(meu )?perfil\b|\bmeus dados\b/],
    paths.userProfile,
    "nav.myProfile"
  ),
  navIntent(
    "nav-preferences",
    [/\bpreferencias\b/],
    paths.userPreferences,
    "nav.preferences"
  ),
  {
    id: "help",
    patterns: [/\bajuda\b|\bcomandos\b|o que voce (faz|pode fazer)/],
    respond: ({ t }) => t("chatbot.responses.help"),
  },
];
