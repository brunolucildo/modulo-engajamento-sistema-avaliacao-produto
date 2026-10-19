import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "A senha deve ter pelo menos 8 caracteres.")
  .refine(
    (password) => new TextEncoder().encode(password).length <= 72,
    "A senha deve ter no máximo 72 bytes.",
  );

export const signUpSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "Informe seu nome.")
      .max(80, "O nome deve ter no máximo 80 caracteres."),
    lastName: z
      .string()
      .trim()
      .min(1, "Informe seu sobrenome.")
      .max(80, "O sobrenome deve ter no máximo 80 caracteres."),
    email: z
      .string()
      .trim()
      .email("Informe um email válido.")
      .max(254, "O email deve ter no máximo 254 caracteres.")
      .transform((email) => email.toLowerCase()),
    password: passwordSchema,
    passwordConfirmation: z.string().min(1, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem.",
    path: ["passwordConfirmation"],
  });

export type SignUpValues = z.input<typeof signUpSchema>;
