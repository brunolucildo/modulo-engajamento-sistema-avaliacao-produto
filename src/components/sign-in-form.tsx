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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
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
        <div className="password-field">
          <input
            autoComplete="current-password"
            id="password"
            placeholder="Digite sua senha"
            type={isPasswordVisible ? "text" : "password"}
            {...register("password")}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
          />
          <button
            className="password-toggle"
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={isPasswordVisible}
          >
            {isPasswordVisible ? (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A10.8 10.8 0 0 1 12 5c5.1 0 8.6 4.8 9.5 6.3a1.3 1.3 0 0 1 0 1.4 15 15 0 0 1-3.1 3.6M6.2 6.2a16.3 16.3 0 0 0-3.7 5.1 1.3 1.3 0 0 0 0 1.4C3.4 14.2 6.9 19 12 19c1 0 1.9-.2 2.8-.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                  stroke="currentColor"
                  strokeLinejoin="round"
                  strokeWidth="1.7"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="2.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
              </svg>
            )}
          </button>
        </div>
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
