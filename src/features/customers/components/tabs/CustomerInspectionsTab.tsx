import { useState } from "react";
import {
  Badge,
  Box,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { addDaysISODate, formatDateBR, todayISODate } from "@/utils/date";
import { useAlertDays } from "@/features/configurations/hooks/useAlertDays";
import { AddInspectionModal } from "@/features/inspections/components/AddInspectionModal";
import type { InspectionSummaryResponseDTO } from "../../types/customerDetail";

type ExpirationStatus = "expired" | "near" | "ok";

function getExpirationStatus(expirationDate: string, alertDays: number): ExpirationStatus {
  const exp           = expirationDate.split("T")[0];
  const today          = todayISODate();
  const alertThreshold = addDaysISODate(today, alertDays);

  if (exp < today)           return "expired";
  if (exp <= alertThreshold) return "near";
  return "ok";
}

type Props = {
  customerId: number;
  customerLegalName: string;
  customerCnpj: string;
  inspections?: InspectionSummaryResponseDTO[];
};

export function CustomerInspectionsTab({ customerId, customerLegalName, customerCnpj, inspections }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const alertDays = useAlertDays();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuRowId, setMenuRowId] = useState<number | null>(null);

  function closeRowMenu() {
    setMenuAnchor(null);
    setMenuRowId(null);
  }

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
              <TableCell align="center" sx={{ width: "15%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("customerDetails.inspections.table.inspectionDate")}</b></TableCell>
              <TableCell sx={{ width: "20%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("customerDetails.inspections.table.service")}</b></TableCell>
              <TableCell sx={{ width: "24%" }}><b>{t("customerDetails.inspections.table.notes")}</b></TableCell>
              <TableCell align="center" sx={{ width: "12%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("customerDetails.inspections.table.expiration")}</b></TableCell>
              <TableCell align="center" sx={{ width: "12%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("customerDetails.inspections.table.documents")}</b></TableCell>
              <TableCell align="center" sx={{ width: "11%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("customerDetails.inspections.table.status")}</b></TableCell>
              <TableCell align="center" sx={{ width: "6%" }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {inspections?.length ? (
              inspections.map((i) => {
                const expStatus = getExpirationStatus(i.expirationDate, alertDays);
                const chipColor = !i.isActive
                  ? null
                  : expStatus === "expired" ? "#c65b4a" : expStatus === "near" ? "#e0a83f" : null;

                return (
                <TableRow
                  key={i.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/customers/${customerId}/inspections/${i.id}`)}
                >
                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{formatDateBR(i.inspectionDate)}</TableCell>

                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="body2" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {i.serviceType?.name ?? "—"}
                      </Typography>
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

                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    {chipColor ? (
                      <Chip
                        size="small"
                        label={formatDateBR(i.expirationDate)}
                        sx={{
                          bgcolor: chipColor,
                          color: expStatus === "expired" ? "#fff" : "#000",
                          fontWeight: 600,
                        }}
                      />
                    ) : (
                      formatDateBR(i.expirationDate)
                    )}
                  </TableCell>

                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    {i.documents?.length ? (
                      <Badge badgeContent={i.documents.length} color="primary">
                        <DescriptionIcon fontSize="small" />
                      </Badge>
                    ) : "—"}
                  </TableCell>

                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={i.isActive ? t("customerDetails.inspections.status.active") : t("customerDetails.inspections.status.inactive")}
                      color={i.isActive ? "success" : "default"}
                      variant={i.isActive ? "filled" : "outlined"}
                    />
                  </TableCell>

                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      size="small"
                      aria-label={t("customerDetails.inspections.actions.open")}
                      onClick={(e) => {
                        setMenuAnchor(e.currentTarget);
                        setMenuRowId(i.id);
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 2, color: "text.secondary" }}>
                  {t("customerDetails.inspections.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeRowMenu}>
        <MenuItem onClick={closeRowMenu}>Teste</MenuItem>
      </Menu>
    </Paper>
  );
}
