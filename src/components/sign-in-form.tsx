"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type SignInValues, signInSchema } from "@/lib/sign-in-schema";

type ApiResponse = {
  error?: string;
};

export function SignInForm() {
  const router = useRouter();
  const [requestError, setRequestError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: "onBlur",
  });

  async function submitSignIn(values: SignInValues) {
    setRequestError("");

    try {
      const response = await fetch("/api/v1/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = (await response.json()) as ApiResponse;

      if (!response.ok) {
        setRequestError(
          response.status === 401
            ? "Email ou senha inválidos."
            : (result.error ??
                "Não foi possível entrar agora. Tente novamente."),
        );
        return;
      }

      router.push("/");
    } catch {
      setRequestError(
        "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
      );
    }
  }

  return (
    <form
      className="sign-up-form"
      onSubmit={handleSubmit(submitSignIn)}
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

      <div className="field">
        <label htmlFor="email">Email</label>
        <input
          autoComplete="email"
          autoCapitalize="none"
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
          autoComplete="current-password"
          id="password"
          placeholder="Digite sua senha"
          type="password"
          {...register("password")}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password ? (
          <span className="field-error" id="password-error">
            {errors.password.message}
          </span>
        ) : null}
      </div>

      <button className="submit-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Entrando..." : "Entrar"}
        <span className="button-arrow" aria-hidden="true">
          →
        </span>
      </button>

      <p className="privacy-note">
        Ainda não tem uma conta? <Link href="/auth/sign-up">Criar conta</Link>
      </p>
    </form>
  );
}
