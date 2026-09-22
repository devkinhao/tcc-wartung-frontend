import { lazy, Suspense, useRef, useState, type ReactNode } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ViewListIcon from "@mui/icons-material/ViewList";
import GridViewIcon from "@mui/icons-material/GridView";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { qk } from "@/api/keys";
import { useNotify } from "@/hooks/useNotify";
import { useLocalStorageState } from "@/hooks/useLocalStorageState";
import { Breadcrumb } from "@/layout/header/Breadcrumb";
import { breadcrumbMap } from "@/layout/header/breadcrumbMap";
import { paths } from "@/routes/paths";
import { DataTableContainer } from "@/components/DataTableContainer";
import { formatDateTimeBR, formatFileSizeKB } from "@/utils/date";
import { guessMimeType, isDocx } from "@/utils/fileType";
import type { UserDocumentResponseDTO } from "../types/UserDocument";
import {
  deleteUserDocument,
  downloadUserDocument,
  listUserDocuments,
  uploadUserDocuments,
} from "../api/userDocuments.api";

type ViewMode = "list" | "grid";

// Ícone por tipo de arquivo (deduzido pela extensão, igual à pré-visualização)
// — puramente decorativo, não afeta o que pode ser aberto/baixado.
function fileIcon(name: string, fontSize: "small" | "medium" | "large" = "small") {
  if (isDocx(name)) return <DescriptionIcon fontSize={fontSize} color="primary" />;
  const mimeType = guessMimeType(name);
  if (mimeType?.startsWith("image/")) return <ImageIcon fontSize={fontSize} color="success" />;
  if (mimeType === "application/pdf") return <PictureAsPdfIcon fontSize={fontSize} color="error" />;
  return <InsertDriveFileIcon fontSize={fontSize} color="action" />;
}

// A biblioteca docx-preview tem ~200 KB e só é usada ao pré-visualizar um .docx
// — carregada sob demanda para não pesar no carregamento inicial da página.
const DocxPreview = lazy(() =>
  import("@/components/DocxPreview").then((m) => ({ default: m.DocxPreview })),
);

