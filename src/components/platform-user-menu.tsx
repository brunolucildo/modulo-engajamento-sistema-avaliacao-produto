"use client";

import { useState } from "react";

type PlatformUserMenuProps = {
  displayName: string;
  email: string;
  avatarSeed: string;
  initialTheme: "light" | "dark";
};

export function PlatformUserMenu({
  displayName,
  email,
  avatarSeed,
  initialTheme,
}: PlatformUserMenuProps) {
  const [theme, setTheme] = useState(initialTheme);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [error, setError] = useState("");

  async function toggleTheme() {
    const nextTheme = theme === "light" ? "dark" : "light";
    setError("");
    setIsSavingTheme(true);

    try {
      const response = await fetch("/api/v1/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme: nextTheme }),
      });

      if (!response.ok) {
        throw new Error("Não foi possível salvar sua preferência de tema.");
      }

      document.documentElement.dataset.theme = nextTheme;
      setTheme(nextTheme);
    } catch (themeError) {
      console.error("Theme preference request failed:", themeError);
      setError("Não foi possível alterar o tema. Tente novamente.");
    } finally {
      setIsSavingTheme(false);
    }
  }

  async function signOut() {
    setError("");
    setIsSigningOut(true);

    try {
      const response = await fetch("/api/v1/sign-out", { method: "POST" });
      if (!response.ok) {
        throw new Error("Não foi possível sair da sua conta.");
      }

      window.location.assign("/");
    } catch (signOutError) {
      console.error("Sign-out request failed:", signOutError);
      setError("Não foi possível sair da sua conta. Tente novamente.");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <details className="platform-account-menu">
      <summary
        className="platform-user"
        aria-label={`Menu da conta de ${displayName}`}
      >
        <span className="platform-avatar" aria-hidden="true">
          {avatarSeed}
        </span>
        <span className="platform-user-copy">
          <span className="platform-user-name">{displayName}</span>
          <span className="platform-user-email">{email}</span>
        </span>
        <svg
          className="platform-user-chevron"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="m4 6 4 4 4-4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.6"
          />
        </svg>
      </summary>
      <div className="platform-account-menu-panel">
        <p className="platform-menu-account">
          <span>{displayName}</span>
          <span>{email}</span>
        </p>
        <button
          className="platform-menu-action"
          type="button"
          onClick={toggleTheme}
          disabled={isSavingTheme || isSigningOut}
          aria-pressed={theme === "dark"}
        >
          <span>
            {isSavingTheme
              ? "Salvando tema…"
              : theme === "dark"
                ? "Modo claro"
                : "Modo escuro"}
          </span>
          <span className="platform-theme-switch" aria-hidden="true">
            <span />
          </span>
        </button>
        <button
          className="platform-menu-action platform-menu-signout"
          type="button"
          onClick={signOut}
          disabled={isSigningOut || isSavingTheme}
        >
          {isSigningOut ? "Saindo…" : "Sair da conta"}
        </button>
        {error ? (
          <p className="platform-menu-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </details>
  );
}
