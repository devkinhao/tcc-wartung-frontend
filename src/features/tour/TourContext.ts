import { createContext, useContext } from "react";
import type { TourDefinition, TourStep } from "./types";

export type TourContextValue = {
  activeTour: TourDefinition | null;
  /** Passo em exibição, ou `null` quando nenhum tutorial está ativo. */
  step: TourStep | null;
  stepIndex: number;
  start: (tourId: string) => void;
  stop: () => void;
  next: () => void;
  previous: () => void;
  isCompleted: (tourId: string) => boolean;
};

export const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const value = useContext(TourContext);
  if (!value) throw new Error("useTour precisa estar dentro de <TourProvider>");
  return value;
}
