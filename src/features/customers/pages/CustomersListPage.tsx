import { useState } from "react";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";

import { useCustomers } from "../hooks/useCustomers";
import { CustomersFilters } from "../CustomersFilters";
import { CustomersTable } from "../CustomersTable";
import { Pagination } from "../../../components/Pagination";
import { useCities } from "../hooks/useCities";
import { AddCompanyModal } from "../AddCompanyModal";

export default function CustomersPage() {
  const { t } = useTranslation();

  const state = useCustomers();
  const cities = useCities();
  const [isAddOpen, setIsAddOpen] = useState(false);

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
        search={state.search}
        setSearch={state.setSearch}
        city={state.city}
        setCity={state.setCity}
        cities={cities}
        isCustomer={state.isCustomer}
        setIsCustomer={state.setIsCustomer}
        month={state.month}
        setMonth={state.setMonth}
        hasActiveFilters={state.hasActiveFilters}
        onClearFilters={state.clearFilters}
      />

      <CustomersTable
        customers={state.customers}
        loading={state.loading}
        sortBy={state.sortBy}
        sortDir={state.sortDir}
        onSort={state.handleSort}
        onRowClick={(id) => console.log("Abrir cliente", id)}
      />

      <Box sx={{ mt: 1 }}>
        <Pagination
          page={state.page}
          pageSize={state.pageSize}
          total={state.totalRecords}
          onPageChange={state.setPage}
          onPageSizeChange={state.setPageSize}
        />
      </Box>
    </Paper>
  );
}