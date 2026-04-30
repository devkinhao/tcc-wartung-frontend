import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { qk } from "@/api/keys";
import type { ViaCepResponseDTO } from "@/api/cep.api";
import type { CustomerDetailResponseDTO } from "../types/customerDetail";
import type { AddressResponseDTO } from "../types/customerDetail";
import {
  deactivateCustomer,
  getCustomerDetail,
  updateCustomerAddress,
  updateCustomerContacts,
  updateCustomerGeneral,
  type CustomerUpdateAddressRequestDTO,
  type CustomerUpdateContactsRequestDTO,
  type CustomerUpdateGeneralRequestDTO,
} from "../api/customers.detail.api";

export function useCustomerDetail(customerId: number) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: qk.customerDetail(customerId),
    queryFn: () => getCustomerDetail(customerId),
    enabled: Number.isFinite(customerId) && customerId > 0,
  });

  const [draft, setDraft] = useState<CustomerDetailResponseDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (data) setDraft((prev) => prev ?? data);
  }, [data]);

  // Sincroniza cache + draft após qualquer update bem-sucedido
  const onSuccess = useCallback(
    (updated: CustomerDetailResponseDTO) => {
      qc.setQueryData(qk.customerDetail(customerId), updated);
      setDraft(updated);
    },
    [qc, customerId]
  );

  const generalMutation = useMutation({
    mutationFn: (payload: CustomerUpdateGeneralRequestDTO) =>
      updateCustomerGeneral(customerId, payload),
    onSuccess,
    onError: () => setError(t("customerDetails.errors.updateGeneral")),
  });

  const contactsMutation = useMutation({
    mutationFn: (payload: CustomerUpdateContactsRequestDTO) =>
      updateCustomerContacts(customerId, payload),
    onSuccess,
    onError: () => setError(t("customerDetails.errors.updateContacts")),
  });

  const addressMutation = useMutation({
    mutationFn: (payload: CustomerUpdateAddressRequestDTO) =>
      updateCustomerAddress(customerId, payload),
    onSuccess,
    onError: () => setError(t("customerDetails.errors.updateAddress")),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateCustomer(customerId),
    onSuccess: () => navigate("/customers"),
    onError: () => setError(t("customerDetails.errors.deactivate")),
  });

  // Helper para atualizar campos de nível raiz do draft
  const updateField = useCallback(
    <K extends keyof CustomerDetailResponseDTO>(
      field: K,
      value: CustomerDetailResponseDTO[K]
    ) => {
      setDraft((prev) => (prev ? { ...prev, [field]: value } : prev));
    },
    []
  );

  // Helper para atualizar campos aninhados do endereço
  const updateAddress = useCallback(
    <K extends keyof AddressResponseDTO>(field: K, value: AddressResponseDTO[K]) => {
      setDraft((prev) =>
        prev ? { ...prev, address: { ...prev.address, [field]: value } } : prev
      );
    },
    []
  );

  const resetDraft = useCallback(() => {
    if (data) setDraft(data);
  }, [data]);

  // Preenche campos de endereço ao encontrar um CEP via backend
  const handleCepFound = useCallback((cepData: ViaCepResponseDTO) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const city = cepData.cityId
        ? { id: Number(cepData.cityId), name: prev.address?.city?.name ?? "" }
        : prev.address?.city;
      return {
        ...prev,
        address: {
          ...prev.address,
          zipCode: cepData.zipCode,
          street: cepData.street || prev.address?.street,
          complement: cepData.complement || prev.address?.complement,
          neighborhood: cepData.neighborhood || prev.address?.neighborhood,
          city: city ?? prev.address?.city,
        },
      };
    });
  }, []);

  return {
    data,
    draft,
    setDraft,
    view: draft ?? data,
    isLoading,
    error,
    setError,
    updateField,
    updateAddress,
    resetDraft,
    handleCepFound,
    mutations: {
      general: generalMutation,
      contacts: contactsMutation,
      address: addressMutation,
      deactivate: deactivateMutation,
    },
  };
}
