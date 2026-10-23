"use client";

import Link from "next/link";
import { useState } from "react";
import { feedbackSchema, type ProductFeedback } from "@/lib/feedback-schema";
import styles from "./feedback-panel.module.css";

type FeedbackPanelProps = {
  productId: string;
  initialFeedbacks: ProductFeedback[];
  initialSummary: string | null;
  initialSummaryFeedbackCount: number;
  initialSummaryError: boolean;
  isAuthenticated: boolean;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

function ScoreStars({ score, label }: { score: number; label: string }) {
  return (
    <span className={styles.stars} role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          className={star <= score ? styles.starFilled : styles.starEmpty}
          aria-hidden="true"
          key={star}
        >
          ★
        </span>
      ))}
    </span>
  );
}

export function FeedbackPanel({
  productId,
  initialFeedbacks,
  initialSummary,
  initialSummaryFeedbackCount,
  initialSummaryError,
  isAuthenticated,
}: FeedbackPanelProps) {
  const [feedbacks, setFeedbacks] = useState(initialFeedbacks);
  const [summary, setSummary] = useState(initialSummary);
  const [summaryFeedbackCount, setSummaryFeedbackCount] = useState(
    initialSummaryFeedbackCount,
  );
  const [summaryError, setSummaryError] = useState(initialSummaryError);
  const [score, setScore] = useState<number | null>(null);
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const validation = feedbackSchema.safeParse({ score, comment });
    if (!validation.success) {
      setError(
        score === null
          ? "Escolha uma nota de 1 a 5."
          : "Escreva um comentário de até 2000 caracteres.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/v1/products/${productId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });
      const result = (await response.json()) as {
        error?: string;
        feedback?: ProductFeedback;
        summary?: {
          summary: string | null;
          feedbackCount: number;
          summaryError: boolean;
        };
      };
      const createdFeedback = result.feedback;

      if (!response.ok || !createdFeedback) {
        setError(result.error ?? "Não foi possível salvar sua avaliação.");
        return;
      }

      setFeedbacks((current) => [createdFeedback, ...current]);
      if (result.summary) {
        if (result.summary.summary) {
          setSummary(result.summary.summary);
        }
        if (!result.summary.summaryError) {
          setSummaryFeedbackCount(result.summary.feedbackCount);
        }
        setSummaryError(result.summary.summaryError);
      } else {
        setSummaryError(true);
      }
      setScore(null);
      setComment("");
      setSuccess("Sua avaliação foi publicada.");
    } catch {
      setError("Não foi possível salvar sua avaliação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <aside className={styles.summary} aria-labelledby="summary-heading">
        <div className={styles.summaryIcon} aria-hidden="true">
          ✳
        </div>
        <div className={styles.summaryContent}>
          <div className={styles.summaryHeading}>
            <h2 id="summary-heading">Resumo das avaliações</h2>
            <span className={styles.aiBadge}>IA</span>
          </div>
          {summary ? (
            <p>{summary}</p>
          ) : (
            <p>
              {feedbacks.length
                ? "O resumo aparecerá assim que a análise estiver disponível."
                : "Quando houver avaliações, uma síntese aparecerá aqui."}
            </p>
          )}
          {summaryFeedbackCount > 0 ? (
            <span className={styles.summaryMeta}>
              Gerado com {summaryFeedbackCount}{" "}
              {summaryFeedbackCount === 1 ? "avaliação" : "avaliações"}
            </span>
          ) : null}
          {summaryError ? (
            <p className={styles.summaryWarning} role="status">
              Não foi possível atualizar o resumo agora. Tente novamente mais
              tarde.
            </p>
          ) : null}
        </div>
      </aside>
      <section className={styles.section} aria-labelledby="feedback-heading">
        <div className={styles.sectionHeading}>
          <div>
            <h2 id="feedback-heading">Avaliações</h2>
            <p>
              {feedbacks.length === 1
                ? "1 pessoa compartilhou sua experiência"
                : `${feedbacks.length} pessoas compartilharam sua experiência`}
            </p>
          </div>
        </div>

        {isAuthenticated ? (
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.formIntro}>
              <h3>Conte como foi para você</h3>
              <p>Uma nota e um comentário ajudam outras pessoas a escolher.</p>
            </div>
            <fieldset className={styles.scoreField}>
              <legend>Sua nota</legend>
              <div className={styles.scoreOptions}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <label
                    className={`${styles.scoreOption} ${
                      value <= (hoveredScore ?? score ?? 0)
                        ? styles.scoreOptionActive
                        : ""
                    }`}
                    key={value}
                    onMouseEnter={() => setHoveredScore(value)}
                    onMouseLeave={() => setHoveredScore(null)}
                    onFocus={() => setHoveredScore(value)}
                    onBlur={() => setHoveredScore(null)}
                  >
                    <input
                      type="radio"
                      name="score"
                      value={value}
                      checked={score === value}
                      onChange={() => setScore(value)}
                      disabled={isSubmitting}
                    />
                    <span aria-hidden="true">★</span>
                    <span className={styles.visuallyHidden}>
                      {value} {value === 1 ? "estrela" : "estrelas"}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className={styles.commentField} htmlFor="feedback-comment">
              Seu comentário
              <textarea
                id="feedback-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={2000}
                rows={4}
                placeholder="O que você achou deste produto?"
                disabled={isSubmitting}
                aria-describedby="feedback-comment-count"
              />
              <span
                className={styles.characterCount}
                id="feedback-comment-count"
              >
                {comment.length}/2000 caracteres
              </span>
            </label>
            {error ? (
              <p className={styles.error} role="alert">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className={styles.success} role="status">
                {success}
              </p>
            ) : null}
            <button
              className={styles.submitButton}
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Publicando…" : "Publicar avaliação"}
            </button>
          </form>
        ) : (
          <aside className={styles.loginPrompt}>
            <div className={styles.loginMark} aria-hidden="true">
              ✳
            </div>
            <div>
              <h3>Já usou este produto?</h3>
              <p>Entre na sua conta para compartilhar sua avaliação.</p>
            </div>
            <Link className={styles.loginButton} href="/auth/sign-in">
              Entrar para avaliar
            </Link>
          </aside>
        )}

        <div className={styles.feedbackList} aria-live="polite">
          {feedbacks.length ? (
            feedbacks.map((feedback) => (
              <article className={styles.feedbackItem} key={feedback.id}>
                <header className={styles.feedbackHeader}>
                  <ScoreStars
                    score={feedback.score}
                    label={`Nota ${feedback.score} de 5`}
                  />
                  <time dateTime={feedback.created_at}>
                    {formatDate(feedback.created_at)}
                  </time>
                </header>
                <p>{feedback.comment}</p>
              </article>
            ))
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyMark} aria-hidden="true">
                ★
              </span>
              <h3>Seja a primeira pessoa a avaliar</h3>
              <p>Conte como foi sua experiência e ajude outras pessoas.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
