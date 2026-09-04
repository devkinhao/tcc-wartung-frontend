import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Tooltip from "@mui/material/Tooltip";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  getInspectionDetail,
  updateInspection,
  type InspectionUpdateRequestDTO,
} from "../api/inspections.detail.api";
import {
  deleteInspectionDocument,
  downloadInspectionDocument,
  listInspectionDocuments,
  uploadInspectionDocuments,
} from "../api/inspections.documents.api";
import type { InspectionDetailResponseDTO } from "../types/inspectionDetail";
import { qk } from "@/api/keys";
import { useNotify } from "@/hooks/useNotify";
import { EditableCardHeader } from "@/components/EditableCardHeader";
import { AuditFooter } from "@/components/AuditFooter";
import { formatDateBR, formatDateTimeBR, formatFileSizeKB } from "@/utils/date";
import { paths } from "@/routes/paths";
import { DataTableContainer } from "@/components/DataTableContainer";
import { DocxPreview } from "@/components/DocxPreview";
import { typography } from "@/styles/typography";
import { MaskedTextField } from "@/components/MaskedTextField";
import { fieldError } from "@/validation/fields";
import { inspectionFormSchema } from "../schemas";
import { INSPECTION_NOTES_MAX_LENGTH } from "../constants";
import { DocumentPicker } from "./DocumentPicker";
import { deactivationReasonKey } from "../deactivationReason";

function toISODate(value?: string | null) {
  if (!value) return "";
  return value.split("T")[0];
}

// O backend devolve o download sempre como "application/octet-stream" —
// deduzimos o tipo real pela extensão pra saber o que dá pra pré-visualizar
// inline no navegador (imagem/PDF) e o que só dá pra baixar (docx, xlsx, etc).
function guessMimeType(name: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf": return "application/pdf";
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    case "gif": return "image/gif";
    case "bmp": return "image/bmp";
    case "webp": return "image/webp";
    case "svg": return "image/svg+xml";
    default: return null;
  }
}

function isDocx(name: string): boolean {
  return name.toLowerCase().endsWith(".docx");
}

type Props = {
  inspectionId: number | null;
  open: boolean;
  onClose: () => void;
  /** Presente quando aberto pela ficha de uma empresa — invalida o cache dela. */
  customerId?: number | null;
};

/**
 * Detalhes da inspeção num modal: ver/editar dados (serviço, datas, ART,
 * observações), gerir documentos e reativar quando encerrada. Renovar / desativar
 * / excluir ficam no menu da linha das listagens.
 */
