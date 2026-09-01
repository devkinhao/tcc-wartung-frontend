import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/api/keys";
import { useNotify } from "@/hooks/useNotify";
import { serviceTypesApi, type ServiceTypeResponseDTO } from "../api/serviceTypes.api";

export function useServiceTypes(search = "") {
  const queryClient = useQueryClient();
  const notify = useNotify();

  const { data = [], isLoading, error } = useQuery({
    queryKey: qk.serviceTypes(),
    queryFn: () => serviceTypesApi.findAll(),
  });

  const serviceTypes = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? data.filter((s) => s.name.toLowerCase().includes(q)) : data;
  }, [data, search]);

  const reload = () => queryClient.invalidateQueries({ queryKey: qk.serviceTypes() });

  const deleteMutation = useMutation({
    mutationFn: (serviceType: ServiceTypeResponseDTO) => serviceTypesApi.delete(serviceType.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.serviceTypes() });
      notify.success("notify.success.serviceDeleted");
    },
    onError: (err) => notify.fromError(err),
  });

  return {
    serviceTypes,
    isLoading,
    error,
    reload,
    deleteServiceType: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
