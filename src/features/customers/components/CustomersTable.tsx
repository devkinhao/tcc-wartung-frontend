import { ExpirationChip } from "@/components/table/ExpirationChip";
import { Table, type TableColumn } from "@/components/table/Table";
import { setTitleIfTruncated } from "@/components/table/TableTruncatedCell";
import { Tooltip } from "@/components/Tooltip";
import { useAlertDays } from "@/features/configurations/hooks/useAlertDays";
import { saveScrollPosition } from "@/hooks/useScrollRestoration";
import { paths } from "@/routes/paths";
import { ELLIPSIS_SX } from "@/styles/ellipsis";
import { Box, Chip } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Customer } from "../types/customersList";

type CustomersTableProps = {
  customers: Customer[];
  loading: boolean;
  sortBy: keyof Customer | null;
  sortDir: "asc" | "desc";
  onSort: (c: keyof Customer) => void;
};

/** Tabela de empresas, com ordenação por coluna e acesso aos detalhes ao clicar na linha. */
export function CustomersTable({
  customers,
  loading,
  sortBy,
  sortDir,
  onSort,
}: CustomersTableProps) {
  /** Hooks. */
  const { t } = useTranslation();
  const navigate = useNavigate();
  const alertDays = useAlertDays();

  /** Abre os detalhes da empresa, guardando a rolagem da lista para restaurá-la ao voltar. */
  const openDetails = (customer: Customer) => {
    saveScrollPosition("customers-list.scrollY");
    navigate(paths.customerDetails(customer.id));
  };

  /** Colunas da tabela de empresas. */
  const columns: TableColumn<Customer, keyof Customer>[] = [
    {
      key: "legalName",
      header: t("customers.table.legalName"),
      width: "30%",
      sortable: true,
      render: (customer) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            component="span"
            sx={ELLIPSIS_SX}
            onMouseEnter={setTitleIfTruncated}
          >
            {customer.legalName}
          </Box>
          {/** Empresa desativada exibe o chip de inativa ao lado do nome. */}
          {!customer.isActive && (
            <Tooltip
              title={t("customers.table.tooltip.inactive")}
              placement="right"
            >
              <Chip
                size="small"
                label={t("customers.table.inactive")}
                sx={{ color: "text.disabled" }}
              />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      key: "cnpj",
      header: t("customers.table.cnpj"),
      width: "18%",
      sortable: true,
      /** A coluna acompanha a largura do CNPJ. */
      nowrap: true,
      render: (customer) => customer.cnpj,
    },
    {
      key: "city",
      header: t("customers.table.city"),
      width: "18%",
      sortable: true,
      render: (customer) => customer.city,
    },
    {
      key: "isCustomer",
      header: t("customers.table.isCustomer"),
      width: "11%",
      align: "center",
      sortable: true,
      render: (customer) => (
        <Tooltip
          title={
            customer.isCustomer
              ? t("customers.table.tooltip.customer")
              : t("customers.table.tooltip.nonCustomer")
          }
          placement="left"
        >
          <Chip
            size="small"
            label={customer.isCustomer ? t("common.yes") : t("common.no")}
            /** Empresa desativada exibe o chip sem cor, como o restante da linha. */
            color={
              customer.isCustomer && customer.isActive ? "success" : "default"
            }
            sx={!customer.isActive ? { color: "text.disabled" } : undefined}
          />
        </Tooltip>
      ),
    },
    {
      key: "activeInspections",
      header: t("customers.table.activeInspections"),
      width: "14%",
      align: "center",
      sortable: true,
      render: (customer) => customer.activeInspections,
    },
    {
      key: "nextExpirationDate",
      header: t("customers.table.nextExpiration"),
      width: "21%",
      align: "center",
      sortable: true,
      render: (customer) => (
        <ExpirationChip
          date={customer.nextExpirationDate}
          alertDays={alertDays}
        />
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      rows={customers}
      getRowKey={(customer) => customer.id}
      loading={loading}
      loadingLabel={t("customers.table.loading")}
      emptyLabel={t("customers.table.empty")}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={onSort}
      onRowClick={openDetails}
      getRowTitle={() => t("customers.table.tooltip.openDetails")}
      isRowDisabled={(customer) => !customer.isActive}
    />
  );
}
