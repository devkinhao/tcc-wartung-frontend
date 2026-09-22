export type UserDocumentResponseDTO = {
  id: number;
  description: string | null;
  name: string;
  size: number;
  uploadDate: string; // ISO date-time
};
