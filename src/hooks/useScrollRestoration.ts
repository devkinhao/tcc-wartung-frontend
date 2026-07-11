import { useEffect, useRef } from "react";

// Salva a posição de scroll atual. Deve ser chamado explicitamente no momento
// da navegação (ex: clique na linha da tabela) — um listener de "scroll" contínuo
// é impreciso aqui, pois a troca de rota pode encolher a página e forçar o
// navegador a ajustar o scroll antes do componente desmontar, sobrescrevendo o
// valor real com a posição já "clampada" da tela seguinte.
export function saveScrollPosition(key: string) {
  sessionStorage.setItem(key, String(window.scrollY));
}

// Restaura a posição salva assim que os dados terminarem de carregar (a página
// só tem altura suficiente para rolar depois que as linhas renderizam).
export function useScrollRestoration(key: string, ready: boolean) {
  const restored = useRef(false);

  useEffect(() => {
    if (!ready || restored.current) return;
    restored.current = true;

    const saved = sessionStorage.getItem(key);
    if (!saved) return;

    const y = Number(saved);
    if (!Number.isNaN(y)) {
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
  }, [key, ready]);
}
