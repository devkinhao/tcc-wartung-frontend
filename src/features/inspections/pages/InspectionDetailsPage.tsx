import { useMemo, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
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

function formatDateBR(iso?: string | null) {
  if (!iso) return "—";
  const date = iso.split("T")[0];
  const [y, m, d] = date.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

function formatDateTimeBR(iso?: string | null) {
  if (!iso) return "—";
  const [date, time] = iso.split("T");
  return `${formatDateBR(date)}${time ? ` ${time.slice(0, 5)}` : ""}`;
}

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

  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<InspectionDetailResponseDTO | null>(null);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["inspection-detail", inspectionId],
    queryFn: () => getInspectionDetail(inspectionId),
    enabled: Number.isFinite(inspectionId) && inspectionId > 0,
  });

  const docsQuery = useQuery({
    queryKey: ["inspection-documents", inspectionId],
    queryFn: () => listInspectionDocuments(inspectionId),
    enabled: Number.isFinite(inspectionId) && inspectionId > 0,
  });

  useMemo(() => {
    if (data && !draft) setDraft(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const mutation = useMutation({
    mutationFn: (payload: InspectionUpdateRequestDTO) => updateInspection(inspectionId, payload),
    onSuccess: (updated) => {
      qc.setQueryData(["inspection-detail", inspectionId], updated);
      setDraft(updated);
      setEditing(false);
    },
    onError: () => setError(t("inspectionDetails.errors.update")),
  });

  const uploadMutation = useMutation({
    mutationFn: (params: { description: string; file: File }) =>
      uploadInspectionDocument(inspectionId, params),
    onSuccess: async () => {
      setUploadOpen(false);
      setUploadDescription("");
      setUploadFile(null);
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["inspection-documents", inspectionId] }),
        qc.invalidateQueries({ queryKey: ["inspection-detail", inspectionId] }),
      ]);
    },
    onError: () => setError(t("inspectionDetails.errors.uploadDoc")),
  });

  const deleteMutation = useMutation({
    mutationFn: (docId: number) => deleteInspectionDocument(inspectionId, docId),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ["inspection-documents", inspectionId] }),
        qc.invalidateQueries({ queryKey: ["inspection-detail", inspectionId] }),
      ]);
    },
    onError: () => setError(t("inspectionDetails.errors.deleteDoc")),
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
      setError(t("inspectionDetails.errors.downloadDoc"));
    }
  };

  const handleDeleteDoc = (docId: number) => {
    const ok = window.confirm(t("inspectionDetails.documents.confirmDelete"));
    if (!ok) return;
    deleteMutation.mutate(docId);
  };

  return (
    <Box sx={{ maxWidth: 1200 }}>
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      ) : null}

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
              <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
                <Box component="thead" sx={{ bgcolor: "background.default" }}>
                  <Box component="tr">
                    {[
                      t("inspectionDetails.documents.table.description"),
                      t("inspectionDetails.documents.table.name"),
                      t("inspectionDetails.documents.table.size"),
                      t("inspectionDetails.documents.table.uploadDate"),
                      t("inspectionDetails.documents.table.actions"),
                    ].map((h) => (
                      <Box
                        key={h}
                        component="th"
                        sx={{
                          textAlign: "left",
                          fontWeight: 700,
                          fontSize: 13,
                          px: 2,
                          py: 1,
                          borderBottom: (t) => `1px solid ${t.palette.divider}`,
                        }}
                      >
                        {h}
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box component="tbody">
                  {docsQuery.isLoading ? (
                    <Box component="tr">
                      <Box component="td" colSpan={5} sx={{ px: 2, py: 2, color: "text.secondary" }}>
                        {t("inspectionDetails.documents.loading")}
                      </Box>
                    </Box>
                  ) : documents?.length ? (
                    documents.map((d) => (
                      <Box key={d.id} component="tr" sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                        <Box
                          component="td"
                          sx={{ px: 2, py: 1, borderBottom: (t) => `1px solid ${t.palette.divider}` }}
                        >
                          {d.description || "—"}
                        </Box>

                        <Box
                          component="td"
                          sx={{ px: 2, py: 1, borderBottom: (t) => `1px solid ${t.palette.divider}` }}
                        >
                          {d.name}
                        </Box>

                        <Box
                          component="td"
                          sx={{ px: 2, py: 1, borderBottom: (t) => `1px solid ${t.palette.divider}` }}
                        >
                          {typeof d.size === "number" ? `${Math.ceil(d.size / 1024)} KB` : "—"}
                        </Box>

                        <Box
                          component="td"
                          sx={{ px: 2, py: 1, borderBottom: (t) => `1px solid ${t.palette.divider}` }}
                        >
                          {formatDateTimeBR(d.uploadDate)}
                        </Box>

                        <Box
                          component="td"
                          sx={{
                            px: 2,
                            py: 1,
                            borderBottom: (t) => `1px solid ${t.palette.divider}`,
                          }}
                        >
                          <Stack direction="row" spacing={0.5} alignItems="center">
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
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box component="tr">
                      <Box component="td" colSpan={5} sx={{ px: 2, py: 2, color: "text.secondary" }}>
                        {t("inspectionDetails.documents.empty")}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
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
                setError(t("inspectionDetails.errors.uploadDocMissingFile"));
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
