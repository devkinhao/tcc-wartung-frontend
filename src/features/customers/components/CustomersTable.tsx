import { ExpirationChip } from "@/components/table/ExpirationChip";
import { TableContainer } from "@/components/table/TableContainer";
import { TableSortableHeader } from "@/components/table/TableSortableHeader";
import { Tooltip } from "@/components/Tooltip";
import { useAlertDays } from "@/features/configurations/hooks/useAlertDays";
import { saveScrollPosition } from "@/hooks/useScrollRestoration";
import { paths } from "@/routes/paths";
import { ELLIPSIS_SX } from "@/styles/ellipsis";
import {
  Box,
  Chip,
  CircularProgress,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { MouseEvent } from "react";
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

  /** Cabeçalho ordenável de uma coluna, com o estado de ordenação da tabela. */
  const sortableHeader = (
    column: keyof Customer,
    labelKey: string,
    width: string,
    align?: "center",
  ) => (
    <TableSortableHeader
      label={t(labelKey)}
      column={column}
      sortBy={sortBy}
      sortDir={sortDir}
      onSort={onSort}
      align={align}
      width={width}
    />
  );

  /** Abre os detalhes da empresa, guardando a rolagem da lista para restaurá-la ao voltar. */
  const openDetails = (id: number) => {
    saveScrollPosition("customers-list.scrollY");
    navigate(paths.customerDetails(id));
  };

  /** Mostra o texto completo como title somente quando ele está cortado por reticências. */
  const setTitleIfTruncated = (event: MouseEvent<HTMLElement>) => {
    const el = event.currentTarget;
    if (el.scrollWidth > el.clientWidth) {
      el.title = el.textContent ?? "";
    } else {
      el.removeAttribute("title");
    }
  };

  return (
    <TableContainer>
      <TableHead>
        <TableRow>
          {sortableHeader("legalName", "customers.table.legalName", "30%")}
          {sortableHeader("cnpj", "customers.table.cnpj", "18%")}
          {sortableHeader("city", "customers.table.city", "18%")}
          {sortableHeader(
            "isCustomer",
            "customers.table.isCustomer",
            "11%",
            "center",
          )}
          {sortableHeader(
            "activeInspections",
            "customers.table.activeInspections",
            "14%",
            "center",
          )}
          {sortableHeader(
            "nextExpirationDate",
            "customers.table.nextExpiration",
            "21%",
            "center",
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {loading ? (
          <TableRow>
            <TableCell colSpan={6} align="center">
              <Box
                sx={{ display: "inline-flex", alignItems: "center", gap: 1.5 }}
              >
                <Typography variant="body2" color="text.secondary">
                  <em>{t("customers.loading")}</em>
                </Typography>
                <CircularProgress size={18} />
              </Box>
            </TableCell>
          </TableRow>
        ) : customers.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} align="center">
              <Typography variant="body2" color="text.secondary">
                <em>{t("customers.empty")}</em>
              </Typography>
            </TableCell>
          </TableRow>
        ) : (
          customers.map((customer) => (
            <TableRow
              key={customer.id}
              hover
              /** Empresa desativada fica com fundo e texto esmaecidos. */
              sx={{
                cursor: "pointer",
                ...(!customer.isActive && {
                  bgcolor: "action.hover",
                  "& td": { color: "text.disabled" },
                }),
              }}
              title={t("customers.table.tooltip.openDetails")}
              onClick={() => openDetails(customer.id)}
            >
              <TableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    component="span"
                    sx={ELLIPSIS_SX}
                    onMouseEnter={setTitleIfTruncated}
                  >
                    {customer.legalName}
                  </Box>
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
              </TableCell>
              {/** `maxWidth: "none"` anula o limite das células do corpo, de modo que a coluna tenha no mínimo a largura do CNPJ. */}
              <TableCell
                sx={{ "&&": { maxWidth: "none" }, whiteSpace: "nowrap" }}
              >
                {customer.cnpj}
              </TableCell>
              <TableCell sx={ELLIPSIS_SX} onMouseEnter={setTitleIfTruncated}>
                {customer.city}
              </TableCell>
              <TableCell align="center">
                <Chip
                  size="small"
                  label={customer.isCustomer ? t("common.yes") : t("common.no")}
                  /** Empresa desativada exibe o chip sem cor, como o restante da linha. */
                  color={
                    customer.isCustomer && customer.isActive
                      ? "success"
                      : "default"
                  }
                  sx={
                    !customer.isActive ? { color: "text.disabled" } : undefined
                  }
                />
              </TableCell>
              <TableCell align="center">{customer.activeInspections}</TableCell>
              <TableCell align="center">
                <ExpirationChip
                  date={customer.nextExpirationDate}
                  alertDays={alertDays}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </TableContainer>
  );
}
