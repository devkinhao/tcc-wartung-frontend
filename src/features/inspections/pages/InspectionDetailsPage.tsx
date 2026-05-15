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
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { getInspectionDetail, updateInspection } from "../api/inspections.detail.api";
import {
  deleteInspectionDocument,
  downloadInspectionDocument,
  listInspectionDocuments,
  uploadInspectionDocument,
} from "../api/inspection.documents.api";
import type {
  InspectionDetailResponseDTO,
  InspectionUpdateRequestDTO,
} from "../types/inspectionDetail";
import { qk } from "@/api/keys";
import { useNotify } from "@/hooks/useNotify";
import { formatDateBR, formatDateTimeBR, formatFileSizeKB } from "@/utils/date";

function toISODate(value?: string | null) {
  if (!value) return "";
  return value.split("T")[0];
}

export default function InspectionDetailsPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const inspectionId = Number(id);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const notify = useNotify();

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<InspectionDetailResponseDTO | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

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

  const handleSave = () => {
    if (!draft) return;

    const payload: InspectionUpdateRequestDTO = {
      inspectionDate: toISODate(draft.inspectionDate),
      expirationDate: toISODate(draft.expirationDate),
      notes: draft.notes ?? "",
    };

    mutation.mutate(payload);
  };

  const statusLabel = view.isActive
    ? t("inspectionDetails.status.active")
    : t("inspectionDetails.status.inactive");

  const title = view.serviceType?.name
    ? t("inspectionDetails.titleWithService", { service: view.serviceType.name })
    : t("inspectionDetails.title");

  const disableActions = mutation.isPending;

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

  return (
    <Box sx={{ maxWidth: 1200 }}>

      {/* Confirm delete dialog — substitui window.confirm */}
      <Dialog open={confirmDeleteId !== null} onClose={() => setConfirmDeleteId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>{t("inspectionDetails.documents.confirmDeleteTitle")}</DialogTitle>
        <DialogContent>
          <Typography>{t("inspectionDetails.documents.confirmDelete")}</Typography>
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

      <Paper elevation={1} sx={{ borderRadius: 2, mb: 2 }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                <IconButton
                  size="small"
                  onClick={() => navigate(-1)}
                  aria-label={t("inspectionDetails.actions.back")}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>

                <Typography fontWeight={700} color="text.primary" noWrap sx={{ minWidth: 0 }}>
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
                      to={`/customers/${view.customer.id}`}
                      underline="hover"
                      color="inherit"
                      sx={{ fontWeight: 600 }}
                    >
                      {view.customer.legalName} — {view.customer.cnpj}
                    </Link>
                  ) : (
                    t("inspectionDetails.summary.customerUnknown")
                  )}
                </Typography>
              </Stack>
            </Box>

            <Stack direction="row" spacing={1} alignItems="center">
              {editing ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<CloseIcon />}
                    onClick={() => {
                      setDraft(data ?? null);
                      setEditing(false);
                    }}
                    disabled={disableActions}
                  >
                    {t("common.actions.cancel")}
                  </Button>

                  <Button
                    variant="contained"
                    startIcon={mutation.isPending ? <CircularProgress size={16} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={disableActions}
                  >
                    {t("common.actions.save")}
                  </Button>
                </>
              ) : (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setEditing(true)}
                >
                  {t("common.actions.edit")}
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Paper>

      <Stack spacing={2}>
        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography fontWeight={700} sx={{ mb: 2 }}>
              {t("inspectionDetails.sections.general")}
            </Typography>

            <Stack spacing={2}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
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
                />
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
              />
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }} justifyContent="space-between" sx={{ mb: 2 }}>
              <Typography fontWeight={700}>{t("inspectionDetails.sections.documents")}</Typography>

              <Button
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => setUploadOpen(true)}
              >
                {t("inspectionDetails.documents.actions.upload")}
              </Button>
            </Stack>

            <Box
              sx={{
                border: (t) => `1px solid ${t.palette.divider}`,
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <Table size="small">
                <TableHead sx={{ bgcolor: "background.default" }}>
                  <TableRow>
                    <TableCell><b>{t("inspectionDetails.documents.table.description")}</b></TableCell>
                    <TableCell><b>{t("inspectionDetails.documents.table.name")}</b></TableCell>
                    <TableCell><b>{t("inspectionDetails.documents.table.size")}</b></TableCell>
                    <TableCell><b>{t("inspectionDetails.documents.table.uploadDate")}</b></TableCell>
                    <TableCell align="center"><b>{t("inspectionDetails.documents.table.actions")}</b></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {docsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ py: 2, color: "text.secondary" }}>
                        {t("inspectionDetails.documents.loading")}
                      </TableCell>
                    </TableRow>
                  ) : documents?.length ? (
                    documents.map((d) => (
                      <TableRow key={d.id} hover>
                        <TableCell>{d.description || "—"}</TableCell>
                        <TableCell>{d.name}</TableCell>
                        <TableCell>{formatFileSizeKB(d.size)}</TableCell>
                        <TableCell>{formatDateTimeBR(d.uploadDate)}</TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                            <IconButton
                              size="small"
                              aria-label={t("inspectionDetails.documents.actions.download")}
                              onClick={() => handleDownload(d.id, d.name)}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label={t("inspectionDetails.documents.actions.delete")}
                              onClick={() => handleDeleteDoc(d.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ py: 2, color: "text.secondary" }}>
                        {t("inspectionDetails.documents.empty")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 2 }}>
          <CardContent>
            <Typography fontWeight={700} sx={{ mb: 2 }}>
              {t("inspectionDetails.sections.audit")}
            </Typography>

            <Divider sx={{ mb: 2 }} />

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
              if (!uploadFile) {
                notify.warning("notify.error.uploadFailed");
                return;
              }
              uploadMutation.mutate({ description: uploadDescription, file: uploadFile });
            }}
            disabled={uploadMutation.isPending}
          >
            {t("inspectionDetails.documents.uploadDialog.upload")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
