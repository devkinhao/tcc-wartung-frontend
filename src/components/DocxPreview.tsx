import { useEffect, useRef, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { renderAsync } from "docx-preview";

type Props = {
  blob: Blob;
  message: string;
  downloadLabel: string;
  onDownload: () => void;
};

/**
 * Renderiza um .docx como HTML direto no navegador (client-side, via
 * docx-preview) — sem depender de conversão no backend. A fidelidade visual
 * é boa para documentos de texto comuns, mas não é pixel-perfect com o Word.
 */
export function DocxPreview({ blob, message, downloadLabel, onDownload }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);

    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    renderAsync(blob, container, undefined, { className: "docx-preview", inWrapper: true, breakPages: true }).catch(() => {
      if (!cancelled) setFailed(true);
    });

    return () => {
      cancelled = true;
    };
  }, [blob]);

  if (failed) {
    return (
      <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
        <Typography variant="body2" color="text.secondary">{message}</Typography>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={onDownload}>
          {downloadLabel}
        </Button>
      </Stack>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        flex: 1,
        width: "100%",
        height: "70vh",
        overflow: "auto",
        bgcolor: "background.paper",
        p: 2,
        "& .docx-preview": { maxWidth: "100%" },
        // O Word ignora a orientação EXIF de fotos embutidas (sempre mostra
        // os pixels crus) — sem isso, o navegador reaplica uma rotação da
        // câmera que já não bate mais com a imagem, girando fotos que no
        // Word aparecem corretas.
        "& img": { imageOrientation: "none" },
      }}
    />
  );
}
