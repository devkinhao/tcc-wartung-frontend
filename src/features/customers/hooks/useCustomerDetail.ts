import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/api/keys";
import { useNotify } from "@/hooks/useNotify";
import type { ViaCepResponseDTO } from "@/api/cep.api";
import type { CustomerDetailResponseDTO, AddressResponseDTO } from "../types/customerDetail";
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
  const navigate = useNavigate();
  const qc      = useQueryClient();
  const notify  = useNotify();

  // ── Dados ──────────────────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: qk.customerDetail(customerId),
    queryFn:  () => getCustomerDetail(customerId),
    enabled:  Number.isFinite(customerId) && customerId > 0,
  });

  const [draft, setDraft] = useState<CustomerDetailResponseDTO | null>(null);

  // ── Estados de edição — ficam no hook para o onSuccess poder fechá-los ────
  const [editingGeneral,  setEditingGeneral]  = useState(false);
  const [editingContacts, setEditingContacts] = useState(false);
  const [editingAddress,  setEditingAddress]  = useState(false);

  // Ressincroniza o draft sempre que dados novos chegam (ex: invalidação após
  // criar uma inspeção), exceto durante uma edição em andamento — nesse caso
  // sobrescrever o draft descartaria alterações não salvas do usuário.
  useEffect(() => {
    if (!data) return;
    if (editingGeneral || editingContacts || editingAddress) return;
    setDraft(data);
  }, [data, editingGeneral, editingContacts, editingAddress]);

  // ── onSuccess comum: atualiza cache + draft + fecha edição + toast ─────────
  function makeOnSuccess(closeEditing: () => void) {
    return (updated: CustomerDetailResponseDTO) => {
      qc.setQueryData(qk.customerDetail(customerId), updated);
      setDraft(updated);
      closeEditing();
      notify.success("notify.success.saved");
    };
  }

  // ── Mutations ──────────────────────────────────────────────────────────────
  const generalMutation = useMutation({
    mutationFn: (payload: CustomerUpdateGeneralRequestDTO) =>
      updateCustomerGeneral(customerId, payload),
    onSuccess: makeOnSuccess(() => setEditingGeneral(false)),
    onError:   (err) => notify.fromError(err),
  });

  const contactsMutation = useMutation({
    mutationFn: (payload: CustomerUpdateContactsRequestDTO) =>
      updateCustomerContacts(customerId, payload),
    onSuccess: makeOnSuccess(() => setEditingContacts(false)),
    onError:   (err) => notify.fromError(err),
  });

  const addressMutation = useMutation({
    mutationFn: (payload: CustomerUpdateAddressRequestDTO) =>
      updateCustomerAddress(customerId, payload),
    onSuccess: makeOnSuccess(() => setEditingAddress(false)),
    onError:   (err) => notify.fromError(err),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateCustomer(customerId),
    onSuccess:  () => navigate("/customers"),
    onError:    (err) => notify.fromError(err),
  });

  // ── Helpers de draft ───────────────────────────────────────────────────────
  const updateField = useCallback(
    <K extends keyof CustomerDetailResponseDTO>(
      field: K,
      value: CustomerDetailResponseDTO[K]
    ) => setDraft((prev) => (prev ? { ...prev, [field]: value } : prev)),
    []
  );

  const updateAddress = useCallback(
    <K extends keyof AddressResponseDTO>(field: K, value: AddressResponseDTO[K]) =>
      setDraft((prev) =>
        prev ? { ...prev, address: { ...prev.address, [field]: value } } : prev
      ),
    []
  );

  const resetDraft = useCallback(() => {
    if (data) setDraft(data);
  }, [data]);

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
          zipCode:      cepData.zipCode,
          street:       cepData.street       || prev.address?.street,
          complement:   cepData.complement   || prev.address?.complement,
          neighborhood: cepData.neighborhood || prev.address?.neighborhood,
          city:         city ?? prev.address?.city,
        },
      };
    });
  }, []);

  return {
    view: draft ?? data,
    isLoading,
    // edição
    editingGeneral,  setEditingGeneral,
    editingContacts, setEditingContacts,
    editingAddress,  setEditingAddress,
    // draft
    updateField,
    updateAddress,
    resetDraft,
    handleCepFound,
    // mutations
    mutations: {
      general:    generalMutation,
      contacts:   contactsMutation,
      address:    addressMutation,
      deactivate: deactivateMutation,
    },
  };
}
