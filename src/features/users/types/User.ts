export type User = {
  id: number;
  username: string;
  fullName: string;
  cpf: string | null;
  email: string | null;
  creaNumber: string | null;
  isActive: boolean;
  permissions: string[];
  avatarUrl: string | null;
};
