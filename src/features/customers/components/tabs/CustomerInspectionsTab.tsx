import { useState } from "react";
import {
  Badge,
  Box,
  Button,
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
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import OpenInNewIcon    from "@mui/icons-material/OpenInNew";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { formatDateBR } from "@/utils/date";
import { AddInspectionModal } from "@/features/inspections/components/AddInspectionModal";
import type { InspectionSummaryResponseDTO } from "../../types/customerDetail";

type Props = {
  customerId: number;
  customerLegalName: string;
  customerCnpj: string;
  inspections?: InspectionSummaryResponseDTO[];
};

export function CustomerInspectionsTab({ customerId, customerLegalName, customerCnpj, inspections }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <Paper elevation={1} sx={{ borderRadius: 2, p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography fontWeight={700}>
          {t("customerDetails.inspections.title")}
        </Typography>

        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setIsAddOpen(true)}>
          {t("inspections.actions.addInspection")}
        </Button>
      </Stack>

      <AddInspectionModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        lockedCustomer={{ id: customerId, legalName: customerLegalName, cnpj: customerCnpj }}
      />

      <Box sx={{ border: (th) => `1px solid ${th.palette.divider}`, borderRadius: 2, overflow: "hidden" }}>
        <Table size="small" sx={{ tableLayout: "fixed" }}>
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              <TableCell sx={{ width: "16%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("customerDetails.inspections.table.inspectionDate")}</b></TableCell>
              <TableCell sx={{ width: "16%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("customerDetails.inspections.table.service")}</b></TableCell>
              <TableCell sx={{ width: "39%" }}><b>{t("customerDetails.inspections.table.notes")}</b></TableCell>
              <TableCell sx={{ width: "12%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("customerDetails.inspections.table.expiration")}</b></TableCell>
              <TableCell align="center" sx={{ width: "11%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("customerDetails.inspections.table.documents")}</b></TableCell>
              <TableCell align="center" sx={{ width: "6%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("customerDetails.inspections.table.open")}</b></TableCell>
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
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateBR(i.inspectionDate)}</TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="body2" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {i.serviceType?.name ?? "—"}
                      </Typography>
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

                  <TableCell sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={i.notes ?? ""}>
                    {i.notes || "—"}
                  </TableCell>

                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateBR(i.expirationDate)}</TableCell>

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
