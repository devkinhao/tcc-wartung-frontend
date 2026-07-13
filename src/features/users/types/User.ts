export type User = {
  id: number;
  username: string;
  fullName: string;
  cpf: string;
  email: string;
  creaNumber: string;
  isActive: boolean;
  permissions: string[];
  avatarUrl: string;
};
