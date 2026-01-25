// src/services/userService.ts
import { api } from "./api";
import { User } from "@/types/User";

export async function getMe(): Promise<User> {
  const response = await api.get<User>("/users/me");
  return response.data;
}