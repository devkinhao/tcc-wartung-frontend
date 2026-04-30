import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";

import { useCustomers } from "../hooks/useCustomers";
import { CustomersFilters } from "../CustomersFilters";
import { CustomersTable } from "../CustomersTable";
import { Pagination } from "../../../components/Pagination";
import { useCities } from "../hooks/useCities";
import { AddCompanyModal } from "../AddCompanyModal";

export default function CustomersListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const cities = useCities();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { customers, loading, total, filters, setFilter, hasActiveFilters, clearFilters, pagination, sort } =
    useCustomers();

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2, bgcolor: "background.paper" }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600} color="primary.main">
            {t("customers.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("customers.description")}
          </Typography>
        </Box>

        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsAddOpen(true)}>
          {t("customers.actions.addCompany")}
        </Button>
      </Stack>

      <AddCompanyModal open={isAddOpen} onClose={() => setIsAddOpen(false)} cities={cities} />

      <CustomersFilters
        values={filters}
        onChange={setFilter}
        cities={cities}
        hasActiveFilters={hasActiveFilters}
        onClear={clearFilters}
      />

      <CustomersTable
        customers={customers}
        loading={loading}
        sortBy={sort.by}
        sortDir={sort.dir}
        onSort={sort.handle}
        onRowClick={(id) => navigate(`/customers/${id}`)}
      />

      <Box sx={{ mt: 1 }}>
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={total}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      </Box>
    </Paper>
  );
}
