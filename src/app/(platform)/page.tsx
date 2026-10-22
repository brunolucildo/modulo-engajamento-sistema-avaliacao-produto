import type { Metadata } from "next";
import ProductCollection from "@/components/product-collection";
import { listProducts, type Product } from "@/lib/products";

export const metadata: Metadata = {
  title: "Descubra produtos | Engaja",
};

export default async function HomePage() {
  let initialProducts: Product[] = [];
  let nextCursor: string | null = null;
  let initialError = false;

  try {
    const firstPage = await listProducts();
    initialProducts = firstPage.products;
    nextCursor = firstPage.nextCursor;
  } catch (error) {
    console.error("Failed to load the initial product catalog:", error);
    initialError = true;
  }

  return (
    <div className="home-content">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-copy">
          <p className="home-intro">Ideias em movimento</p>
          <h1 id="home-title">Descubra produtos que começam conversas.</h1>
          <p className="home-hero-description">
            Conheça novidades, explore o que está sendo criado e encontre sua
            próxima ideia favorita.
          </p>
          <a className="home-hero-link" href="#produtos">
            Explorar produtos
            <span aria-hidden="true">↓</span>
          </a>
        </div>
        <div className="conversation-illustration" aria-hidden="true">
          <div className="conversation-orbit conversation-orbit-outer" />
          <div className="conversation-orbit conversation-orbit-inner" />
          <div className="conversation-spark conversation-spark-one" />
          <div className="conversation-spark conversation-spark-two" />
          <div className="conversation-bubble conversation-bubble-back">
            <span />
            <span />
            <span />
          </div>
          <div className="conversation-bubble conversation-bubble-front">
            <span />
            <span />
            <span />
          </div>
          <div className="conversation-sun" />
        </div>
        <div className="home-hero-note">
          <span className="hero-note-dot" />
          Um catálogo aberto a novas perspectivas
        </div>
      </section>

      <section
        className="product-section"
        id="produtos"
        aria-labelledby="products-title"
      >
        <div className="product-section-heading">
          <div>
            <h2 id="products-title">Encontre algo novo</h2>
            <p>Produtos para conhecer, experimentar e levar adiante.</p>
          </div>
          <span className="product-section-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </div>
        <ProductCollection
          initialProducts={initialProducts}
          initialCursor={nextCursor}
          initialError={initialError}
        />
      </section>
    </div>
  );
}
