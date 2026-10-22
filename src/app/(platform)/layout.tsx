import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentUser } from "@/lib/auth-session";
import "./platform.css";

export const metadata: Metadata = {
  title: "Produtos para descobrir | Engaja",
  description:
    "Descubra produtos, conheça novas ideias e participe das conversas no Engaja.",
};

function BrandMark() {
  return (
    <span className="platform-brand-mark">
      <svg viewBox="0 0 32 32" fill="none">
        <title>Marca Engaja</title>
        <path
          d="M5.5 8.5a4 4 0 0 1 4-4h13a4 4 0 0 1 4 4v9a4 4 0 0 1-4 4h-8l-6.5 5v-5.6a4 4 0 0 1-2.5-3.4v-9Z"
          fill="currentColor"
        />
        <path
          d="M11 12.8h10M11 16.8h6"
          stroke="#DCE7F5"
          strokeLinecap="round"
          strokeWidth="2"
        />
      </svg>
    </span>
  );
}

export default async function PlatformLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const avatarSeed = user
    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
    : "";

  return (
    <div className="platform-shell">
      <header className="platform-header">
        <div className="platform-header-inner">
          <Link className="platform-brand" href="/" aria-label="Engaja, início">
            <BrandMark />
            <span>engaja</span>
          </Link>
          <nav className="platform-nav" aria-label="Navegação principal">
            <Link className="platform-nav-link" href="/">
              Produtos
            </Link>
          </nav>
          <div className="platform-account">
            {user ? (
              <div
                className="platform-user"
                title={`${displayName} — ${user.email}`}
              >
                <span className="platform-avatar" aria-hidden="true">
                  {avatarSeed}
                </span>
                <span className="platform-user-copy">
                  <span className="platform-user-name">{displayName}</span>
                  <span className="platform-user-email">{user.email}</span>
                </span>
              </div>
            ) : (
              <Link className="platform-login" href="/auth/sign-in">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="platform-main">{children}</main>
      <footer className="platform-footer">
        <div className="platform-footer-inner">
          <Link className="platform-footer-brand" href="/">
            Engaja
          </Link>
          <span>Produtos melhores começam com boas conversas.</span>
        </div>
      </footer>
    </div>
  );
}
