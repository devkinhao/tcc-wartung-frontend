import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { TOUR_COMPLETED_KEY } from "@/layout/chatbot/storage";
import { TourContext, type TourContextValue } from "./TourContext";
import { TourOverlay } from "./TourOverlay";
import { tourSelector } from "./target";
import { getTour } from "./tours";

/**
 * Estado dos tutoriais guiados e o overlay que os desenha. Fica no Layout, acima
 * das rotas, porque um tutorial atravessa telas — o passo do menu e o passo do
 * formulário pertencem ao mesmo fluxo.
 */
export function TourProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [completed, setCompleted] = useLocalStorageState<string[]>(TOUR_COMPLETED_KEY, []);

  const activeTour = activeId ? getTour(activeId) : null;
  const step = activeTour?.steps[stepIndex] ?? null;

  const stop = useCallback(() => {
    setActiveId(null);
    setStepIndex(0);
  }, []);

  const start = useCallback((tourId: string) => {
    setActiveId(getTour(tourId) ? tourId : null);
    setStepIndex(0);
  }, []);

  const next = useCallback(() => {
    if (!activeTour) return;
    if (stepIndex < activeTour.steps.length - 1) {
      setStepIndex((index) => index + 1);
      return;
    }
    // Último passo: marca como concluído para o assistente poder sinalizar.
    setCompleted((previous) =>
      previous.includes(activeTour.id) ? previous : [...previous, activeTour.id]
    );
    stop();
  }, [activeTour, setCompleted, stepIndex, stop]);

  const previous = useCallback(() => {
    setStepIndex((index) => Math.max(index - 1, 0));
  }, []);

  const isCompleted = useCallback(
    (tourId: string) => completed.includes(tourId),
    [completed]
  );

  /**
   * Passos que moram em outra tela levam o usuário até lá antes de aparecer. A
   * comparação com a rota atual evita empilhar entradas repetidas no histórico
   * quando o passo anterior já estava na mesma tela — inclusive ao voltar.
   */
  useEffect(() => {
    if (step?.navigateTo && step.navigateTo !== pathname) navigate(step.navigateTo);
  }, [step, navigate, pathname]);

  /**
   * Passos de ação avançam com o clique do usuário no próprio elemento
   * destacado. O listener é de captura porque vários alvos navegam ou se
   * desmontam no mesmo clique (item da sidebar, botão que abre o modal), e nesse
   * caso o evento não chega a subir até o document.
   */
  useEffect(() => {
    if (step?.advanceOn !== "click" || !step.target) return;

    const selector = tourSelector(step.target);
    const onClick = (event: MouseEvent) => {
      const origin = event.target;
      if (origin instanceof Element && origin.closest(selector)) next();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [step, next]);

  /** Esc sai do tutorial sem fechar junto o modal que estiver por baixo. */
  useEffect(() => {
    if (!activeTour) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      stop();
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [activeTour, stop]);

  const value = useMemo<TourContextValue>(
    () => ({ activeTour, step, stepIndex, start, stop, next, previous, isCompleted }),
    [activeTour, step, stepIndex, start, stop, next, previous, isCompleted]
  );

  return (
    <TourContext.Provider value={value}>
      {children}
      <TourOverlay />
    </TourContext.Provider>
  );
}
