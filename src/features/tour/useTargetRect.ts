import { useLayoutEffect, useState } from "react";

export type TargetRect = { top: number; left: number; width: number; height: number };

function readRect(selector: string): TargetRect | null {
  const element = document.querySelector(selector);
  if (!element) return null;

  const rect = element.getBoundingClientRect();
  // Elemento presente mas invisível conta como ausente: o modal de nova empresa
  // mantém os campos do passo 2 montados com `display: none` (ver AddCompanyModal),
  // e eles medem zero enquanto o passo 1 está aberto.
  if (rect.width <= 0 || rect.height <= 0) return null;

  return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

function sameRect(a: TargetRect | null, b: TargetRect | null): boolean {
  if (a === null || b === null) return a === b;
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

/**
 * Acompanha a posição do elemento destacado enquanto o tutorial está ativo.
 *
 * Usa requestAnimationFrame em vez de ResizeObserver e listeners de scroll de
 * propósito: o alvo pode estar dentro de um modal em plena animação de abertura,
 * pode mudar de tamanho junto com a sidebar recolhendo, ou simplesmente ainda
 * não existir no momento em que o observador seria registrado. Um laço por
 * quadro cobre os três casos com uma regra só, e só vive enquanto há tutorial
 * na tela. O estado só muda quando o retângulo muda, então não há re-render por
 * quadro.
 */
export function useTargetRect(selector: string | null): TargetRect | null {
  const [rect, setRect] = useState<TargetRect | null>(null);

  // Layout effect, não effect: medir depois da pintura faria cada troca de passo
  // exibir um quadro com o balão centralizado antes de ele saltar para o alvo.
  useLayoutEffect(() => {
    if (!selector) {
      setRect(null);
      return;
    }

    let current = readRect(selector);
    setRect(current);

    let frame = requestAnimationFrame(function tick() {
      const next = readRect(selector);
      if (!sameRect(current, next)) {
        current = next;
        setRect(next);
      }
      frame = requestAnimationFrame(tick);
    });

    return () => cancelAnimationFrame(frame);
  }, [selector]);

  return rect;
}

/** Dimensões da janela, para manter o balão dentro da tela. */
export function useViewportSize() {
  const [size, setSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }));

  useLayoutEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return size;
}
