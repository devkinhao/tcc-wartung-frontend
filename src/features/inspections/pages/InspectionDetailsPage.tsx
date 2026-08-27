import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import Tooltip from "@mui/material/Tooltip";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import {
  deleteInspection,
  getInspectionDetail,
  updateInspection,
  type InspectionUpdateRequestDTO,
} from "../api/inspections.detail.api";
import {
  deleteInspectionDocument,
  downloadInspectionDocument,
  listInspectionDocuments,
  uploadInspectionDocument,
} from "../api/inspection.documents.api";
import type { InspectionDetailResponseDTO } from "../types/inspectionDetail";
import { qk } from "@/api/keys";
import { useNotify } from "@/hooks/useNotify";
import { EditableCardHeader } from "@/components/EditableCardHeader";
import { formatDateBR, formatDateTimeBR, formatFileSizeKB } from "@/utils/date";
import { paths } from "@/routes/paths";
import { DataTableContainer } from "@/components/DataTableContainer";
import { DocxPreview } from "@/components/DocxPreview";
import { Breadcrumb } from "@/layout/header/Breadcrumb";
import type { BreadcrumbItem } from "@/layout/header/breadcrumbMap";
import { typography } from "@/styles/typography";
import { MaskedTextField } from "@/components/MaskedTextField";
import { isValidArtNumber } from "../utils/artNumber";
import { openCreaScArtValidation } from "@/utils/creaScArt";

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

