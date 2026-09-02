import { z } from "zod";
import * as f from "@/validation/fields";

export const forgotPasswordSchema = z.object({
  email: f.email,
});

export const resetPasswordSchema = z
  .object({
    newPassword: f.requiredText,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "userProfile.password.errors.mismatch",
  });
