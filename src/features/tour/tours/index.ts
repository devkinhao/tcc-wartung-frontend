import { canAccess } from "@/features/auth/permissions";
import type { TourDefinition } from "../types";
import { alertWindowTour } from "./alertWindow";
import { newCompanyTour } from "./newCompany";
import { newInspectionTour } from "./newInspection";
import { reportsTour } from "./reports";

/** Ordem em que os tutoriais aparecem no assistente: do mais usado ao mais raro. */
const tours: TourDefinition[] = [
  newInspectionTour,
  newCompanyTour,
  reportsTour,
  alertWindowTour,
];

export function getTour(id: string): TourDefinition | null {
  return tours.find((tour) => tour.id === id) ?? null;
}

/** Só os tutoriais cujas telas o usuário consegue abrir. */
export function availableTours(permissions: string[]): TourDefinition[] {
  return tours.filter((tour) => canAccess(permissions, tour.permissions));
}
