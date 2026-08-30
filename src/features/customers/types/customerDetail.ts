import { AbvtexSealType } from "./abvtexSeal"
import type { City } from "./City";
import type { InspectionDeactivationReason } from "@/features/inspections/deactivationReason";

export type AddressResponseDTO = {
  street: string;
  complement: string;
  neighborhood: string;
  number: string;
  zipCode: string;
  city: City;
};

export type ServiceTypeResponseDTO = {
  id: number;
  name: string;
};

export type InspectionDocumentResponseDTO = {
  id: number;
  description: string;
  name: string;
  size: number;
  uploadDate: string; // LocalDateTime ISO
};

export type InspectionSummaryResponseDTO = {
  id: number;
  inspectionDate: string; // LocalDate ISO
  serviceType: ServiceTypeResponseDTO;
  notes: string | null;
  expirationDate: string; // LocalDate ISO
  isActive: boolean;
  isRenewed: boolean;
  deactivationReason: InspectionDeactivationReason | null;
  documents: InspectionDocumentResponseDTO[];
};

export type CustomerDetailResponseDTO = {
  id: number;
  fantasyName: string;
  legalName: string;
  cnpj: string;
  phone: string;
  mobilePhone: string;
  email: string;
  isCustomer: boolean;
  abvtexSeal: AbvtexSealType;
  address: AddressResponseDTO;

  createdById: number | null;
  createdByUsername: string | null;
  createdAt: string; // LocalDateTime ISO
  updatedById: number | null;
  updatedByUsername: string | null;
  updatedAt: string; // LocalDateTime ISO

  inspections: InspectionSummaryResponseDTO[];
};