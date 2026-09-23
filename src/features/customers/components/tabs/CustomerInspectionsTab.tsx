import { useState } from "react";
import {
  Badge,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DescriptionIcon from "@mui/icons-material/Description";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import BlockIcon from "@mui/icons-material/Block";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useTranslation } from "react-i18next";
import { formatDateBR } from "@/utils/date";
import { useAlertDays } from "@/features/configurations/hooks/useAlertDays";
import { AddInspectionModal } from "@/features/inspections/components/AddInspectionModal";
import { InspectionDetailModal } from "@/features/inspections/components/InspectionDetailModal";
import { useInspectionRowActions } from "@/features/inspections/hooks/useInspectionRowActions";
import { deactivationReasonKey } from "@/features/inspections/deactivationReason";
import { ExpirationChip } from "@/components/ExpirationChip";
import { DataTableContainer } from "@/components/DataTableContainer";
import type { InspectionSummaryResponseDTO } from "../../types/customerDetail";

// Observações não tem mais coluna própria — some dentro do resumo da coluna
// "Serviço" junto com os campos de equipamento, que são mutuamente exclusivos
// por categoria de serviço (só os preenchidos aparecem). Sem rótulos, valores
// concatenados direto, para caber numa linha só junto do nome do serviço.
function formatEquipmentSummary(i: InspectionSummaryResponseDTO): string | null {
  const parts = [
    i.manufacturer?.trim(),
    i.model?.trim(),
    i.capacity?.trim(),
    i.cylinderCount != null ? String(i.cylinderCount) : null,
    i.btu != null ? String(i.btu) : null,
    i.notes?.trim(),
  ].filter((part): part is string => !!part);

  return parts.length ? parts.join(" ") : null;
}

type Props = {
  customerId: number;
  customerLegalName: string;
  customerCnpj: string;
  inspections?: InspectionSummaryResponseDTO[];
  /** true quando a empresa está desativada (LOG_ATIVO = false) — bloqueia novas inspeções e renovações */
  readOnly?: boolean;
};

