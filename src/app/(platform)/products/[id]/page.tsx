import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeedbackPanel } from "@/components/feedback-panel";
import { getCurrentUser, type SessionUser } from "@/lib/auth-session";
import type { ProductFeedback } from "@/lib/feedback-schema";
import { listProductFeedbacks } from "@/lib/product-feedback";
import { getProductSummary } from "@/lib/product-summary";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import styles from "./page.module.css";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  let supabase: ReturnType<typeof createSupabaseAdmin> | null = null;
  let user: SessionUser | null;
  let product: {
    id: string;
    name: string;
    price: string;
    image: string;
    link: string;
  } | null = null;
  let productError: unknown;
  let productLoadError = false;

  try {
    supabase = createSupabaseAdmin();
    [user, { data: product, error: productError }] = await Promise.all([
      getCurrentUser(),
      supabase
        .from("products")
        .select("id, name, price, image, link")
        .eq("id", id)
        .maybeSingle(),
    ]);
    productLoadError = Boolean(productError);
    if (productError) {
      console.error("Failed to load product details:", productError);
    }
  } catch (error) {
    console.error("Product details request failed:", error);
    productLoadError = true;
    user = null;
  }

  if (productLoadError || !supabase) {
    return (
      <div className={styles.page}>
        <section className={styles.notice} role="alert">
          <h1>Não foi possível carregar este produto</h1>
          <p>Tente novamente em instantes.</p>
          <Link href="/">Voltar aos produtos</Link>
        </section>
      </div>
    );
  }

  if (!product) notFound();

  let feedbacks: ProductFeedback[] = [];
  try {
    feedbacks = await listProductFeedbacks(id);
  } catch (error) {
    console.error("Product feedback request failed:", error);
    return (
      <div className={styles.page}>
        <section className={styles.notice} role="alert">
          <h1>Não foi possível carregar as avaliações</h1>
          <p>
            Os detalhes do produto continuam disponíveis. Tente novamente mais
            tarde.
          </p>
          <Link href="/">Voltar aos produtos</Link>
        </section>
      </div>
    );
  }

  let summary: string | null = null;
  let summaryFeedbackCount = 0;
  let summaryError = false;
  try {
    const result = await getProductSummary(id, product.name, feedbacks);
    summary = result.summary;
    summaryFeedbackCount = result.feedbackCount;
    summaryError = result.summaryError;
  } catch (error) {
    console.error("Product feedback summary request failed:", error);
    summaryError = true;
  }

  return (
    <div className={styles.page}>
      <Link className={styles.backLink} href="/">
        <span aria-hidden="true">←</span> Todos os produtos
      </Link>
      <article className={styles.product}>
        {product.image ? (
          <Image
            className={styles.productImage}
            src={product.image}
            alt={`Imagem de ${product.name}`}
            width={800}
            height={640}
            sizes="(max-width: 680px) 100vw, 40vw"
            unoptimized
          />
        ) : (
          <div className={styles.imageFallback} aria-hidden="true">
            {product.name.slice(0, 1)}
          </div>
        )}
        <div className={styles.productCopy}>
          <h1>{product.name}</h1>
          <p className={styles.price}>
            {product.price || "Preço não informado"}
          </p>
          <a
            className={styles.productLink}
            href={product.link}
            target="_blank"
            rel="noreferrer"
          >
            Conheça o produto <span aria-hidden="true">↗</span>
          </a>
        </div>
      </article>
      <FeedbackPanel
        productId={id}
        initialFeedbacks={feedbacks}
        initialSummary={summary}
        initialSummaryFeedbackCount={summaryFeedbackCount}
        initialSummaryError={summaryError}
        isAuthenticated={Boolean(user)}
      />
    </div>
  );
}
