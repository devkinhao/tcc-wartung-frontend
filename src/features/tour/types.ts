/**
 * Lado preferido do balão em relação ao elemento destacado. Quando omitido — o
 * normal — o overlay escolhe sozinho, dando preferência às laterais para não
 * cobrir o conteúdo acima e abaixo do alvo. Só vale a pena informar quando o
 * automático erra em algum caso concreto.
 */
export type TourPlacement = "top" | "bottom" | "left" | "right";

export type TourStep = {
  /**
   * Valor do atributo `data-tour` do elemento a destacar. Se o elemento não
   * existir na tela — porque ainda está montando, porque depende de uma escolha
   * anterior do usuário ou porque o passo é só explicativo — o balão aparece
   * centralizado, sem recorte. Os textos dos passos assumem esse cenário.
   */
  target?: string;
  titleKey: string;
  bodyKey: string;
  /** Rota aberta antes de o passo ser exibido. */
  navigateTo?: string;
  /**
   * `click` esconde o botão "Próximo": o passo só avança quando o usuário
   * clicar no próprio elemento destacado. É o que transforma o tutorial em
   * condução — quem faz a ação é o usuário, na tela real.
   */
  advanceOn?: "next" | "click";
  placement?: TourPlacement;
};

export type TourDefinition = {
  id: string;
  titleKey: string;
  /** Uma linha, exibida na lista do assistente. */
  summaryKey: string;
  /** Mesma lista usada pelo guard de rota: um tutorial de tela inacessível não aparece. */
  permissions?: readonly string[];
  steps: TourStep[];
};
