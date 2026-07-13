export type ServiceTypeResponseDTO = {
  id: number;
  name: string;
};

export type CustomerSummaryResponseDTO = {
  id: number;
  legalName: string;
  cnpj: string;
};

export type InspectionDocumentResponseDTO = {
  id: number;
  description: string;
  name: string;
  size: number;
  uploadDate: string; // ISO date-time
};

export type InspectionDetailResponseDTO = {
  id: number;
  customer: CustomerSummaryResponseDTO;
  inspectionDate: string; // ISO date
  serviceType: ServiceTypeResponseDTO;
  notes: string | null;
  expirationDate: string; // ISO date
  isActive: boolean;
  isRenewed: boolean;
  createdById: number | null;
  createdByUsername: string | null;
  createdAt: string | null; // ISO date-time
  updatedById: number | null;
  updatedByUsername: string | null;
  updatedAt: string | null; // ISO date-time
  documents: InspectionDocumentResponseDTO[];
};