export default function InspectionDetailsPage() {
  const { t } = useTranslation();
  const { id, customerId: customerIdParam } = useParams();
  const inspectionId = Number(id);
  // customerId present when accessed via /customers/:customerId/inspections/:id
  const customerId   = customerIdParam ? Number(customerIdParam) : null;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const notify = useNotify();

  // Back navigation: return to customer inspections tab if context available
  const handleBack = () => {
    if (customerId) {
      navigate(paths.customerInspectionsTab(customerId));
    } else {
      navigate(paths.inspections);
    }
  };

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<InspectionDetailResponseDTO | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [menuEl, setMenuEl] = useState<HTMLElement | null>(null);
  const [confirmDeleteInspectionOpen, setConfirmDeleteInspectionOpen] = useState(false);

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

  const { data, isLoading } = useQuery({
    queryKey: qk.inspectionDetail(inspectionId),
    queryFn: () => getInspectionDetail(inspectionId),
    enabled: Number.isFinite(inspectionId) && inspectionId > 0,
  });

  const docsQuery = useQuery({
    queryKey: qk.inspectionDocuments(inspectionId),
    queryFn: () => listInspectionDocuments(inspectionId),
    enabled: Number.isFinite(inspectionId) && inspectionId > 0,
  });

  useEffect(() => {
    if (data) setDraft((prev) => prev ?? data);
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: InspectionUpdateRequestDTO) => updateInspection(inspectionId, payload),
    onSuccess: (updated) => {
      qc.setQueryData(qk.inspectionDetail(inspectionId), updated);
      setDraft(updated);
      setEditing(false);
      notify.success("notify.success.saved");
    },
    onError: (err) => notify.fromError(err),
  });

  const uploadMutation = useMutation({
    mutationFn: (params: { description: string; file: File }) =>
      uploadInspectionDocument(inspectionId, params),
    onSuccess: async () => {
      // Invalida e aguarda os dados atualizados ANTES de fechar o dialog
      await Promise.all([
        qc.invalidateQueries({ queryKey: qk.inspectionDocuments(inspectionId) }),
        qc.invalidateQueries({ queryKey: qk.inspectionDetail(inspectionId) }),
      ]);
      setUploadOpen(false);
      setUploadDescription("");
      setUploadFile(null);
      notify.success("notify.success.uploaded");
    },
    onError: (err) => notify.fromError(err),
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: number) => deleteInspectionDocument(inspectionId, docId),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: qk.inspectionDocuments(inspectionId) }),
        qc.invalidateQueries({ queryKey: qk.inspectionDetail(inspectionId) }),
      ]);
      notify.success("notify.success.deleted");
    },
    onError: (err) => notify.fromError(err),
  });

  const deleteInspectionMutation = useMutation({
    mutationFn: () => deleteInspection(inspectionId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["inspections-list"] });
      qc.invalidateQueries({ queryKey: qk.dashboard() });
      if (customerId) {
        qc.invalidateQueries({ queryKey: qk.customerDetail(customerId) });
        navigate(paths.customerInspectionsTab(customerId));
      } else {
        navigate(paths.inspections);
      }
    },
    onError: (err) => notify.fromError(err),
  });

  const view = draft ?? data;

  const documents = docsQuery.data ?? view?.documents ?? [];

  if (isLoading || !view) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <CircularProgress size={18} />
        <Typography variant="body2" color="text.secondary">
          {t("inspectionDetails.loading")}
        </Typography>
      </Stack>
    );
  }

  // Espelha as constraints do InspectionUpdateRequestDTO do backend (@NotNull
  // inspectionDate/expirationDate) mais a regra de negócio de vencimento
  // não anteceder a inspeção — feedback instantâneo, sem round-trip.
  const inspectionDateValue = toISODate(draft?.inspectionDate);
  const expirationDateValue = toISODate(draft?.expirationDate);
  const expirationBeforeInspection =
    inspectionDateValue !== "" &&
    expirationDateValue !== "" &&
    expirationDateValue < inspectionDateValue;
  const artNumberValue = draft?.artNumber ?? "";
  const artNumberInvalid = !isValidArtNumber(artNumberValue);
  const isGeneralValid =
    inspectionDateValue !== "" &&
    expirationDateValue !== "" &&
    !expirationBeforeInspection &&
    !artNumberInvalid;

  const handleValidateArt = () => {
    if (!view.artNumber) return;
    openCreaScArtValidation(view.artNumber);
  };

  const handleSave = () => {
    if (!draft) return;

    const payload: InspectionUpdateRequestDTO = {
      inspectionDate: toISODate(draft.inspectionDate),
      expirationDate: toISODate(draft.expirationDate),
      notes: draft.notes ?? "",
      artNumber: draft.artNumber?.trim() || null,
      isActive: draft.isActive,
    };

    mutation.mutate(payload);
  };

  const statusLabel = view.isActive
    ? t("inspectionDetails.status.active")
    : t("inspectionDetails.status.inactive");

  const title = view.serviceType?.name
    ? t("inspectionDetails.titleWithService", { service: view.serviceType.name })
    : t("inspectionDetails.title");

  const breadcrumbItems: BreadcrumbItem[] = customerId
    ? [
        { label: "nav.home", path: paths.dashboard },
        { label: "nav.customersList", path: paths.customers },
        { label: view.customer?.legalName ?? t("nav.customerDetails"), path: paths.customerInspectionsTab(customerId) },
        { label: "nav.inspectionDetailsPage" },
      ]
    : [
        { label: "nav.home", path: paths.dashboard },
        { label: "nav.inspectionsList", path: paths.inspections },
        { label: "nav.inspectionDetailsPage" },
      ];

  const handleDownload = async (docId: number, name: string) => {
    try {
      const blob = await downloadInspectionDocument(inspectionId, docId);
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

  const handleDeleteDoc = (docId: number) => {
    setConfirmDeleteId(docId);
  };

  const handlePreview = async (docId: number, name: string) => {
    setPreviewLoading(docId);
    try {
      const blob = await downloadInspectionDocument(inspectionId, docId);

      if (isDocx(name)) {
        setPreview({ docId, name, kind: "docx", blob });
        return;
      }

      const mimeType = guessMimeType(name);
      // Reconstrói o Blob com o tipo correto — sem isso o navegador não sabe
      // renderizar o PDF/imagem inline e acaba oferecendo só "Salvar como".
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

  return (
    <Box sx={{ width: "100%" }}>

      {/* Menu de ações por documento (3 pontinhos) */}
      <Menu anchorEl={docMenuAnchor} open={Boolean(docMenuAnchor)} onClose={closeDocMenu}>
        <MenuItem
          onClick={() => {
            if (docMenuTarget !== null) handleDeleteDoc(docMenuTarget);
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

      {/* Confirm delete dialog — substitui window.confirm */}
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
              if (confirmDeleteId !== null) deleteMutation.mutate(confirmDeleteId);
              setConfirmDeleteId(null);
            }}
          >
            {t("common.actions.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmação de exclusão da inspeção — substitui window.confirm */}
      <Dialog
        open={confirmDeleteInspectionOpen}
        onClose={() => setConfirmDeleteInspectionOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{t("inspectionDetails.confirmDelete.title")}</DialogTitle>
        <DialogContent>
          <Typography variant="body2">{t("inspectionDetails.confirmDelete.message")}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteInspectionOpen(false)}>
            {t("common.actions.cancel")}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setConfirmDeleteInspectionOpen(false);
              deleteInspectionMutation.mutate();
            }}
          >
            {t("common.actions.confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ mb: 1 }}>
        <Breadcrumb items={breadcrumbItems} size="large" />
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 2, mb: 2 }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <IconButton
                  size="small"
                  onClick={handleBack}
                  aria-label={t("inspectionDetails.actions.back")}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>

                <Typography fontWeight={typography.weight.bold} color="text.primary" noWrap sx={{ minWidth: 0 }}>
                  {title}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: "wrap" }}>
                <Typography variant="body2" color="text.secondary">
                  {t("inspectionDetails.summary.id")}: {view.id}
                </Typography>

                <Chip size="small" label={statusLabel} color={view.isActive ? "success" : "default"} />
                {view.isRenewed ? (
                  <Chip size="small" label={t("inspectionDetails.status.renewed")} color="info" />
                ) : null}

                {/* Empresa (customer) não vem no DTO ainda */}
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
            </Box>

            <Box>
              <IconButton
                aria-label={t("inspectionDetails.actions.actions")}
                onClick={(e) => setMenuEl(e.currentTarget)}
                disabled={deleteInspectionMutation.isPending}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu open={Boolean(menuEl)} anchorEl={menuEl} onClose={() => setMenuEl(null)}>
                <MenuItem
                  onClick={() => {
                    setMenuEl(null);
                    setConfirmDeleteInspectionOpen(true);
                  }}
                >
                  {t("inspectionDetails.actions.delete")}
                </MenuItem>
              </Menu>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Stack spacing={2}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <EditableCardHeader
              title={t("inspectionDetails.sections.general")}
              editing={editing}
              saving={mutation.isPending}
              saveDisabled={!isGeneralValid}
              onEdit={() => setEditing(true)}
              onCancel={() => {
                setDraft(data ?? null);
                setEditing(false);
              }}
              onSave={handleSave}
            />

            <Stack spacing={2} sx={{ maxWidth: 1400 }}>
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
                  InputLabelProps={{ shrink: true }}
                  value={editing ? toISODate(draft?.inspectionDate) : formatDateBR(view.inspectionDate)}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev
                        ? {
                            ...prev,
                            inspectionDate: e.target.value,
                          }
                        : prev
                    )
                  }
                  disabled={!editing}
                />

                <TextField
                  label={t("inspectionDetails.fields.expirationDate")}
                  size="small"
                  fullWidth
                  required
                  type={editing ? "date" : "text"}
                  InputLabelProps={{ shrink: true }}
                  value={editing ? toISODate(draft?.expirationDate) : formatDateBR(view.expirationDate)}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev
                        ? {
                            ...prev,
                            expirationDate: e.target.value,
                          }
                        : prev
                    )
                  }
                  disabled={!editing}
                  error={editing && expirationBeforeInspection}
                  helperText={
                    editing && expirationBeforeInspection
                      ? t("inspections.addModal.errors.expirationBeforeInspection")
                      : undefined
                  }
                />

                <Stack spacing={0.5} sx={{ minWidth: 110, flexShrink: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t("inspectionDetails.fields.isActive")}
                  </Typography>
                  <Chip
                    label={(editing ? draft?.isActive : view.isActive) ? t("common.yes") : t("common.no")}
                    color={(editing ? draft?.isActive : view.isActive) ? "success" : "default"}
                    variant={(editing ? draft?.isActive : view.isActive) ? "filled" : "outlined"}
                    sx={{ width: "fit-content" }}
                    onClick={
                      editing
                        ? () =>
                            setDraft((prev) =>
                              prev ? { ...prev, isActive: !prev.isActive } : prev
                            )
                        : undefined
                    }
                  />
                </Stack>
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="flex-start">
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

                <Tooltip
                  title={
                    view.artNumber
                      ? t("inspectionDetails.artValidation.tooltip")
                      : t("inspectionDetails.artValidation.disabledHint")
                  }
                >
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FactCheckIcon />}
                      onClick={handleValidateArt}
                      disabled={!view.artNumber || editing}
                      sx={{ mt: { sm: 0.25 }, whiteSpace: "nowrap" }}
                    >
                      {t("inspectionDetails.artValidation.action")}
                    </Button>
                  </span>
                </Tooltip>
              </Stack>

              <TextField
                label={t("inspectionDetails.fields.notes")}
                size="small"
                fullWidth
                multiline
                minRows={3}
                value={editing ? draft?.notes ?? "" : view.notes ?? ""}
                onChange={(e) =>
                  setDraft((prev) =>
                    prev
                      ? {
                          ...prev,
                          notes: e.target.value,
                        }
                      : prev
                  )
                }
                disabled={!editing}
                inputProps={{ maxLength: 100 }}
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">{t("inspectionDetails.sections.documents")}</Typography>

              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => setUploadOpen(true)}
              >
                {t("inspectionDetails.documents.actions.upload")}
              </Button>
            </Stack>

            <DataTableContainer>
                <TableHead sx={{ bgcolor: "background.default" }}>
                  <TableRow>
                    <TableCell sx={{ width: "38%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("inspectionDetails.documents.table.description")}</b></TableCell>
                    <TableCell sx={{ width: "20%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("inspectionDetails.documents.table.name")}</b></TableCell>
                    <TableCell align="center" sx={{ width: "14%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("inspectionDetails.documents.table.size")}</b></TableCell>
                    <TableCell align="center" sx={{ width: "18%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("inspectionDetails.documents.table.uploadDate")}</b></TableCell>
                    <TableCell align="center" sx={{ width: "10%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("inspectionDetails.documents.table.actions")}</b></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {docsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 2, color: "text.secondary" }}>
                        {t("inspectionDetails.documents.loading")}
                      </TableCell>
                    </TableRow>
                  ) : documents?.length ? (
                    documents.map((d) => (
                      <TableRow key={d.id} hover>
                        <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={d.description ?? ""}>
                          {d.description || "—"}
                        </TableCell>
                        <TableCell sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={d.name}>
                          {d.name}
                        </TableCell>
                        <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{formatFileSizeKB(d.size)}</TableCell>
                        <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{formatDateTimeBR(d.uploadDate)}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                            <IconButton
                              size="small"
                              aria-label={t("inspectionDetails.documents.actions.view")}
                              onClick={() => handlePreview(d.id, d.name)}
                              disabled={previewLoading === d.id}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label={t("inspectionDetails.documents.actions.download")}
                              onClick={() => handleDownload(d.id, d.name)}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label={t("inspectionDetails.documents.table.actions")}
                              onClick={(e) => openDocMenu(e, d.id)}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 2, color: "text.secondary" }}>
                        {t("inspectionDetails.documents.empty")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
            </DataTableContainer>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              {t("inspectionDetails.sections.audit")}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Stack sx={{ maxWidth: 1400 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <TextField
                  label={t("inspectionDetails.audit.createdAt")}
                  size="small"
                  fullWidth
                  value={formatDateTimeBR(view.createdAt)}
                  disabled
                />
                <TextField
                  label={t("inspectionDetails.audit.createdBy")}
                  size="small"
                  fullWidth
                  value={view.createdByUsername ?? "—"}
                  disabled
                />
              </Stack>

              <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
                <TextField
                  label={t("inspectionDetails.audit.updatedAt")}
                  size="small"
                  fullWidth
                  value={formatDateTimeBR(view.updatedAt)}
                  disabled
                />
                <TextField
                  label={t("inspectionDetails.audit.updatedBy")}
                  size="small"
                  fullWidth
                  value={view.updatedByUsername ?? "—"}
                  disabled
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Dialog open={uploadOpen} onClose={() => setUploadOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("inspectionDetails.documents.uploadDialog.title")}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t("inspectionDetails.documents.uploadDialog.description")}
              size="small"
              fullWidth
              required
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              inputProps={{ maxLength: 50 }}
            />

            <Button variant="outlined" component="label">
              {uploadFile
                ? t("inspectionDetails.documents.uploadDialog.fileSelected", { name: uploadFile.name })
                : t("inspectionDetails.documents.uploadDialog.chooseFile")}
              <input
                type="file"
                hidden
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setUploadFile(f);
                }}
              />
            </Button>

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
            onClick={() => {
              if (!uploadFile) return;
              uploadMutation.mutate({ description: uploadDescription, file: uploadFile });
            }}
            disabled={uploadMutation.isPending || uploadDescription.trim() === "" || !uploadFile}
          >
            {t("inspectionDetails.documents.uploadDialog.upload")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
