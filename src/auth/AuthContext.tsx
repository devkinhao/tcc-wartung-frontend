import { createContext } from "react";
import { User } from "@/types/User";

export type AuthData = {
  token: string | null;
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthData | null>(null);