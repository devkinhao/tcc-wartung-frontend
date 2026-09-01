import { forwardRef, useEffect, useRef, useState } from "react";
import { SnackbarContent, useSnackbar, type CustomContentProps } from "notistack";
import { Box, Paper, Typography } from "@mui/material";
import { keyframes } from "@mui/system";

// Quanto tempo cada toast fica visível. Erros ficam mais tempo — costumam ter
// mais texto e o usuário pode precisar reler.
const DEFAULT_DURATION_MS = 5000;
const ERROR_DURATION_MS = 8000;

const shrink = keyframes`
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
`;

/**
 * Conteúdo customizado dos toasts (notistack `Components`).
 *
 * Diferenças em relação ao padrão do notistack:
 *  - corpo verde preenchido para todas as variantes (sem ícone, sem cor por
 *    variante) — a mensagem já diz se deu certo ou não
 *  - barra de progresso na base que encolhe até o toast sumir
 *  - o próprio componente controla o tempo de vida (o notistack fica com
 *    `autoHideDuration={null}`), então a barra e o fechamento ficam sempre em
 *    sincronia — inclusive na pausa: passar o mouse por cima congela os dois.
 *
 * O empilhamento de vários toasts é do próprio notistack (`maxSnack`): o novo
 * entra embaixo e empurra os anteriores para cima; quando um some, a pilha
 * se ajusta.
 */
export const Toast = forwardRef<HTMLDivElement, CustomContentProps>(function Toast(
  { id, message, variant, style },
  ref,
) {
  const { closeSnackbar } = useSnackbar();
  const [paused, setPaused] = useState(false);

  const duration = variant === "error" ? ERROR_DURATION_MS : DEFAULT_DURATION_MS;

  // Tempo restante até fechar. O efeito reinicia quando `paused` muda: ao
  // pausar, o cleanup desconta o tempo já decorrido; ao retomar, agenda o
  // fechamento com o que sobrou.
  const remainingMs = useRef(duration);
  const startedAt = useRef(0);

  useEffect(() => {
    if (paused) return;

    startedAt.current = Date.now();
    const timer = window.setTimeout(() => closeSnackbar(id), remainingMs.current);

    return () => {
      window.clearTimeout(timer);
      remainingMs.current = Math.max(0, remainingMs.current - (Date.now() - startedAt.current));
    };
  }, [paused, id, duration, closeSnackbar]);

  return (
    // SnackbarContent recebe o ref e o `style` (opacidade) da transição Fade
    <SnackbarContent ref={ref} role="alert" style={style}>
      <Paper
        elevation={8}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        sx={{
          position: "relative",
          overflow: "hidden",
          width: "100%",
          minWidth: { xs: 280, sm: 340 },
          maxWidth: 460,
          minHeight: 64,
          borderRadius: 1,
          px: 2.5,
          py: 2,
          display: "flex",
          alignItems: "center",
          bgcolor: "success.main",
          color: "success.contrastText",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.45, color: "inherit" }}>
          {message}
        </Typography>

        <Box
          aria-hidden
          sx={{
            position: "absolute",
            left: 0,
            bottom: 0,
            height: 3,
            width: "100%",
            bgcolor: "common.white",
            opacity: 0.5,
            transformOrigin: "left",
            animation: `${shrink} ${duration}ms linear forwards`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      </Paper>
    </SnackbarContent>
  );
});
