import { paths } from "@/routes/paths";
import { ROUTE_PERMISSIONS } from "@/routes/routePermissions";
import type { TourDefinition } from "../types";

/**
 * EXPIRATION_ALERT_DAYS é a configuração mais invisível do sistema: um número
 * numa tela que quase ninguém abre e que redefine o que a home, a lista de
 * inspeções e os avisos por e-mail chamam de "próximo do vencimento". O tutorial
 * termina na home justamente para mostrar o efeito.
 *
 * Configurações não está na sidebar (fica no menu do usuário), então aqui os
 * passos navegam sozinhos em vez de pedir um clique no menu.
 */
export const alertWindowTour: TourDefinition = {
  id: "alert-window",
  titleKey: "tour.alertWindow.title",
  summaryKey: "tour.alertWindow.summary",
  permissions: ROUTE_PERMISSIONS.admin,
  steps: [
    {
      navigateTo: paths.configurations,
      target: "config:EXPIRATION_ALERT_DAYS",
      titleKey: "tour.alertWindow.steps.field.title",
      bodyKey: "tour.alertWindow.steps.field.body",
    },
    {
      // Repete a rota para o botão "Voltar" do último passo, que roda na home,
      // trazer o usuário de volta às configurações.
      navigateTo: paths.configurations,
      target: "config.save",
      titleKey: "tour.alertWindow.steps.save.title",
      bodyKey: "tour.alertWindow.steps.save.body",
    },
    {
      navigateTo: paths.home,
      target: "home.nearCard",
      titleKey: "tour.alertWindow.steps.effect.title",
      bodyKey: "tour.alertWindow.steps.effect.body",
    },
  ],
};
