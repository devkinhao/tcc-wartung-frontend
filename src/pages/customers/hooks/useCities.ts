import { useEffect, useState } from "react";
import { api } from "@/services/api";

export function useCities() {
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    async function loadCities() {
      try {
        const response = await api.get<City[]>("/cities");
        setCities(response.data);
      } catch (error) {
        console.error("Erro ao carregar cidades:", error);
      }
    }
    loadCities();
  }, []);

  return cities;
}