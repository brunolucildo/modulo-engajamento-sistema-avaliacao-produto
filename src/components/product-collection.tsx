"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";

type ProductsResponse = {
  products: Product[];
  nextCursor: string | null;
};

function isProductsResponse(value: unknown): value is ProductsResponse {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const response = value as Partial<ProductsResponse>;
  return (
    Array.isArray(response.products) &&
    (typeof response.nextCursor === "string" || response.nextCursor === null)
  );
}

function ProductCard({
  product,
  priority,
}: {
  product: Product;
  priority: boolean;
}) {
  return (
    <article className="product-card">
      <div className="product-card-image-wrap" aria-hidden="true">
        <Image
          className="product-card-image"
          src={product.image}
          alt=""
          fill
          unoptimized
          loading={priority ? "eager" : "lazy"}
          sizes="(max-width: 420px) 100vw, (max-width: 900px) 50vw, 33vw"
        />
      </div>
      <div className="product-card-body">
        <h3 className="product-card-title">
          <Link href={`/products/${encodeURIComponent(product.id)}`}>
            {product.name}
          </Link>
        </h3>
        <p className="product-card-price">
          {product.price || "Preço não informado"}
        </p>
        <a
          className="product-card-link"
          href={product.link}
          target="_blank"
          rel="noreferrer noopener"
        >
          Visitar produto <span aria-hidden="true">↗</span>
        </a>
      </div>
    </article>
  );
}

export default function ProductCollection({
  initialProducts,
  initialCursor,
  initialError,
}: {
  initialProducts: Product[];
  initialCursor: string | null;
  initialError: boolean;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [cursor, setCursor] = useState(initialCursor);
  const [hasError, setHasError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const busy = useRef(false);
  const sentinel = useRef<HTMLDivElement>(null);
  const isInitialFailure =
    initialError && products.length === 0 && cursor === null;

  const loadProducts = useCallback(async () => {
    if (busy.current || loading || (!cursor && !isInitialFailure)) {
      return;
    }

    busy.current = true;
    setLoading(true);
    setHasError(false);

    try {
      const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : "";
      const response = await fetch(`/api/v1/products${query}`, {
        headers: { Accept: "application/json" },
      });
      const payload: unknown = await response.json();

      if (!response.ok || !isProductsResponse(payload)) {
        throw new Error("Não foi possível carregar os produtos.");
      }

      setProducts((current) => {
        const currentIds = new Set(current.map((product) => product.id));
        const newProducts = payload.products.filter(
          (product) => !currentIds.has(product.id),
        );
        return cursor ? [...current, ...newProducts] : payload.products;
      });

      const nextCursor =
        payload.products.length === 0 || payload.nextCursor === cursor
          ? null
          : payload.nextCursor;
      setCursor(nextCursor);
    } catch {
      setHasError(true);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }, [cursor, isInitialFailure, loading]);

  useEffect(() => {
    const target = sentinel.current;
    if (
      !target ||
      !cursor ||
      hasError ||
      typeof IntersectionObserver === "undefined"
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadProducts();
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [cursor, hasError, loadProducts]);

  if (products.length === 0 && !loading && !hasError && !cursor) {
    return (
      <div className="product-empty">
        <h3>O catálogo está começando</h3>
        <p>
          Ainda não há produtos por aqui. Volte em breve para descobrir as
          primeiras novidades.
        </p>
      </div>
    );
  }

  return (
    <>
      {products.length > 0 && (
        <div className="product-grid">
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 3}
            />
          ))}
        </div>
      )}
      {hasError ? (
        <div className="product-list-error" role="alert">
          <h3>Não foi possível carregar os produtos</h3>
          <p>Confira sua conexão e tente novamente.</p>
          <button
            className="product-retry"
            type="button"
            onClick={() => void loadProducts()}
            disabled={loading}
          >
            {loading ? "Carregando…" : "Tentar novamente"}
          </button>
        </div>
      ) : loading ? (
        <p className="product-list-status" role="status" aria-live="polite">
          Carregando produtos…
        </p>
      ) : cursor ? (
        <div className="product-list-status">
          <button
            className="product-retry"
            type="button"
            onClick={() => void loadProducts()}
          >
            Carregar mais produtos
          </button>
        </div>
      ) : products.length > 0 ? (
        <p className="product-list-status" role="status">
          Você chegou ao fim do catálogo.
        </p>
      ) : null}
      {cursor && (
        <div className="product-sentinel" ref={sentinel} aria-hidden="true" />
      )}
    </>
  );
}
