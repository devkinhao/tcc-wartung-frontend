import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  type Theme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import { useTranslation } from "react-i18next";

import { Tooltip } from "@/components/Tooltip";
import { useTour } from "./TourContext";
import { tourSelector } from "./target";
import { useTargetRect, useViewportSize, type TargetRect } from "./useTargetRect";
import type { TourPlacement } from "./types";

/** Folga entre o elemento destacado e o recorte do escurecimento. */
const SPOTLIGHT_PADDING = 6;
const BALLOON_WIDTH = 340;
/** Distância entre o recorte e o balão. */
const BALLOON_GAP = 12;
/** Respiro mínimo entre o balão e a borda da janela. */
const VIEWPORT_EDGE = 8;
/**
 * Largura mínima aceitável quando o balão vai para a lateral. Estreitar até aqui
 * vale mais a pena do que desistir do lado: numa tela de 1280 as sobras ao lado
 * de um modal `maxWidth="sm"` dão pouco mais de 300px, e sem isso todo passo do
 * formulário caía para baixo do campo, em cima do que o usuário precisa ler.
 */
const BALLOON_MIN_WIDTH = 260;
/** Largura livre necessária ao lado do alvo para o balão caber ali. */
const HORIZONTAL_SPACE_NEEDED = BALLOON_MIN_WIDTH + BALLOON_GAP + VIEWPORT_EDGE;
/**
 * Altura mínima para o balão ir acima ou abaixo do alvo. É modesta de propósito:
 * quando nenhuma lateral cabe, um balão apertado que rola por dentro ainda é
 * melhor do que um balão jogado no centro da tela.
 */
const MIN_VERTICAL_SPACE = 160;

const DIM_COLOR = "rgba(0, 0, 0, 0.55)";

/**
 * O overlay vive em duas camadas, e não em uma só, por causa dos z-index do MUI:
 * Dialog, menu de Select e popper do Autocomplete ficam todos em `zIndex.modal`
 * (1300).
 *
 * O escurecimento fica logo *abaixo* desse nível: ele cobre a página, o cabeçalho
 * e a sidebar, mas nunca uma lista suspensa aberta — que senão apareceria a 55%
 * de preto bem no passo em que o usuário precisa escolher a empresa. Dentro de um
 * Dialog quem escurece o resto é o backdrop do próprio Dialog.
 *
 * O contorno e o balão ficam *acima*, para o destaque e a instrução continuarem
 * visíveis mesmo com um Dialog aberto.
 */
const dimZIndex = (theme: Theme) => theme.zIndex.modal - 1;
const foregroundZIndex = (theme: Theme) => theme.zIndex.modal + 50;
/**
 * Carência antes de avisar que o alvo não está na tela. Um modal do MUI leva
 * ~225ms para abrir, e sem essa espera o aviso piscaria em laranja toda vez que
 * um passo de clique abre um formulário.
 */
const MISSING_TARGET_DELAY_MS = 600;

/** Caixa do recorte, já com folga e limitada à janela. */
type Spotlight = { top: number; left: number; right: number; bottom: number };

function toSpotlight(rect: TargetRect, viewport: { width: number; height: number }): Spotlight {
  return {
    top: Math.max(rect.top - SPOTLIGHT_PADDING, 0),
    left: Math.max(rect.left - SPOTLIGHT_PADDING, 0),
    right: Math.min(rect.left + rect.width + SPOTLIGHT_PADDING, viewport.width),
    bottom: Math.min(rect.top + rect.height + SPOTLIGHT_PADDING, viewport.height),
  };
}

/** Espaço livre em cada lado do recorte. */
type FreeSpace = Record<TourPlacement, number>;

function freeSpace(spotlight: Spotlight, viewport: { width: number; height: number }): FreeSpace {
  return {
    left: spotlight.left,
    right: viewport.width - spotlight.right,
    top: spotlight.top,
    bottom: viewport.height - spotlight.bottom,
  };
}

