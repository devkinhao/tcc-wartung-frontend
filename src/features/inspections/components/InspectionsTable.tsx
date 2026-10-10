import { ExpirationChip } from "@/components/table/ExpirationChip";
import { Table, type TableColumn } from "@/components/table/Table";
import { Tooltip } from "@/components/Tooltip";
import { useAlertDays } from "@/features/configurations/hooks/useAlertDays";
import { formatDateBR } from "@/utils/date";
import { Autorenew, Block } from "@mui/icons-material";
import { Box, Chip, IconButton, Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import type {
  InspectionListItem,
  InspectionSortableColumn,
} from "../api/inspections.list.api";
import { deactivationReasonKey } from "../deactivationReason";
import { equipmentSummary } from "../utils/equipmentSummary";

/** Colunas da tabela, incluindo a de ações, que não é ordenável. */
type InspectionColumnKey = InspectionSortableColumn | "actions";

type InspectionsTableProps = {
  items: InspectionListItem[];
  isLoading: boolean;
  hasActiveFilters: boolean;
  sortBy: InspectionSortableColumn | null;
  sortDir: "asc" | "desc";
  onSort: (column: InspectionSortableColumn) => void;
  onOpenDetail: (id: number) => void;
  onRenew: (item: InspectionListItem) => void;
  onDeactivate: (item: InspectionListItem) => void;
};

/** Tabela da listagem de inspeções, com ordenação, estados de carregamento e vazio. */
export function InspectionsTable({
  items,
  isLoading,
  hasActiveFilters,
  sortBy,
  sortDir,
  onSort,
  onOpenDetail,
  onRenew,
  onDeactivate,
}: InspectionsTableProps) {
  /** Hooks. */
  const { t } = useTranslation();
  const alertDays = useAlertDays();

  /** Botões de renovar e desativar da linha, exibidos conforme a situação da inspeção. */
  const renderActions = (item: InspectionListItem) => (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="center"
      /** Evita que o clique nas ações abra o detalhe da linha. */
      onClick={(e) => e.stopPropagation()}
    >
      {/** Só inspeção ativa e ainda não renovada pode ser renovada. */}
      {item.isActive && !item.isRenewed ? (
        <Tooltip title={t("inspections.actions.tooltip.renewInspection")}>
          <IconButton
            size="small"
            aria-label={t("inspections.actions.tooltip.renewInspection")}
            onClick={() => onRenew(item)}
            sx={{ color: "success.main" }}
          >
            <Autorenew fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : null}
      {item.isActive ? (
        <Tooltip title={t("inspections.actions.tooltip.deactivateInspection")}>
          <IconButton
            size="small"
            aria-label={t("inspections.actions.tooltip.deactivateInspection")}
            onClick={() => onDeactivate(item)}
          >
            <Block fontSize="small" />
          </IconButton>
        </Tooltip>
      ) : null}
    </Stack>
  );

  /** Colunas da tabela de inspeções. */
  const columns: TableColumn<InspectionListItem, InspectionColumnKey>[] = [
    {
      key: "serviceType.name",
      header: t("inspections.table.service"),
      width: "33%",
      sortable: true,
      render: (item) => {
        /** Equipamento e observações da inspeção. */
        const description = equipmentSummary(t, item.serviceCategory, item);

        return (
          <>
            {item.serviceTypeName}
            {description ? (
              <Box
                component="span"
                /** Linha desativada mantém o tom esmaecido da própria linha. */
                sx={{ color: item.isActive ? "text.secondary" : "inherit" }}
              >
                {` · ${description}`}
              </Box>
            ) : null}
          </>
        );
      },
    },
    {
      key: "customer.legalName",
      header: t("inspections.table.customer"),
      width: "25%",
      sortable: true,
      render: (item) => item.customerLegalName,
    },
    {
      key: "inspectionDate",
      header: t("inspections.table.inspectionDate"),
      width: "13%",
      align: "center",
      sortable: true,
      nowrap: true,
      render: (item) => formatDateBR(item.inspectionDate),
    },
    {
      key: "expirationDate",
      header: t("inspections.table.expirationDate"),
      width: "16%",
      align: "center",
      sortable: true,
      nowrap: true,
      /** Quando ativa exibe o vencimento, se não, exibe se foi renovada/desativada. */
      render: (item) =>
        item.isActive ? (
          <ExpirationChip date={item.expirationDate} alertDays={alertDays} />
        ) : item.isRenewed ? (
          <Tooltip
            title={t("inspections.table.tooltip.renewedChip")}
            placement="left"
          >
            <Chip
              size="small"
              label={t("inspections.table.renewedChip")}
              sx={{ color: "text.disabled" }}
            />
          </Tooltip>
        ) : (
          <Tooltip
            title={
              item.deactivationReason
                ? t("inspections.table.tooltip.deactivatedChipWithReason", {
                    reason: t(
                      deactivationReasonKey(item.deactivationReason),
                    ).toLowerCase(),
                  })
                : t("inspections.table.tooltip.deactivatedChip")
            }
            placement="left"
          >
            <Chip
              size="small"
              label={t("inspections.table.deactivatedChip")}
              sx={{ color: "text.disabled" }}
            />
          </Tooltip>
        ),
    },
    {
      key: "actions",
      header: t("inspections.table.actions"),
      width: "13%",
      align: "center",
      nowrap: true,
      /** Remove o title da linha apenas quando há botões de ação. */
      hideRowTitle: (item) => item.isActive,
      render: renderActions,
    },
  ];

  return (
    <Table
      columns={columns}
      rows={items}
      getRowKey={(item) => item.id}
      loading={isLoading}
      loadingLabel={t("inspections.table.loading")}
      emptyLabel={
        hasActiveFilters
          ? t("inspections.table.emptyFiltered")
          : t("inspections.table.empty")
      }
      sortBy={sortBy}
      sortDir={sortDir}
      /** A coluna de ações não é ordenável. */
      onSort={(column) => {
        if (column !== "actions") onSort(column);
      }}
      onRowClick={(item) => onOpenDetail(item.id)}
      getRowTitle={() => t("inspections.table.tooltip.openDetails")}
      /** Inspeção desativada ou renovada fica com fundo e texto esmaecidos. */
      isRowDisabled={(item) => !item.isActive}
    />
  );
}
