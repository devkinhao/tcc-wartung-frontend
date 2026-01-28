// src/pages/customers/hooks/useCustomers.ts
import { useEffect, useState, useCallback } from "react";
import { Customer } from "../types";
import { api } from "@/services/api";

// Interface para o retorno do Page do Spring
interface SpringPageResponse {
  content: Customer[];
  page: {                // A estrutura mudade devido ao VIA_DTO
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  // Estados de Filtro
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [isCustomer, setIsCustomer] = useState("");
  const [month, setMonth] = useState("");

  // Estados de Paginação e Ordenação
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<keyof Customer | null>("nextExpirationDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get<SpringPageResponse>("/customers", {
        params: {
          page: page - 1, // Spring usa base 0
          size: pageSize,
          sort: sortBy ? `${sortBy},${sortDir}` : "nextExpirationDate,asc",
          // Enviamos apenas se houver valor para evitar strings vazias no backend
          search: search || undefined,
          city: city || undefined,
          isCustomer: isCustomer === "" ? undefined : isCustomer === "true",
          month: month || undefined,
        },
      });

      setCustomers(response.data.content); 
      setTotalRecords(response.data.page.totalElements);
    } catch (error) {
      console.error("Erro ao carregar clientes do backend:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, sortBy, sortDir, search, city, isCustomer, month]);

  // Dispara a busca sempre que algo mudar
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Resetar para página 1 ao filtrar
  useEffect(() => {
    setPage(1);
  }, [search, city, isCustomer, month]);

  const handleSort = (column: keyof Customer) => {
    if (sortBy === column) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCity("");
    setIsCustomer("");
    setMonth("");
    setPage(1);
  };

  const hasActiveFilters = search !== "" || city !== "" || isCustomer !== "" || month !== "";

  return {
    customers,
    loading,
    search,
    setSearch,
    city,
    setCity,
    isCustomer,
    setIsCustomer,
    month,
    setMonth,
    page,
    setPage,
    pageSize,
    setPageSize,
    sortBy,
    sortDir,
    handleSort,
    totalRecords,
    hasActiveFilters,
    clearFilters,
  };
}