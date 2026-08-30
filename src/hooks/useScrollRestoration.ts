import { useEffect, useLayoutEffect, useRef } from "react";

// Salva a posição de scroll atual. Mantido para chamadas explícitas pontuais
// (ex: antes de um navigate programático); o useScrollRestoration já persiste
// sozinho ao sair da tela.
export function saveScrollPosition(key: string) {
  sessionStorage.setItem(key, String(window.scrollY));
}

/**
 * Preserva a posição de scroll de uma listagem entre navegações — inclusive
 * quando o usuário só troca de tela pelo menu lateral, sem interagir com a lista.
 *
 * A posição é rastreada continuamente num ref e persistida na limpeza de um
 * useLayoutEffect: essa limpeza roda ANTES de o DOM da rota atual ser removido,
 * quando window.scrollY ainda reflete a posição real (e não a já "clampada" da
 * próxima tela, que costuma ser mais curta).
 */
export function useScrollRestoration(key: string, ready: boolean) {
  const latestY = useRef(0);
  const restored = useRef(false);

  useLayoutEffect(() => {
    latestY.current = window.scrollY;
    const onScroll = () => {
      latestY.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      sessionStorage.setItem(key, String(latestY.current));
    };
  }, [key]);

  // Restaura assim que os dados terminam de carregar (a página só ganha altura
  // para rolar depois que as linhas renderizam).
  useEffect(() => {
    if (!ready || restored.current) return;
    restored.current = true;

    const saved = sessionStorage.getItem(key);
    if (saved == null) return;

    const y = Number(saved);
    if (!Number.isNaN(y)) {
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }, [key, ready]);
}
