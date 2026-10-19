import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    <main className="auth-shell">
      <section className="intro-panel" aria-labelledby="intro-title">
        <a className="brand" href="/auth/sign-up" aria-label="Engaja, início">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
              <path d="M7 8.5a3.5 3.5 0 0 1 3.5-3.5h11A3.5 3.5 0 0 1 25 8.5v8a3.5 3.5 0 0 1-3.5 3.5H14l-5 4v-5.2A3.5 3.5 0 0 1 7 16z" />
              <circle cx="13" cy="12.5" r="1.3" />
              <circle cx="18" cy="12.5" r="1.3" />
            </svg>
          </span>
          <span>engaja</span>
        </a>

        <div className="intro-copy">
          <svg
            className="conversation-art"
            viewBox="0 0 360 230"
            role="img"
            aria-label="Balões de conversa representando opiniões compartilhadas"
          >
            <path
              className="art-bubble art-bubble-main"
              d="M27 23h191a22 22 0 0 1 22 22v91a22 22 0 0 1-22 22h-99l-43 34v-34H27a22 22 0 0 1-22-22V45a22 22 0 0 1 22-22Z"
            />
            <path
              className="art-signal"
              d="M57 93h23l12-23 18 48 14-34 12 9h53"
            />
            <path
              className="art-bubble art-bubble-reply"
              d="M178 126h135a19 19 0 0 1 19 19v48a19 19 0 0 1-19 19h-84l-32 24v-24h-19a19 19 0 0 1-19-19v-48a19 19 0 0 1 19-19Z"
            />
            <circle className="art-reply-dot" cx="221" cy="170" r="5" />
            <circle className="art-reply-dot" cx="246" cy="170" r="5" />
            <circle className="art-reply-dot" cx="271" cy="170" r="5" />
            <circle className="art-orbit" cx="302" cy="48" r="29" />
            <path className="art-orbit-dots" d="M290 48h2m9 0h2m9 0h2" />
          </svg>
          <h1 id="intro-title">Toda boa experiência começa ouvindo.</h1>
          <p className="intro-description">
            Compartilhe o que você pensa e ajude a construir produtos melhores
            para todo mundo.
          </p>
        </div>

        <p className="intro-footnote">Opiniões que fazem a diferença.</p>
      </section>

      <section className="form-panel" aria-labelledby="form-title">
        <div className="form-container">
          <div className="mobile-brand brand" aria-hidden="true">
            <span className="brand-mark">e</span>
            <span>engaja</span>
          </div>
          <p className="form-kicker">Faça parte da conversa</p>
          <h2 id="form-title">Crie sua conta</h2>
          <p className="form-description">
            Seus dados de acesso, para começar.
          </p>
          <SignUpForm />
          <p className="privacy-note">
            Seus dados são protegidos e usados apenas para criar sua conta.
          </p>
        </div>
      </section>
    </main>
  );
}
