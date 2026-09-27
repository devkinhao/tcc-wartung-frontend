import { paths } from "@/routes/paths";
import { sidebarTarget } from "../target";
import type { TourDefinition } from "../types";

/**
 * O cadastro de inspeção é o formulário menos adivinhável do sistema: a busca de
 * empresa consulta o servidor, os campos de equipamento aparecem conforme o tipo
 * de serviço e o vencimento tem atalhos que dependem da data da inspeção. É por
 * isso que este é o tutorial principal.
 */
export const newInspectionTour: TourDefinition = {
  id: "new-inspection",
  titleKey: "tour.newInspection.title",
  summaryKey: "tour.newInspection.summary",
  steps: [
    {
      target: sidebarTarget(paths.inspections),
      advanceOn: "click",
      titleKey: "tour.newInspection.steps.menu.title",
      bodyKey: "tour.newInspection.steps.menu.body",
    },
    {
      target: "inspections.add",
      advanceOn: "click",
      titleKey: "tour.newInspection.steps.openForm.title",
      bodyKey: "tour.newInspection.steps.openForm.body",
    },
    {
      target: "inspection.customer",
      titleKey: "tour.newInspection.steps.customer.title",
      bodyKey: "tour.newInspection.steps.customer.body",
    },
    {
      target: "inspection.serviceType",
      titleKey: "tour.newInspection.steps.serviceType.title",
      bodyKey: "tour.newInspection.steps.serviceType.body",
    },
    {
      target: "inspection.inspectionDate",
      titleKey: "tour.newInspection.steps.inspectionDate.title",
      bodyKey: "tour.newInspection.steps.inspectionDate.body",
    },
    {
      target: "inspection.expirationDate",
      titleKey: "tour.newInspection.steps.expirationDate.title",
      bodyKey: "tour.newInspection.steps.expirationDate.body",
    },
    {
      target: "inspection.artNumber",
      titleKey: "tour.newInspection.steps.artNumber.title",
      bodyKey: "tour.newInspection.steps.artNumber.body",
    },
    {
      target: "inspection.equipment",
      titleKey: "tour.newInspection.steps.equipment.title",
      bodyKey: "tour.newInspection.steps.equipment.body",
    },
    {
      target: "inspection.documents",
      titleKey: "tour.newInspection.steps.documents.title",
      bodyKey: "tour.newInspection.steps.documents.body",
    },
    {
      target: "inspection.submit",
      titleKey: "tour.newInspection.steps.submit.title",
      bodyKey: "tour.newInspection.steps.submit.body",
    },
  ],
};
