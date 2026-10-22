import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Informe um email válido.")
    .max(254, "O email deve ter no máximo 254 caracteres.")
    .transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .refine(
      (password) => new TextEncoder().encode(password).length <= 72,
      "A senha deve ter no máximo 72 bytes.",
    ),
});

export type SignInValues = z.input<typeof signInSchema>;
