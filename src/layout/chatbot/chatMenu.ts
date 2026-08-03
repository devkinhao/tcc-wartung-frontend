import type { NavigateFunction } from "react-router-dom";
import type { TFunction } from "i18next";
import type { QueryClient } from "@tanstack/react-query";
import { paths } from "@/routes/paths";
import { dataActions } from "./chatDataIntents";
import { faqActions } from "./chatFaqIntents";

export type ChatActionContext = {
  navigate: NavigateFunction;
  t: TFunction;
  queryClient: QueryClient;
};

export type ChatMenuOption =
  | {
      id: string;
      kind: "category";
      labelKey: string;
      introKey: string;
      children: ChatMenuOption[];
    }
  | {
      id: string;
      kind: "action";
      labelKey: string;
      permissions?: string[];
      respond: (ctx: ChatActionContext) => string | Promise<string>;
    };

function navMenuAction(
  id: string,
  labelKey: string,
  path: string,
  pageLabelKey: string,
  permissions?: string[]
): ChatMenuOption {
  return {
    id,
    kind: "action",
    labelKey,
    permissions,
    respond: ({ navigate, t }) => {
      navigate(path);
      return t("chatbot.responses.navigated", { page: t(pageLabelKey) });
    },
  };
}

const navigateCategory: ChatMenuOption = {
  id: "navigate",
  kind: "category",
  labelKey: "chatbot.menu.categories.navigate.label",
  introKey: "chatbot.menu.categories.navigate.intro",
  children: [
    navMenuAction("nav-dashboard", "chatbot.menu.actions.dashboard", paths.dashboard, "nav.home"),
    navMenuAction(
      "nav-customers",
      "chatbot.menu.actions.customers",
      paths.customers,
      "nav.customersList"
    ),
    navMenuAction(
      "nav-inspections",
      "chatbot.menu.actions.inspections",
      paths.inspections,
      "nav.inspectionsList"
    ),
    navMenuAction(
      "nav-notifications",
      "chatbot.menu.actions.notifications",
      paths.notifications,
      "nav.notificationsList"
    ),
    navMenuAction(
      "nav-reports",
      "chatbot.menu.actions.reports",
      paths.reports,
      "nav.reports",
      ["ROLE_ACCESS_REPORTS"]
    ),
    navMenuAction(
      "nav-company",
      "chatbot.menu.actions.company",
      paths.company,
      "nav.myCompany",
      ["ROLE_ADMIN"]
    ),
    navMenuAction("nav-users", "chatbot.menu.actions.users", paths.users, "nav.users", [
      "ROLE_ADMIN",
    ]),
    navMenuAction(
      "nav-configurations",
      "chatbot.menu.actions.configurations",
      paths.configurations,
      "nav.configurations",
      ["ROLE_ADMIN"]
    ),
    navMenuAction(
      "nav-profile",
      "chatbot.menu.actions.profile",
      paths.userProfile,
      "nav.myProfile"
    ),
    navMenuAction(
      "nav-preferences",
      "chatbot.menu.actions.preferences",
      paths.userPreferences,
      "nav.preferences"
    ),
  ],
};

const dataCategory: ChatMenuOption = {
  id: "data",
  kind: "category",
  labelKey: "chatbot.menu.categories.data.label",
  introKey: "chatbot.menu.categories.data.intro",
  children: dataActions,
};

const faqCategory: ChatMenuOption = {
  id: "faq",
  kind: "category",
  labelKey: "chatbot.menu.categories.faq.label",
  introKey: "chatbot.menu.categories.faq.intro",
  children: faqActions,
};

export const chatMenuRoot: ChatMenuOption = {
  id: "root",
  kind: "category",
  labelKey: "chatbot.title",
  introKey: "chatbot.menu.root.intro",
  children: [navigateCategory, dataCategory, faqCategory],
};