export default function UserDocumentsPage() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const notify = useNotify();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lista vs. grade — preferência puramente visual, lembrada entre sessões.
  const [viewMode, setViewMode] = useLocalStorageState<ViewMode>("user-documents.viewMode", "list");

  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuTarget, setMenuTarget] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState<number | null>(null);
  const [preview, setPreview] = useState<{
    docId: number;
    name: string;
    kind: "image" | "pdf" | "docx" | "unsupported";
    url?: string;
    blob?: Blob;
  } | null>(null);

  const docsQuery = useQuery({
    queryKey: qk.userDocuments(),
    queryFn: listUserDocuments,
  });
  const documents = docsQuery.data ?? [];

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadUserDocuments(files),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.userDocuments() });
      notify.success("notify.success.documentsUploaded");
    },
    onError: (err) => notify.fromError(err),
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: number) => deleteUserDocument(docId),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: qk.userDocuments() });
      notify.success("notify.success.documentDeleted");
    },
    onError: (err) => notify.fromError(err),
  });

  const handleDownload = async (docId: number, name: string) => {
    try {
      const blob = await downloadUserDocument(docId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name || `document-${docId}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      notify.error("notify.error.downloadFailed");
    }
  };

  const handlePreview = async (docId: number, name: string) => {
    setPreviewLoading(docId);
    try {
      const blob = await downloadUserDocument(docId);

      if (isDocx(name)) {
        setPreview({ docId, name, kind: "docx", blob });
        return;
      }

      const mimeType = guessMimeType(name);
      const typedBlob = mimeType ? new Blob([blob], { type: mimeType }) : blob;
      const url = window.URL.createObjectURL(typedBlob);
      const kind = mimeType?.startsWith("image/")
        ? "image"
        : mimeType === "application/pdf"
          ? "pdf"
          : "unsupported";
      setPreview({ docId, name, url, kind });
    } catch {
      notify.error("notify.error.downloadFailed");
    } finally {
      setPreviewLoading(null);
    }
  };

  const handleClosePreview = () => {
    if (preview?.url) window.URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const openMenu = (e: React.MouseEvent<HTMLElement>, docId: number) => {
    setMenuAnchor(e.currentTarget);
    setMenuTarget(docId);
  };

  const closeMenu = () => {
    setMenuAnchor(null);
    setMenuTarget(null);
  };

  // Ações por documento (ver/baixar/menu) — compartilhadas entre a linha da
  // lista e o card da grade, só muda o tamanho dos botões.
  const documentActions = (d: UserDocumentResponseDTO, size: "small" | "medium" = "small"): ReactNode => (
    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
      <Tooltip title={t("userDocuments.actions.view")}>
        <span>
          <IconButton
            size={size}
            aria-label={t("userDocuments.actions.view")}
            onClick={() => handlePreview(d.id, d.name)}
            disabled={previewLoading === d.id}
          >
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title={t("userDocuments.actions.download")}>
        <IconButton
          size={size}
          aria-label={t("userDocuments.actions.download")}
          onClick={() => handleDownload(d.id, d.name)}
        >
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={t("userDocuments.table.actions")}>
        <IconButton
          size={size}
          aria-label={t("userDocuments.table.actions")}
          onClick={(e) => openMenu(e, d.id)}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Stack>
  );

  return (
    <Box sx={{ maxWidth: 960 }}>
      <Box sx={{ mb: 2 }}>
        <Breadcrumb items={breadcrumbMap[paths.documents]} size="large" />
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          {t("userDocuments.description")}
        </Typography>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 2, p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.5}
          alignItems={{ sm: "center" }}
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle2">{t("userDocuments.title")}</Typography>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <ToggleButtonGroup
              size="small"
              exclusive
              value={viewMode}
              onChange={(_, next: ViewMode | null) => next && setViewMode(next)}
            >
              <ToggleButton value="list" aria-label={t("userDocuments.viewMode.list")}>
                <Tooltip title={t("userDocuments.viewMode.list")}>
                  <ViewListIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="grid" aria-label={t("userDocuments.viewMode.grid")}>
                <Tooltip title={t("userDocuments.viewMode.grid")}>
                  <GridViewIcon fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <Button
              variant="contained"
              size="small"
              startIcon={uploadMutation.isPending ? <CircularProgress size={16} color="inherit" /> : <AttachFileIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              {t("userDocuments.picker.select")}
            </Button>
          </Stack>
          {/* Seleção anexa direto — sem etapa de "preparar" arquivos. */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              const files = Array.from(e.target.files ?? []);
              e.target.value = ""; // permite re-selecionar o mesmo arquivo
              if (files.length > 0) uploadMutation.mutate(files);
            }}
          />
        </Stack>

        {docsQuery.isLoading ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            {t("userDocuments.loading")}
          </Typography>
        ) : !documents.length ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            {t("userDocuments.empty")}
          </Typography>
        ) : viewMode === "grid" ? (
          <Grid container spacing={2}>
            {documents.map((d) => (
              <Grid key={d.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    height: "100%",
                    transition: (t) => t.transitions.create("box-shadow", { duration: t.transitions.duration.short }),
                    "&:hover": { boxShadow: 3 },
                  }}
                >
                  <CardContent>
                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                      {fileIcon(d.name, "large")}
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          title={d.name}
                          sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        >
                          {d.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatFileSizeKB(d.size)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {formatDateTimeBR(d.uploadDate)}
                        </Typography>
                      </Box>
                    </Stack>
                    <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
                      {documentActions(d)}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
        <DataTableContainer stickyHeader={false}>
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              <TableCell sx={{ width: "48%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("userDocuments.table.name")}</b></TableCell>
              <TableCell align="center" sx={{ width: "16%", whiteSpace: "nowrap" }}><b>{t("userDocuments.table.size")}</b></TableCell>
              <TableCell align="center" sx={{ width: "24%", whiteSpace: "nowrap" }}><b>{t("userDocuments.table.uploadDate")}</b></TableCell>
              <TableCell align="center" sx={{ width: "12%", whiteSpace: "nowrap" }}><b>{t("userDocuments.table.actions")}</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {documents.map((d) => (
              <TableRow key={d.id} hover>
                <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={d.name}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {fileIcon(d.name)}
                    <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis" }}>{d.name}</Box>
                  </Stack>
                </TableCell>
                <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{formatFileSizeKB(d.size)}</TableCell>
                <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{formatDateTimeBR(d.uploadDate)}</TableCell>
                <TableCell align="center">{documentActions(d)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DataTableContainer>
        )}
      </Paper>

      {/* Menu de ações por documento */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            if (menuTarget !== null) setConfirmDeleteId(menuTarget);
            closeMenu();
          }}
        >
          {t("userDocuments.actions.delete")}
        </MenuItem>
      </Menu>

      {/* Pré-visualização de documento */}
      <Dialog open={preview !== null} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogTitle>{preview?.name}</DialogTitle>
        <DialogContent dividers sx={{ p: 0, display: "flex", justifyContent: "center", bgcolor: "background.default" }}>
          {preview?.kind === "image" ? (
            <Box
              component="img"
              src={preview.url}
              alt={preview.name}
              sx={{ maxWidth: "100%", maxHeight: "70vh", objectFit: "contain" }}
            />
          ) : preview?.kind === "pdf" ? (
            <Box component="iframe" src={preview.url} title={preview.name} sx={{ width: "100%", height: "70vh", border: 0 }} />
          ) : preview?.kind === "docx" && preview.blob ? (
            <Suspense
              fallback={
                <Stack alignItems="center" sx={{ py: 6 }}>
                  <CircularProgress size={24} />
                </Stack>
              }
            >
              <DocxPreview
                blob={preview.blob}
                message={t("userDocuments.previewUnsupported")}
                downloadLabel={t("userDocuments.actions.download")}
                onDownload={() => handleDownload(preview.docId, preview.name)}
              />
            </Suspense>
          ) : preview?.kind === "unsupported" ? (
            <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
              <Typography variant="body2" color="text.secondary">
                {t("userDocuments.previewUnsupported")}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload(preview.docId, preview.name)}
              >
                {t("userDocuments.actions.download")}
              </Button>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>{t("common.actions.close")}</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmar exclusão de documento */}
      <Dialog open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("userDocuments.confirmDeleteTitle")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{t("userDocuments.confirmDelete")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>{t("common.actions.cancel")}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (confirmDeleteId !== null) deleteMutation.mutate(confirmDeleteId);
              setConfirmDeleteId(null);
            }}
          >
            {t("common.actions.confirm")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
