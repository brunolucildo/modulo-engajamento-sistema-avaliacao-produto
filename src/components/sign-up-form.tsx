"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type SignUpValues, signUpSchema } from "@/lib/sign-up-schema";

type ApiResponse = {
  error?: string;
};

export function SignUpForm() {
  const router = useRouter();
  const [requestError, setRequestError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
  });

  async function submitSignUp(values: SignUpValues) {
    setRequestError("");

    try {
      const response = await fetch("/api/v1/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setRequestError(result.error ?? "Não foi possível criar sua conta.");
        return;
      }

      router.push("/auth/sign-up/success");
    } catch {
      setRequestError(
        "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      );
    }
  }

  return (
    <form
      className="sign-up-form"
      onSubmit={handleSubmit(submitSignUp)}
      noValidate
    >
      {requestError ? (
        <div className="form-alert" role="alert">
          <span className="alert-mark" aria-hidden="true">
            !
          </span>
          {requestError}
        </div>
      ) : null}

      <div className="field-row">
        <div className="field">
          <label htmlFor="firstName">Nome</label>
          <input
            autoComplete="given-name"
            id="firstName"
            placeholder="Ex.: Ana"
            {...register("firstName")}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
          />
          {errors.firstName ? (
            <span className="field-error" id="firstName-error">
              {errors.firstName.message}
            </span>
          ) : null}
        </div>

        <div className="field">
          <label htmlFor="lastName">Sobrenome</label>
          <input
            autoComplete="family-name"
            id="lastName"
            placeholder="Ex.: Silva"
            {...register("lastName")}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
          />
          {errors.lastName ? (
            <span className="field-error" id="lastName-error">
              {errors.lastName.message}
            </span>
          ) : null}
        </div>
      </div>

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          autoComplete="email"
          id="email"
          placeholder="voce@exemplo.com"
          type="email"
          {...register("email")}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email ? (
          <span className="field-error" id="email-error">
            {errors.email.message}
          </span>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="password">Senha</label>
        <input
          autoComplete="new-password"
          id="password"
          placeholder="Pelo menos 8 caracteres"
          type="password"
          {...register("password")}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "password-error" : "password-hint"
          }
        />
        {errors.password ? (
          <span className="field-error" id="password-error">
            {errors.password.message}
          </span>
        ) : (
          <span className="field-hint" id="password-hint">
            Use pelo menos 8 caracteres.
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="passwordConfirmation">Confirme sua senha</label>
        <input
          autoComplete="new-password"
          id="passwordConfirmation"
          placeholder="Digite a senha novamente"
          type="password"
          {...register("passwordConfirmation")}
          aria-invalid={Boolean(errors.passwordConfirmation)}
          aria-describedby={
            errors.passwordConfirmation
              ? "passwordConfirmation-error"
              : undefined
          }
        />
        {errors.passwordConfirmation ? (
          <span className="field-error" id="passwordConfirmation-error">
            {errors.passwordConfirmation.message}
          </span>
        ) : null}
      </div>

      <button className="submit-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Criando sua conta..." : "Criar minha conta"}
        <span className="button-arrow" aria-hidden="true">
          →
        </span>
      </button>
    </form>
  );
}
