import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeedbackPanel } from "@/components/feedback-panel";
import { getCurrentUser, type SessionUser } from "@/lib/auth-session";
import type { ProductFeedback } from "@/lib/feedback-schema";
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
    description: string | null;
    image_url: string | null;
    external_link: string | null;
  } | null = null;
  let productError: unknown;
  let productLoadError = false;

  try {
    supabase = createSupabaseAdmin();
    [user, { data: product, error: productError }] = await Promise.all([
      getCurrentUser(),
      supabase
        .from("products")
        .select("id, name, description, image_url, external_link")
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
    const result = await supabase
      .from("products_feedbacks")
      .select("id, score, comment, created_at")
      .eq("product_id", id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (result.error) {
      console.error("Failed to load product feedback:", result.error);
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

    feedbacks = (result.data ?? []) as ProductFeedback[];
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

  return (
    <div className={styles.page}>
      <Link className={styles.backLink} href="/">
        <span aria-hidden="true">←</span> Todos os produtos
      </Link>
      <article className={styles.product}>
        {product.image_url ? (
          <Image
            className={styles.productImage}
            src={product.image_url}
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
          {product.description ? (
            <p>{product.description}</p>
          ) : (
            <p className={styles.muted}>
              Ainda não há uma descrição para este produto.
            </p>
          )}
          {product.external_link ? (
            <a
              className={styles.productLink}
              href={product.external_link}
              target="_blank"
              rel="noreferrer"
            >
              Conheça o produto <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </article>
      <FeedbackPanel
        productId={id}
        initialFeedbacks={feedbacks}
        isAuthenticated={Boolean(user)}
      />
    </div>
  );
}