export function InspectionDetailModal({ inspectionId, open, onClose, customerId }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const notify = useNotify();

  const enabled = open && Number.isFinite(inspectionId) && (inspectionId ?? 0) > 0;
  const id = inspectionId ?? 0;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<InspectionDetailResponseDTO | null>(null);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [docMenuAnchor, setDocMenuAnchor] = useState<HTMLElement | null>(null);
  const [docMenuTarget, setDocMenuTarget] = useState<number | null>(null);
  const [preview, setPreview] = useState<{
    docId: number;
    name: string;
    kind: "image" | "pdf" | "docx" | "unsupported";
    url?: string;
    blob?: Blob;
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState<number | null>(null);

  const { data: view, isLoading } = useQuery({
    queryKey: qk.inspectionDetail(id),
    queryFn: () => getInspectionDetail(id),
    enabled,
  });

  const docsQuery = useQuery({
    queryKey: qk.inspectionDocuments(id),
    queryFn: () => listInspectionDocuments(id),
    enabled,
  });

  const documents = docsQuery.data ?? view?.documents ?? [];

  // Inspeção inativa fica somente-leitura: nada de editar dados nem anexar/
  // excluir documentos até que o usuário a reative.
  const readOnly = view != null && !view.isActive;

  // Trocar de inspeção (ou reabrir) descarta qualquer rascunho pendente.
  const [loadedId, setLoadedId] = useState(id);
  if (id !== loadedId) {
    setLoadedId(id);
    setEditing(false);
    setDraft(null);
  }

  const mutation = useMutation({
    mutationFn: (payload: InspectionUpdateRequestDTO) => updateInspection(id, payload),
    onSuccess: (updated) => {
      qc.setQueryData(qk.inspectionDetail(id), updated);
      qc.invalidateQueries({ queryKey: ["inspections-list"] });
      qc.invalidateQueries({ queryKey: qk.dashboard() });
      if (customerId) qc.invalidateQueries({ queryKey: qk.customerDetail(customerId) });
      setEditing(false);
      setDraft(null);
    },
    onError: (err) => notify.fromError(err),
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadInspectionDocuments(id, files),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: qk.inspectionDocuments(id) }),
        qc.invalidateQueries({ queryKey: qk.inspectionDetail(id) }),
      ]);
      if (customerId) qc.invalidateQueries({ queryKey: qk.customerDetail(customerId) });
      setUploadOpen(false);
      setUploadFiles([]);
      notify.success("notify.success.documentsUploaded");
    },
    onError: (err) => notify.fromError(err),
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId: number) => deleteInspectionDocument(id, docId),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: qk.inspectionDocuments(id) }),
        qc.invalidateQueries({ queryKey: qk.inspectionDetail(id) }),
      ]);
      if (customerId) qc.invalidateQueries({ queryKey: qk.customerDetail(customerId) });
      notify.success("notify.success.documentDeleted");
    },
    onError: (err) => notify.fromError(err),
  });

  const inspectionDateValue = toISODate(draft?.inspectionDate);
  const expirationDateValue = toISODate(draft?.expirationDate);
  const artNumberValue = draft?.artNumber ?? "";
  const generalForm = inspectionFormSchema.safeParse({
    inspectionDate: inspectionDateValue,
    expirationDate: expirationDateValue,
    artNumber: artNumberValue.trim(),
    notes: draft?.notes ?? "",
  });
  const expirationBeforeInspection =
    inspectionDateValue !== "" &&
    expirationDateValue !== "" &&
    !!fieldError(generalForm, "expirationDate");
  const artNumberInvalid = artNumberValue.trim() !== "" && !!fieldError(generalForm, "artNumber");
  const isGeneralValid = generalForm.success;

  const hasUnsavedChanges =
    editing &&
    draft != null &&
    view != null &&
    (draft.inspectionDate !== view.inspectionDate ||
      draft.expirationDate !== view.expirationDate ||
      (draft.notes ?? "") !== (view.notes ?? "") ||
      (draft.artNumber ?? "") !== (view.artNumber ?? ""));

  const startEditing = () => {
    if (readOnly || !view) return;
    setDraft(view);
    setEditing(true);
  };

  const cancelEditing = () => {
    setDraft(null);
    setEditing(false);
  };

  const requestClose = () => {
    if (hasUnsavedChanges) {
      setConfirmDiscardOpen(true);
      return;
    }
    cancelEditing();
    onClose();
  };

  const handleSave = () => {
    if (!draft) return;
    mutation.mutate(
      {
        inspectionDate: toISODate(draft.inspectionDate),
        expirationDate: toISODate(draft.expirationDate),
        notes: draft.notes ?? "",
        artNumber: draft.artNumber?.trim() || null,
        isActive: draft.isActive,
      },
      { onSuccess: () => notify.success("notify.success.saved") }
    );
  };

  const handleReactivate = () => {
    if (!view) return;
    mutation.mutate(
      {
        inspectionDate: toISODate(view.inspectionDate),
        expirationDate: toISODate(view.expirationDate),
        notes: view.notes ?? "",
        artNumber: view.artNumber?.trim() || null,
        isActive: true,
      },
      { onSuccess: () => notify.success("notify.success.inspectionReactivated") }
    );
  };

  const handleDownload = async (docId: number, name: string) => {
    try {
      const blob = await downloadInspectionDocument(id, docId);
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
      const blob = await downloadInspectionDocument(id, docId);

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

  const openDocMenu = (e: React.MouseEvent<HTMLElement>, docId: number) => {
    setDocMenuAnchor(e.currentTarget);
    setDocMenuTarget(docId);
  };

  const closeDocMenu = () => {
    setDocMenuAnchor(null);
    setDocMenuTarget(null);
  };

  const title = view?.serviceType?.name
    ? t("inspectionDetails.titleWithService", { service: view.serviceType.name })
    : t("inspectionDetails.title");

  return (
    <>
      <Dialog open={open} onClose={requestClose} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle sx={{ pr: 6 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
            <Typography component="span" fontWeight={typography.weight.bold} noWrap sx={{ minWidth: 0 }}>
              {title}
            </Typography>
          </Stack>
          <IconButton
            onClick={requestClose}
            aria-label={t("common.actions.close")}
            size="small"
            sx={{ position: "absolute", right: 12, top: 12 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {isLoading || !view ? (
            <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 4 }}>
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                {t("inspectionDetails.loading")}
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap" }}>
                <Chip
                  size="small"
                  label={
                    view.isActive
                      ? t("inspectionDetails.status.active")
                      : t("inspectionDetails.status.inactive")
                  }
                  color={view.isActive ? "success" : "default"}
                />
                {view.isRenewed ? (
                  <Chip size="small" label={t("inspectionDetails.status.renewed")} color="info" />
                ) : null}
                {!view.isActive && view.deactivationReason ? (
                  <Tooltip title={t(deactivationReasonKey(view.deactivationReason))}>
                    <Chip size="small" color="warning" label={t("inspections.deactivate.archivedChip")} />
                  </Tooltip>
                ) : null}

                <Typography variant="body2" color="text.secondary" sx={{ display: "flex", gap: 0.5 }}>
                  {t("inspectionDetails.summary.customer")}:
                  {view.customer ? (
                    <Link
                      component={RouterLink}
                      to={paths.customerDetails(view.customer.id)}
                      underline="hover"
                      color="inherit"
                      sx={{ fontWeight: typography.weight.semibold }}
                    >
                      {view.customer.legalName} — {view.customer.cnpj}
                    </Link>
                  ) : (
                    t("inspectionDetails.summary.customerUnknown")
                  )}
                </Typography>
              </Stack>

              <Box>
                <EditableCardHeader
                  title={t("inspectionDetails.sections.general")}
                  editing={editing}
                  saving={mutation.isPending}
                  saveDisabled={!isGeneralValid}
                  readOnly={readOnly}
                  onEdit={startEditing}
                  onCancel={cancelEditing}
                  onSave={handleSave}
                />

                <Stack spacing={2}>
                  <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
                    <TextField
                      label={t("inspectionDetails.fields.service")}
                      size="small"
                      fullWidth
                      value={view.serviceType?.name ?? "—"}
                      disabled
                    />

                    <TextField
                      label={t("inspectionDetails.fields.inspectionDate")}
                      size="small"
                      fullWidth
                      required
                      type={editing ? "date" : "text"}
                      value={editing ? toISODate(draft?.inspectionDate) : formatDateBR(view.inspectionDate)}
                      onChange={(e) =>
                        setDraft((prev) => (prev ? { ...prev, inspectionDate: e.target.value } : prev))
                      }
                      disabled={!editing}
                      slotProps={{ inputLabel: { shrink: true } }}
                    />

                    <TextField
                      label={t("inspectionDetails.fields.expirationDate")}
                      size="small"
                      fullWidth
                      required
                      type={editing ? "date" : "text"}
                      value={editing ? toISODate(draft?.expirationDate) : formatDateBR(view.expirationDate)}
                      onChange={(e) =>
                        setDraft((prev) => (prev ? { ...prev, expirationDate: e.target.value } : prev))
                      }
                      disabled={!editing}
                      error={editing && expirationBeforeInspection}
                      helperText={
                        editing && expirationBeforeInspection
                          ? t("inspections.addModal.errors.expirationBeforeInspection")
                          : undefined
                      }
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Stack>

                  {editing ? (
                    <MaskedTextField
                      mask="art"
                      label={t("inspectionDetails.fields.artNumber")}
                      size="small"
                      fullWidth
                      value={draft?.artNumber ?? ""}
                      onChange={(v) =>
                        setDraft((prev) => (prev ? { ...prev, artNumber: v || null } : prev))
                      }
                      error={artNumberInvalid}
                      helperText={
                        artNumberInvalid ? t("inspectionDetails.errors.artNumberFormat") : undefined
                      }
                      sx={{ maxWidth: { sm: 320 } }}
                    />
                  ) : (
                    <TextField
                      label={t("inspectionDetails.fields.artNumber")}
                      size="small"
                      fullWidth
                      value={view.artNumber ?? "—"}
                      disabled
                      sx={{ maxWidth: { sm: 320 } }}
                    />
                  )}

                  <TextField
                    label={t("inspectionDetails.fields.notes")}
                    size="small"
                    fullWidth
                    multiline
                    minRows={3}
                    value={editing ? draft?.notes ?? "" : view.notes ?? ""}
                    onChange={(e) =>
                      setDraft((prev) => (prev ? { ...prev, notes: e.target.value } : prev))
                    }
                    disabled={!editing}
                    slotProps={{ htmlInput: { maxLength: INSPECTION_NOTES_MAX_LENGTH } }}
                  />
                </Stack>
              </Box>

              <Box>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ sm: "center" }}
                  justifyContent="space-between"
                  sx={{ mb: 2 }}
                >
                  <Typography variant="subtitle2">{t("inspectionDetails.sections.documents")}</Typography>
                  <Tooltip title={readOnly ? t("inspectionDetails.documents.lockedHint") : ""}>
                    <span>
                      <Button
                        variant="outlined"
                        startIcon={<UploadFileIcon />}
                        onClick={() => setUploadOpen(true)}
                        disabled={readOnly}
                      >
                        {t("inspectionDetails.documents.actions.upload")}
                      </Button>
                    </span>
                  </Tooltip>
                </Stack>

                <DataTableContainer stickyHeader={false}>
                  <TableHead sx={{ bgcolor: "background.default" }}>
                    <TableRow>
                      <TableCell sx={{ width: "48%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("inspectionDetails.documents.table.name")}</b></TableCell>
                      <TableCell align="center" sx={{ width: "14%", whiteSpace: "nowrap" }}><b>{t("inspectionDetails.documents.table.size")}</b></TableCell>
                      <TableCell align="center" sx={{ width: "18%", whiteSpace: "nowrap" }}><b>{t("inspectionDetails.documents.table.uploadDate")}</b></TableCell>
                      <TableCell align="center" sx={{ width: "10%", whiteSpace: "nowrap" }}><b>{t("inspectionDetails.documents.table.actions")}</b></TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {docsQuery.isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 2, color: "text.secondary" }}>
                          {t("inspectionDetails.documents.loading")}
                        </TableCell>
                      </TableRow>
                    ) : documents?.length ? (
                      documents.map((d) => (
                        <TableRow key={d.id} hover>
                          <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={d.name}>
                            {d.name}
                          </TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{formatFileSizeKB(d.size)}</TableCell>
                          <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{formatDateTimeBR(d.uploadDate)}</TableCell>
                          <TableCell align="center">
                            <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                              <Tooltip title={t("inspectionDetails.documents.actions.view")}>
                                <span>
                                  <IconButton
                                    size="small"
                                    aria-label={t("inspectionDetails.documents.actions.view")}
                                    onClick={() => handlePreview(d.id, d.name)}
                                    disabled={previewLoading === d.id}
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title={t("inspectionDetails.documents.actions.download")}>
                                <IconButton
                                  size="small"
                                  aria-label={t("inspectionDetails.documents.actions.download")}
                                  onClick={() => handleDownload(d.id, d.name)}
                                >
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              {readOnly ? null : (
                                <Tooltip title={t("inspectionDetails.documents.table.actions")}>
                                  <IconButton
                                    size="small"
                                    aria-label={t("inspectionDetails.documents.table.actions")}
                                    onClick={(e) => openDocMenu(e, d.id)}
                                  >
                                    <MoreVertIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 2, color: "text.secondary" }}>
                          {t("inspectionDetails.documents.empty")}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </DataTableContainer>
              </Box>

              <AuditFooter
                createdBy={view.createdByUsername}
                createdAt={view.createdAt}
                updatedBy={view.updatedByUsername}
                updatedAt={view.updatedAt}
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          {view && !view.isActive && !view.isRenewed ? (
            <Button
              color="success"
              startIcon={<RestartAltIcon />}
              onClick={handleReactivate}
              disabled={mutation.isPending || editing}
              sx={{ mr: "auto" }}
            >
              {t("inspectionDetails.actions.reactivate")}
            </Button>
          ) : null}
          <Button onClick={requestClose}>{t("common.actions.close")}</Button>
        </DialogActions>
      </Dialog>

      {/* Menu de ações por documento */}
      <Menu anchorEl={docMenuAnchor} open={Boolean(docMenuAnchor)} onClose={closeDocMenu}>
        <MenuItem
          onClick={() => {
            if (docMenuTarget !== null) setConfirmDeleteId(docMenuTarget);
            closeDocMenu();
          }}
        >
          {t("inspectionDetails.documents.actions.delete")}
        </MenuItem>
      </Menu>

      {/* Pré-visualização de documento */}
      <Dialog open={preview !== null} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {preview?.name}
        </DialogTitle>
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
            <DocxPreview
              blob={preview.blob}
              message={t("inspectionDetails.documents.previewUnsupported")}
              downloadLabel={t("inspectionDetails.documents.actions.download")}
              onDownload={() => handleDownload(preview.docId, preview.name)}
            />
          ) : preview?.kind === "unsupported" ? (
            <Stack spacing={2} alignItems="center" sx={{ py: 6 }}>
              <Typography variant="body2" color="text.secondary">
                {t("inspectionDetails.documents.previewUnsupported")}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload(preview.docId, preview.name)}
              >
                {t("inspectionDetails.documents.actions.download")}
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
        <DialogTitle>{t("inspectionDetails.documents.confirmDeleteTitle")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{t("inspectionDetails.documents.confirmDelete")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteId(null)}>{t("common.actions.cancel")}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (confirmDeleteId !== null) deleteDocMutation.mutate(confirmDeleteId);
              setConfirmDeleteId(null);
            }}
          >
            {t("common.actions.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Upload de documentos */}
      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("inspectionDetails.documents.uploadDialog.title")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <DocumentPicker files={uploadFiles} onChange={setUploadFiles} disabled={uploadMutation.isPending} />
            <Typography variant="caption" color="text.secondary">
              {t("inspectionDetails.documents.uploadDialog.hint")}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadOpen(false)} disabled={uploadMutation.isPending}>
            {t("common.actions.cancel")}
          </Button>
          <Button
            variant="contained"
            startIcon={uploadMutation.isPending ? <CircularProgress size={16} /> : <UploadFileIcon />}
            onClick={() => uploadMutation.mutate(uploadFiles)}
            disabled={uploadMutation.isPending || uploadFiles.length === 0}
          >
            {t("inspectionDetails.documents.uploadDialog.upload")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Descartar edição ao fechar */}
      <Dialog open={confirmDiscardOpen} onClose={() => setConfirmDiscardOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("unsavedChanges.title")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{t("unsavedChanges.message")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDiscardOpen(false)}>{t("unsavedChanges.stay")}</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              setConfirmDiscardOpen(false);
              cancelEditing();
              onClose();
            }}
          >
            {t("unsavedChanges.leave")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
