import { api } from "@/api/client";
import type { CustomerDetailResponseDTO } from "../types/customerDetail";

export type CustomerUpdateGeneralRequestDTO = {
  fantasyName: string;
  legalName: string;
  cnpj: string;
  isCustomer: boolean;
  abvtexSeal: CustomerDetailResponseDTO["abvtexSeal"];
};

export type CustomerUpdateContactsRequestDTO = {
  phone: string;
  mobilePhone: string;
  email: string;
};

export type CustomerUpdateAddressRequestDTO = {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  cityId: number;
};

export async function getCustomerDetail(id: number) {
  const { data } = await api.get<CustomerDetailResponseDTO>(`/customers/${id}`);
  return data;
}

export async function updateCustomerGeneral(id: number, dto: CustomerUpdateGeneralRequestDTO) {
  const { data } = await api.patch<CustomerDetailResponseDTO>(`/customers/${id}/general`, dto);
  return data;
}

export async function updateCustomerContacts(id: number, dto: CustomerUpdateContactsRequestDTO) {
  const { data } = await api.patch<CustomerDetailResponseDTO>(`/customers/${id}/contacts`, dto);
  return data;
}

export async function updateCustomerAddress(id: number, dto: CustomerUpdateAddressRequestDTO) {
  const { data } = await api.patch<CustomerDetailResponseDTO>(`/customers/${id}/address`, dto);
  return data;
}

export async function deactivateCustomer(id: number) {
  await api.delete(`/customers/${id}`);
}