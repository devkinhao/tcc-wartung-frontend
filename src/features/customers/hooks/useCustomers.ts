import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Customer } from "../types/customersList";
import { qk } from "@/api/keys";
import type { CustomerFilterValues } from "../CustomersFilters";

interface SpringPageResponse {
  content: Customer[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

async function fetchCustomers(params: {
  page: number;
  pageSize: number;
  sortBy: keyof Customer | null;
  sortDir: "asc" | "desc";
  filters: CustomerFilterValues;
}) {
  const { page, pageSize, sortBy, sortDir, filters } = params;
  const { data } = await api.get<SpringPageResponse>("/customers", {
    params: {
      page: page - 1, // Spring usa base 0
      size: pageSize,
      sort: sortBy ? `${sortBy},${sortDir}` : "nextExpirationDate,asc",
      search: filters.search || undefined,
      city: filters.city || undefined,
      isCustomer: filters.isCustomer === "" ? undefined : filters.isCustomer === "true",
      month: filters.month || undefined,
    },
  });
  return data;
}

const INITIAL_FILTERS: CustomerFilterValues = {
  search: "",
  city: "",
  isCustomer: "",
  month: "",
};

export function useCustomers() {
  const [filters, setFilters] = useState<CustomerFilterValues>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<keyof Customer | null>("nextExpirationDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const { data, isLoading } = useQuery({
    queryKey: qk.customers({ page, pageSize, sortBy, sortDir, ...filters }),
    queryFn: () => fetchCustomers({ page, pageSize, sortBy, sortDir, filters }),
    placeholderData: (prev) => prev,
  });

  // Atualiza qualquer filtro e reseta a página atomicamente
  const setFilter = useCallback(<K extends keyof CustomerFilterValues>(key: K, value: CustomerFilterValues[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleSort = useCallback((column: keyof Customer) => {
    setSortBy(column);
    setSortDir((prev) => (sortBy === column ? (prev === "asc" ? "desc" : "asc") : "asc"));
    setPage(1);
  }, [sortBy]);

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
  }, []);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return {
    // Dados
    customers: data?.content ?? [],
    loading: isLoading,
    total: data?.page.totalElements ?? 0,
    // Filtros — agrupados para clareza
    filters,
    setFilter,
    hasActiveFilters,
    clearFilters,
    // Paginação
    pagination: { page, setPage, pageSize, setPageSize },
    // Ordenação
    sort: { by: sortBy, dir: sortDir, handle: handleSort },
  };
}