function fitsOn(side: TourPlacement, space: FreeSpace): boolean {
  return side === "left" || side === "right"
    ? space[side] >= HORIZONTAL_SPACE_NEEDED
    : space[side] >= MIN_VERTICAL_SPACE;
}

/**
 * Lado do balão, com preferência pelas laterais.
 *
 * Acima e abaixo do alvo é justamente onde fica o que o usuário precisa ver: o
 * resto do formulário, a lista suspensa que acabou de abrir, a tabela. Ao lado o
 * balão fica fora do caminho. Só quando nenhuma lateral cabe — telas estreitas,
 * alvos largos como um cartão de tela cheia — é que ele volta para cima ou para
 * baixo, e aí vence o lado mais folgado.
 */
function pickSide(
  placement: TourPlacement | undefined,
  spotlight: Spotlight,
  viewport: { width: number; height: number }
): TourPlacement {
  const space = freeSpace(spotlight, viewport);

  if (placement && fitsOn(placement, space)) return placement;

  // Direita antes de esquerda, e não "o lado mais folgado": o lado com mais
  // espaço bruto costuma ser o esquerdo justamente porque é onde está o conteúdo
  // — para um botão no rodapé de um modal centralizado, ir para a esquerda joga
  // o balão em cima do formulário inteiro.
  if (fitsOn("right", space)) return "right";
  if (fitsOn("left", space)) return "left";

  return space.bottom >= space.top ? "bottom" : "top";
}

/** Mantém um valor dentro de um intervalo, tolerando intervalos degenerados. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), Math.max(min, max));
}

/**
 * Coordenadas do balão para o lado escolhido.
 *
 * Nenhum ramo mede a altura do balão: ancorar por `top`, por `bottom`, ou pelo
 * centro com `translateY(-50%)` mais um `maxHeight` derivado da borda mais
 * próxima já garante que ele caiba na tela. Medir exigiria renderizar, ler o
 * layout e reposicionar a cada passo.
 */
function placeBalloon(
  side: TourPlacement,
  spotlight: Spotlight,
  viewport: { width: number; height: number }
) {
  if (side === "left" || side === "right") {
    const available =
      (side === "right" ? viewport.width - spotlight.right : spotlight.left) -
      BALLOON_GAP -
      VIEWPORT_EDGE;
    const horizontal = {
      width: clamp(available, BALLOON_MIN_WIDTH, BALLOON_WIDTH),
      ...(side === "right"
        ? { left: spotlight.right + BALLOON_GAP }
        : { right: viewport.width - spotlight.left + BALLOON_GAP }),
    };

    // Alinhado pela borda do alvo que está mais longe do fim da tela, crescendo
    // para dentro. Centralizar no alvo parece mais bonito, mas perto do rodapé
    // sobra metade da altura da tela e o balão fica espremido — foi o que cortou
    // o passo do botão "Criar inspeção" ao meio.
    const growsDown = (spotlight.top + spotlight.bottom) / 2 < viewport.height / 2;
    if (growsDown) {
      const top = Math.max(spotlight.top, VIEWPORT_EDGE);
      return { ...horizontal, top, maxHeight: viewport.height - top - VIEWPORT_EDGE };
    }

    const bottom = Math.max(viewport.height - spotlight.bottom, VIEWPORT_EDGE);
    return { ...horizontal, bottom, maxHeight: viewport.height - bottom - VIEWPORT_EDGE };
  }

  const centerX = (spotlight.left + spotlight.right) / 2;
  return {
    width: BALLOON_WIDTH,
    left: clamp(
      centerX - BALLOON_WIDTH / 2,
      VIEWPORT_EDGE,
      viewport.width - BALLOON_WIDTH - VIEWPORT_EDGE
    ),
    ...(side === "bottom"
      ? {
          top: spotlight.bottom + BALLOON_GAP,
          maxHeight: viewport.height - spotlight.bottom - BALLOON_GAP - VIEWPORT_EDGE,
        }
      : {
          bottom: viewport.height - spotlight.top + BALLOON_GAP,
          maxHeight: spotlight.top - BALLOON_GAP - VIEWPORT_EDGE,
        }),
  };
}

