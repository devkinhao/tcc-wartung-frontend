import { z } from "zod";
import * as f from "@/validation/fields";

const PASSWORD_MISMATCH = "userProfile.password.errors.mismatch";

// Campos de perfil comuns a "criar usuário", "editar usuário" e "meu perfil".
// Espelham o UserUpdateRequestDTO do backend (@Pattern cpf, @Email, tamanhos).
const profileShape = {
  fullName: f.requiredText.max(50),
  cpf: f.cpf,
  email: f.email,
  creaNumber: z.string().max(10),
};

export const userProfileSchema = z.object(profileShape);

export const userCreateSchema = z
  .object({
    ...profileShape,
    username: f.username,
    password: f.requiredText,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: PASSWORD_MISMATCH,
  });

/** Admin redefinindo a senha de outro usuário. */
export const userResetPasswordSchema = z.object({
  newPassword: f.requiredText,
});

/** Usuário trocando a própria senha. */
export const changePasswordSchema = z
  .object({
    currentPassword: f.requiredText,
    newPassword: f.requiredText,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: PASSWORD_MISMATCH,
  });
