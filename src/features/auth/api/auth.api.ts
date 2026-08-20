import { api } from "@/api/client";

type LoginRequest = {
  username: string;
  password: string;
};

type LoginResponse = {
  token: string;
};

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>("/auth/login", data);
  return response.data;
}

type ForgotPasswordRequest = {
  email: string;
};

export async function forgotPassword(data: ForgotPasswordRequest): Promise<void> {
  await api.post("/auth/forgot-password", data);
}

type ResetPasswordRequest = {
  token: string;
  newPassword: string;
};

export async function resetPassword(data: ResetPasswordRequest): Promise<void> {
  await api.post("/auth/reset-password", data);
}