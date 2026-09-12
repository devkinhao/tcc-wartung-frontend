import { z } from "zod";
import * as f from "@/validation/fields";

// Espelha o EmailSettingsUpdateRequestDTO do backend (@NotBlank host/username,
// @Min/@Max port, @NotBlank @Email fromAddress). `password` fica de fora: é
// opcional (vazio = manter a senha atual) e não tem formato a validar.
export const emailSettingsSchema = z.object({
  host: f.requiredText.max(100),
  port: f.requiredText,
  username: f.requiredText.max(100),
  fromAddress: f.requiredEmail,
});
