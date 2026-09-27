import { paths } from "@/routes/paths";
import { sidebarTarget } from "../target";
import type { TourDefinition } from "../types";

/**
 * O que precisa ser ensinado aqui não são os campos, é a ordem: o CNPJ é
 * consultado na Receita e mantém o resto do passo 1 bloqueado até responder, e o
 * CEP preenche o endereço sozinho no passo 2.
 */
export const newCompanyTour: TourDefinition = {
  id: "new-company",
  titleKey: "tour.newCompany.title",
  summaryKey: "tour.newCompany.summary",
  steps: [
    {
      target: sidebarTarget(paths.customers),
      advanceOn: "click",
      titleKey: "tour.newCompany.steps.menu.title",
      bodyKey: "tour.newCompany.steps.menu.body",
    },
    {
      target: "customers.add",
      advanceOn: "click",
      titleKey: "tour.newCompany.steps.openForm.title",
      bodyKey: "tour.newCompany.steps.openForm.body",
    },
    {
      target: "company.cnpj",
      titleKey: "tour.newCompany.steps.cnpj.title",
      bodyKey: "tour.newCompany.steps.cnpj.body",
    },
    {
      target: "company.legalName",
      titleKey: "tour.newCompany.steps.review.title",
      bodyKey: "tour.newCompany.steps.review.body",
    },
    {
      target: "company.next",
      advanceOn: "click",
      titleKey: "tour.newCompany.steps.next.title",
      bodyKey: "tour.newCompany.steps.next.body",
    },
    {
      target: "company.zipCode",
      titleKey: "tour.newCompany.steps.zipCode.title",
      bodyKey: "tour.newCompany.steps.zipCode.body",
    },
    {
      target: "company.finish",
      titleKey: "tour.newCompany.steps.finish.title",
      bodyKey: "tour.newCompany.steps.finish.body",
    },
  ],
};
