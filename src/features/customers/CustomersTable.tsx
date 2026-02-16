import { useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";

import { Customer } from "./types";
import { abvtexLabel } from "./constants";
import { CustomersRowMenu } from "./CustomersRowMenu";
import { AbvtexChip } from "./components/AbvtexChip";

type Props = {
  customers: Customer[];
  loading: boolean;
  sortBy: keyof Customer | null;
  sortDir: "asc" | "desc";
  onSort: (c: keyof Customer) => void;
  onRowClick: (id: number) => void;
};

function formatDateBR(iso?: string | null) {
  if (!iso) return "—";
  const parts = iso.split("-");
  if (parts.length !== 3) return iso;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function headerCell(
  label: string,
  column: keyof Customer,
  sortBy: keyof Customer | null,
  sortDir: "asc" | "desc",
  onSort: (c: keyof Customer) => void,
  align: "left" | "center" | "right" = "left"
) {
  const active = sortBy === column;
  return (
    <TableCell align={align} onClick={() => onSort(column)} sx={{ cursor: "pointer", userSelect: "none" }}>
      <TableSortLabel active={active} direction={active ? sortDir : "asc"}>
        <b>{label}</b>
      </TableSortLabel>
    </TableCell>
  );
}

export function CustomersTable({
  customers,
  loading,
  sortBy,
  sortDir,
  onSort,
  onRowClick,
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  return (
    <Box
      sx={{
        border: (t) => `1px solid ${t.palette.divider}`,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      <Table size="small">
        <TableHead sx={{ bgcolor: "background.default" }}>
          <TableRow>
            {headerCell("Razão social", "legalName", sortBy, sortDir, onSort, "left")}
            {headerCell("CNPJ", "cnpj", sortBy, sortDir, onSort, "left")}
            {headerCell("Cidade", "city", sortBy, sortDir, onSort, "left")}

            <TableCell align="center"><b>Cliente?</b></TableCell>
            <TableCell align="center"><b>ABVTEX</b></TableCell>

            {headerCell("Inspeções Ativas", "activeInspections", sortBy, sortDir, onSort, "center")}
            {headerCell("Próximo Vencimento", "nextExpirationDate", sortBy, sortDir, onSort, "center")}

            <TableCell align="right" />
          </TableRow>
        </TableHead>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.5 }}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Carregando clientes...
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Nenhum cliente encontrado
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((c) => (
              <TableRow
                key={c.id}
                hover
                sx={{ cursor: "pointer" }}
                onClick={() => onRowClick(c.id)}
              >
                <TableCell>{c.legalName}</TableCell>
                <TableCell>{c.cnpj}</TableCell>
                <TableCell>{c.city}</TableCell>

                <TableCell align="center">
                  <Chip
                    size="small"
                    label={c.isCustomer ? "Sim" : "Não"}
                    color={c.isCustomer ? "success" : "default"}
                    variant={c.isCustomer ? "filled" : "outlined"}
                  />
                </TableCell>

                <TableCell align="center">
                  <AbvtexChip seal={c.abvtexSeal} />
                </TableCell>

                <TableCell align="center">{c.activeInspections}</TableCell>
                <TableCell align="center">{formatDateBR(c.nextExpirationDate)}</TableCell>

                <TableCell
                  align="right"
                  onClick={(e) => e.stopPropagation()}
                  sx={{ width: 48 }}
                >
                  <CustomersRowMenu
                    open={openMenuId === c.id}
                    onToggle={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                    onClose={() => setOpenMenuId(null)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Box>
  );
}