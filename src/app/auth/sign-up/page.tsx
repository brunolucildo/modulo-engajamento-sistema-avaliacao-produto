import { SignUpForm } from "@/components/sign-up-form";

export default function SignUpPage() {
  return (
    <main className="auth-shell">
      <section className="intro-panel" aria-labelledby="intro-title">
        <a className="brand" href="/auth/sign-up" aria-label="Engaja, início">
          <span className="brand-mark" aria-hidden="true">
            e
          </span>
          <span>engaja</span>
        </a>

        <div className="intro-copy">
          <p className="eyebrow">Sua voz faz a diferença</p>
          <h1 id="intro-title">
            Boas ideias
            <br />
            começam com
            <br />
            <span className="intro-highlight">uma conversa.</span>
          </h1>
          <p className="intro-description">
            Crie sua conta e faça parte de uma comunidade que transforma
            opiniões em experiências melhores.
          </p>
        </div>

        <p className="intro-footnote">Um espaço feito para ouvir você.</p>
      </section>

      <section className="form-panel" aria-labelledby="form-title">
        <div className="form-container">
          <div className="mobile-brand brand" aria-hidden="true">
            <span className="brand-mark">e</span>
            <span>engaja</span>
          </div>
          <p className="eyebrow form-eyebrow">Comece por aqui</p>
          <h2 id="form-title">Crie sua conta</h2>
          <p className="form-description">
            Preencha seus dados para fazer parte da comunidade.
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