function DimArea({ sx }: { sx: object }) {
  return (
    <Box
      sx={{
        position: "fixed",
        bgcolor: DIM_COLOR,
        zIndex: dimZIndex,
        // Nada do overlay intercepta clique além do balão: o tutorial guia, não
        // prende. Sem isso o próprio contêiner engolia o clique no elemento
        // destacado e nenhum passo de ação avançava.
        pointerEvents: "none",
        ...sx,
      }}
    />
  );
}

export function TourOverlay() {
  const { t } = useTranslation();
  const { activeTour, step, stepIndex, next, previous, stop } = useTour();
  const viewport = useViewportSize();

  const selector = step?.target ? tourSelector(step.target) : null;
  const rect = useTargetRect(selector);
  const found = rect !== null;

  // O passo anterior é medido em paralelo para poder segurar a tela enquanto o
  // alvo do passo novo ainda não existe. Ver `holdingPrevious`.
  const previousStep = activeTour && stepIndex > 0 ? activeTour.steps[stepIndex - 1] : null;
  const previousSelector = previousStep?.target ? tourSelector(previousStep.target) : null;
  const previousRect = useTargetRect(previousSelector);

  /** Passo cujo alvo já ficou ausente tempo suficiente para desistir de esperar. */
  const [warnedSelector, setWarnedSelector] = useState<string | null>(null);

  /**
   * Traz o alvo para o centro da tela quando ele entra em cena — em uma tela
   * longa (configurações, relatórios) o elemento do passo costuma estar abaixo
   * da dobra.
   */
  useEffect(() => {
    if (!selector || !found) return;
    document.querySelector(selector)?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [selector, found]);

  /** Fim da carência de espera pelo alvo — ver MISSING_TARGET_DELAY_MS. */
  useEffect(() => {
    if (!selector || found) return;
    const timer = setTimeout(() => setWarnedSelector(selector), MISSING_TARGET_DELAY_MS);
    return () => clearTimeout(timer);
  }, [selector, found]);

  if (!activeTour || !step) return null;

  // Comparar com o seletor do passo atual zera a carência sozinha ao trocar de
  // passo, sem precisar limpar o estado em um efeito.
  const graceExpired = selector !== null && warnedSelector === selector;

  /**
   * Depois de um passo de clique o alvo seguinte quase nunca existe ainda: a
   * rota é lazy-loaded, ou o modal está abrindo. Em vez de jogar o balão para o
   * centro da tela e trazê-lo de volta um instante depois, o tutorial simplesmente
   * ainda não avança de lugar — segue mostrando o passo anterior, no alvo dele,
   * até o novo aparecer. O usuário vê um movimento só, na hora em que a tela ficou
   * pronta.
   *
   * Vale só depois de clique: em passos avançados no "Próximo" não há nada
   * chegando, e segurar a tela só pareceria travamento.
   */
  const holdingPrevious =
    previousStep?.advanceOn === "click" &&
    previousRect !== null &&
    selector !== null &&
    !found &&
    !graceExpired;

  const shownStep = holdingPrevious && previousStep ? previousStep : step;
  const shownRect = holdingPrevious ? previousRect : rect;
  const shownIndex = holdingPrevious ? stepIndex - 1 : stepIndex;

  const total = activeTour.steps.length;
  const isLastStep = shownIndex === total - 1;
  const waitingForClick = shownStep.advanceOn === "click";
  const spotlight = shownRect ? toSpotlight(shownRect, viewport) : null;
  const missingTooLong = !found && graceExpired;

  // Sem alvo visível o balão vai para o centro e a tela inteira escurece: é o
  // caso dos alvos condicionais, como os campos de equipamento, que só existem
  // depois de escolhido o tipo de serviço.
  const balloonPosition = spotlight
    ? placeBalloon(pickSide(shownStep.placement, spotlight, viewport), spotlight, viewport)
    : {
        width: BALLOON_WIDTH,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        maxHeight: `calc(100dvh - ${VIEWPORT_EDGE * 2}px)`,
      };

  // Sem contêiner em volta de propósito: um wrapper `position: fixed; inset: 0`
  // cobriria a tela inteira e engoliria o clique no elemento destacado, além de
  // achatar as duas camadas de z-index em uma só.
  return createPortal(
    <>
      {/* Escurecimento em quatro faixas em vez de uma máscara: o recorte fica
          literalmente vazio, então o elemento destacado continua clicável — é
          assim que os passos de ação avançam, com o usuário clicando no botão
          real, e não em um botão do tutorial. */}
      {spotlight ? (
        <>
          <DimArea sx={{ top: 0, left: 0, right: 0, height: spotlight.top }} />
          <DimArea sx={{ top: spotlight.bottom, left: 0, right: 0, bottom: 0 }} />
          <DimArea
            sx={{
              top: spotlight.top,
              left: 0,
              width: spotlight.left,
              height: spotlight.bottom - spotlight.top,
            }}
          />
          <DimArea
            sx={{
              top: spotlight.top,
              left: spotlight.right,
              right: 0,
              height: spotlight.bottom - spotlight.top,
            }}
          />
          <Box
            sx={{
              position: "fixed",
              top: spotlight.top,
              left: spotlight.left,
              width: spotlight.right - spotlight.left,
              height: spotlight.bottom - spotlight.top,
              border: 2,
              borderColor: "primary.main",
              borderRadius: 1,
              zIndex: foregroundZIndex,
              pointerEvents: "none",
            }}
          />
        </>
      ) : (
        <DimArea sx={{ inset: 0 }} />
      )}

      <Paper
        elevation={8}
        // Impede que o clique tire o foco do Dialog aberto por baixo: o FocusTrap
        // do MUI devolveria o foco na hora e o botão do balão piscaria. O clique
        // em si continua acontecendo normalmente.
        onMouseDown={(event) => event.preventDefault()}
        sx={{
          position: "fixed",
          maxWidth: `calc(100vw - ${VIEWPORT_EDGE * 2}px)`,
          overflowY: "auto",
          p: 2,
          zIndex: foregroundZIndex,
          // Única parte do overlay que recebe clique.
          pointerEvents: "auto",
          ...balloonPosition,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {t(activeTour.titleKey)}
          </Typography>
          <Tooltip title={t("tour.actions.exit")}>
            <IconButton size="small" onClick={stop} aria-label={t("tour.actions.exit")}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={((shownIndex + 1) / total) * 100}
          sx={{ my: 1, borderRadius: 1 }}
        />

        <Typography variant="body2" color="text.secondary">
          {t("tour.progress", { current: shownIndex + 1, total })}
        </Typography>

        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          {t(shownStep.titleKey)}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {t(shownStep.bodyKey)}
        </Typography>

        {missingTooLong ? (
          <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
            {t("tour.targetMissing")}
          </Typography>
        ) : null}

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1}
          sx={{ mt: 2 }}
        >
          <Button
            size="small"
            startIcon={<ArrowBackIcon fontSize="small" />}
            onClick={previous}
            disabled={shownIndex === 0}
            sx={{ textTransform: "none" }}
          >
            {t("tour.actions.back")}
          </Button>

          {waitingForClick ? (
            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "primary.main" }}>
              <TouchAppIcon fontSize="small" />
              <Typography variant="body2">{t("tour.clickHint")}</Typography>
            </Stack>
          ) : (
            <Button variant="contained" size="small" onClick={next} sx={{ textTransform: "none" }}>
              {isLastStep ? t("tour.actions.finish") : t("tour.actions.next")}
            </Button>
          )}
        </Stack>
      </Paper>
    </>,
    document.body
  );
}
