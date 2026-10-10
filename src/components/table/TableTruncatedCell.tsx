import { ELLIPSIS_SX } from "@/styles/ellipsis";
import { TableCell } from "@mui/material";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

type TableTruncatedCellProps = {
  children: ReactNode;
  align?: "left" | "center" | "right";
  /** Faz a coluna acompanhar a largura do conteúdo. */
  nowrap?: boolean;
  /** Impede que o title da linha apareça sobre a célula. */
  hideTitle?: boolean;
};

/** Indica se o conteúdo do elemento está cortado por reticências. */
export const isTruncated = (el: HTMLElement) => {
  if (el.scrollWidth > el.clientWidth) return true;
  const style = getComputedStyle(el);
  const available =
    el.getBoundingClientRect().width -
    parseFloat(style.paddingLeft) -
    parseFloat(style.paddingRight) -
    parseFloat(style.borderLeftWidth) -
    parseFloat(style.borderRightWidth);
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width > available + 0.01;
};

/** Mostra o texto completo como title somente quando ele está cortado por reticências. */
export const setTitleIfTruncated = (event: MouseEvent<HTMLElement>) => {
  const el = event.currentTarget;
  if (isTruncated(el)) {
    el.title = el.textContent ?? "";
  } else {
    el.removeAttribute("title");
  }
};

/** Célula do corpo que termina em reticências quando o conteúdo não cabe, com o texto completo no title. */
export function TableTruncatedCell({
  children,
  align,
  nowrap,
  hideTitle,
}: TableTruncatedCellProps) {
  /** Referências. */
  const ref = useRef<HTMLTableCellElement>(null);

  /** Estados. */
  const [title, setTitle] = useState<string | undefined>();

  /** Atualiza o title conforme o texto está cortado ou não. */
  const updateTitle = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setTitle(isTruncated(el) ? (el.textContent ?? undefined) : undefined);
  }, []);

  /** Reavalia a cada renderização, pois o conteúdo da célula pode ter mudado. */
  useLayoutEffect(updateTitle);

  /** Reavalia quando a largura da célula muda, como ao redimensionar a janela. */
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(updateTitle);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateTitle]);

  return (
    <TableCell
      ref={ref}
      align={align}
      /** Um title vazio na célula anula o title herdado da linha. */
      title={hideTitle ? "" : title}
      sx={{
        ...ELLIPSIS_SX,
        /** Anula o limite das células do corpo, de modo que a coluna acompanhe a largura do conteúdo. */
        ...(nowrap && { "&&": { maxWidth: "none" } }),
      }}
    >
      {children}
    </TableCell>
  );
}
