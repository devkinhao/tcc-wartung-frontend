import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Button,
  Typography,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useTranslation } from "react-i18next";

import { getCustomerDetail } from "../api/customers.detail.api";
import type { InspectionSummaryResponseDTO } from "../types/customerDetail";
import { formatDateBR } from "@/utils/date";

type Props = {
  open: boolean;
  customerId: number;
  onClose: () => void;
};

export function InspectionsQuickViewDialog({ open, customerId, onClose }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inspections, setInspections] = useState<InspectionSummaryResponseDTO[]>([]);

  const sortedInspections = useMemo(() => {
    // closest expiration first (nulls last)
    return [...inspections].sort((a, b) => {
      const ad = a.expirationDate ? new Date(a.expirationDate).getTime() : Number.POSITIVE_INFINITY;
      const bd = b.expirationDate ? new Date(b.expirationDate).getTime() : Number.POSITIVE_INFINITY;
      return ad - bd;
    });
  }, [inspections]);

  useEffect(() => {
    if (!open) return;

    let mounted = true;
    setLoading(true);
    setError(null);

    getCustomerDetail(customerId)
      .then((data) => {
        if (!mounted) return;
        setInspections(data.inspections ?? []);
      })
      .catch(() => {
        if (!mounted) return;
        setError(t("customers.quickView.error"));
        setInspections([]);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open, customerId, t]);

  const handleRetry = () => {
    // Trigger the effect again by toggling open state isn't possible here;
    // we just re-run the same fetch inline.
    setLoading(true);
    setError(null);
    getCustomerDetail(customerId)
      .then((data) => {
        setInspections(data.inspections ?? []);
      })
      .catch(() => {
        setError(t("customers.quickView.error"));
        setInspections([]);
      })
      .finally(() => setLoading(false));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{t("customers.quickView.title")}</DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={handleRetry}>
                {t("common.actions.retry")}
              </Button>
            }
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ py: 5, display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              {t("customers.quickView.loading")}
            </Typography>
          </Box>
        ) : sortedInspections.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            {t("customers.quickView.empty")}
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <b>{t("customers.quickView.table.inspectionDate")}</b>
                </TableCell>
                <TableCell>
                  <b>{t("customers.quickView.table.service")}</b>
                </TableCell>
                <TableCell>
                  <b>{t("customers.quickView.table.notes")}</b>
                </TableCell>
                <TableCell>
                  <b>{t("customers.quickView.table.expiration")}</b>
                </TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedInspections.map((i) => (
                <TableRow key={i.id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateBR(i.inspectionDate)}</TableCell>
                  <TableCell>{i.serviceType?.name ?? "—"}</TableCell>
                  <TableCell sx={{ maxWidth: 420 }}>
                    <Typography variant="body2" noWrap title={i.notes ?? ""}>
                      {i.notes || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateBR(i.expirationDate)}</TableCell>
                  <TableCell align="right">
                    <Tooltip title={t("customers.quickView.actions.openInspection") as string}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          onClose();
                          navigate(`/inspections/${i.id}`);
                        }}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>{t("common.actions.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}