export function CustomerInspectionsTab({ customerId, customerLegalName, customerCnpj, inspections, readOnly = false }: Props) {
  const { t } = useTranslation();
  const alertDays = useAlertDays();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [menuRow, setMenuRow] = useState<InspectionSummaryResponseDTO | null>(null);

  const {
    openRenew: setRenewTarget,
    openDeactivate: setDeactivateTarget,
    openDelete: setDeleteTarget,
    actionModals,
  } = useInspectionRowActions({ onOpenDetail: setDetailId });

  function openRowMenu(e: React.MouseEvent<HTMLElement>, row: InspectionSummaryResponseDTO) {
    setMenuAnchor(e.currentTarget);
    setMenuRow(row);
  }

  function closeRowMenu() {
    setMenuAnchor(null);
    setMenuRow(null);
  }

  function renewFromRow(row: InspectionSummaryResponseDTO) {
    setRenewTarget({
      id: row.id,
      inspectionDate: row.inspectionDate,
      expirationDate: row.expirationDate,
      customerLegalName,
      serviceTypeName: row.serviceType?.name ?? "—",
      customerId,
    });
  }

  function deactivateFromRow(row: InspectionSummaryResponseDTO) {
    setDeactivateTarget({
      id: row.id,
      serviceTypeName: row.serviceType?.name ?? "—",
      customerLegalName,
      customerId,
    });
  }

  function deleteFromRow(row: InspectionSummaryResponseDTO) {
    setDeleteTarget({
      id: row.id,
      serviceTypeName: row.serviceType?.name ?? "—",
      customerLegalName,
      customerId,
    });
  }

  return (
    <Paper elevation={1} sx={{ borderRadius: 2, p: 2 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="subtitle2">
          {t("customerDetails.inspections.title")}
        </Typography>

        {!readOnly && (
          <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setIsAddOpen(true)}>
            {t("inspections.actions.addInspection")}
          </Button>
        )}
      </Stack>

      <AddInspectionModal
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        lockedCustomer={{ id: customerId, legalName: customerLegalName, cnpj: customerCnpj }}
        onOpenDetail={setDetailId}
      />

      <DataTableContainer stickyHeader={false}>
          <TableHead sx={{ bgcolor: "background.default" }}>
            <TableRow>
              <TableCell align="center" sx={{ width: "15%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("customerDetails.inspections.table.inspectionDate")}</b></TableCell>
              <TableCell sx={{ width: "53%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("customerDetails.inspections.table.service")}</b></TableCell>
              <TableCell align="center" sx={{ width: "13%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("customerDetails.inspections.table.expiration")}</b></TableCell>
              <TableCell align="center" sx={{ width: "12%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("customerDetails.inspections.table.documents")}</b></TableCell>
              <TableCell align="center" sx={{ width: "11%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}><b>{t("customerDetails.inspections.table.status")}</b></TableCell>
              <TableCell align="center" sx={{ width: "6%" }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {inspections?.length ? (
              inspections.map((i) => {
                const equipmentSummary = formatEquipmentSummary(i);
                const serviceLine = i.serviceType?.name
                  ? equipmentSummary
                    ? `${i.serviceType.name} - ${equipmentSummary}`
                    : i.serviceType.name
                  : "—";
                return (
                <TableRow
                  key={i.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => setDetailId(i.id)}
                >
                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>{formatDateBR(i.inspectionDate)}</TableCell>

                  <TableCell sx={{ overflow: "hidden" }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="nowrap">
                      <Typography
                        variant="body2"
                        title={serviceLine}
                        sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                      >
                        {serviceLine}
                      </Typography>
                      {i.isRenewed && (
                        <Chip
                          size="small"
                          label={t("customerDetails.inspections.status.renewed")}
                          color="info"
                          sx={{ flexShrink: 0 }}
                        />
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <ExpirationChip date={i.expirationDate} alertDays={alertDays} active={i.isActive} />
                  </TableCell>

                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    {i.documents?.length ? (
                      <Tooltip title={t("customerDetails.inspections.table.documents")}>
                        <Badge badgeContent={i.documents.length} color="primary">
                          <DescriptionIcon fontSize="small" />
                        </Badge>
                      </Tooltip>
                    ) : "—"}
                  </TableCell>

                  <TableCell align="center">
                    {!i.isActive && i.deactivationReason ? (
                      <Chip
                        size="small"
                        color="warning"
                        variant="outlined"
                        label={t("inspections.deactivate.archivedChip")}
                        title={t(deactivationReasonKey(i.deactivationReason))}
                      />
                    ) : (
                      <Chip
                        size="small"
                        label={i.isActive ? t("customerDetails.inspections.status.active") : t("customerDetails.inspections.status.inactive")}
                        color={i.isActive ? "success" : "default"}
                        variant={i.isActive ? "filled" : "outlined"}
                      />
                    )}
                  </TableCell>

                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title={t("common.actions.more")}>
                      <IconButton
                        size="small"
                        aria-label={t("customerDetails.inspections.actions.rowMenu")}
                        onClick={(e) => openRowMenu(e, i)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 2, color: "text.secondary" }}>
                  {t("customerDetails.inspections.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
      </DataTableContainer>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeRowMenu}>
        <MenuItem
          disabled={menuRow?.isRenewed || readOnly}
          onClick={() => {
            if (menuRow) renewFromRow(menuRow);
            closeRowMenu();
          }}
        >
          <AutorenewIcon fontSize="small" sx={{ mr: 1 }} />
          {t("inspections.renewModal.actions.confirm")}
        </MenuItem>
        <MenuItem
          disabled={!menuRow?.isActive}
          onClick={() => {
            if (menuRow) deactivateFromRow(menuRow);
            closeRowMenu();
          }}
        >
          <BlockIcon fontSize="small" sx={{ mr: 1 }} />
          {t("inspections.deactivate.action")}
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (menuRow) deleteFromRow(menuRow);
            closeRowMenu();
          }}
        >
          <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
          {t("inspectionDetails.actions.delete")}
        </MenuItem>
      </Menu>

      {actionModals}

      <InspectionDetailModal
        inspectionId={detailId}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        customerId={customerId}
      />
    </Paper>
  );
}
