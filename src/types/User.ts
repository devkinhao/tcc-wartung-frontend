// src/types/User.ts
export type User = {
  id: number;
  username: string;
  fullName: string;
  email: string | null;
  isActive: boolean;
  permissions: string[];
  avatarUrl: string;
};