import {
  Badge,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import OpenInNewIcon    from "@mui/icons-material/OpenInNew";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { formatDateBR } from "@/utils/date";
import type { InspectionSummaryResponseDTO } from "../../types/customerDetail";

type Props = {
  customerId: number;
  inspections?: InspectionSummaryResponseDTO[];
};

export function CustomerInspectionsTab({ customerId, inspections }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Paper elevation={1} sx={{ borderRadius: 2, p: 2 }}>
      <Typography fontWeight={700} sx={{ mb: 2 }}>
        {t("customerDetails.inspections.title")}
      </Typography>

      <Box sx={{ border: (th) => `1px solid ${th.palette.divider}`, borderRadius: 2, overflow: "hidden" }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              <TableCell><b>{t("customerDetails.inspections.table.inspectionDate")}</b></TableCell>
              <TableCell><b>{t("customerDetails.inspections.table.service")}</b></TableCell>
              <TableCell><b>{t("customerDetails.inspections.table.notes")}</b></TableCell>
              <TableCell><b>{t("customerDetails.inspections.table.expiration")}</b></TableCell>
              <TableCell align="center"><b>{t("customerDetails.inspections.table.documents")}</b></TableCell>
              <TableCell align="center"><b>{t("customerDetails.inspections.table.open")}</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {inspections?.length ? (
              inspections.map((i) => (
                <TableRow
                  key={i.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/customers/${customerId}/inspections/${i.id}`)}
                >
                  <TableCell>{formatDateBR(i.inspectionDate)}</TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="body2">{i.serviceType?.name ?? "—"}</Typography>
                      {!i.isActive && (
                        <Chip
                          size="small"
                          label={t("customerDetails.inspections.status.inactive")}
                          color="default"
                          variant="outlined"
                        />
                      )}
                      {i.isRenewed && (
                        <Chip
                          size="small"
                          label={t("customerDetails.inspections.status.renewed")}
                          color="info"
                        />
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell sx={{ color: "text.secondary" }}>{i.notes || "—"}</TableCell>

                  <TableCell>{formatDateBR(i.expirationDate)}</TableCell>

                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    {i.documents?.length ? (
                      <Badge badgeContent={i.documents.length} color="primary">
                        <DescriptionIcon fontSize="small" />
                      </Badge>
                    ) : "—"}
                  </TableCell>

                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={t("customerDetails.inspections.actions.open")}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/customers/${customerId}/inspections/${i.id}`)}
                        aria-label={t("customerDetails.inspections.actions.open")}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} sx={{ py: 2, color: "text.secondary" }}>
                  {t("customerDetails.inspections.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}
