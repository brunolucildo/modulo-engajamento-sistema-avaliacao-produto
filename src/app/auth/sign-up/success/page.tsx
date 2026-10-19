import Link from "next/link";

export default function SignUpSuccessPage() {
  return (
    <main className="success-shell">
      <section className="success-card" aria-labelledby="success-title">
        <span className="success-icon" aria-hidden="true">
          ✓
        </span>
        <p className="eyebrow">Tudo certo</p>
        <h1 id="success-title">Sua conta foi criada!</h1>
        <p>
          Seu cadastro foi concluído. Agora você já faz parte da comunidade
          Engaja.
        </p>
        <Link className="submit-button success-link" href="/auth/sign-up">
          Voltar para o início
          <span className="button-arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </section>
    </main>
  );
}
