import "server-only";

import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const PRODUCTS_PAGE_SIZE = 12;

export type Product = {
  id: string;
  name: string;
  price: string;
  link: string;
  image: string;
  averageScore: number | null;
  feedbackCount: number;
};

export type ProductCursor = {
  createdAt: string;
  id: string;
};

export function decodeProductCursor(value: string): ProductCursor | null {
  if (value.length > 512 || !/^[A-Za-z0-9_-]+$/.test(value)) {
    return null;
  }

  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    if (Buffer.from(decoded, "utf8").toString("base64url") !== value) {
      return null;
    }

    const cursor: unknown = JSON.parse(decoded);
    if (typeof cursor !== "object" || cursor === null) {
      return null;
    }

    const candidate = cursor as Partial<ProductCursor>;
    const timestampPattern =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;

    if (
      typeof candidate.createdAt !== "string" ||
      !timestampPattern.test(candidate.createdAt) ||
      !Number.isFinite(Date.parse(candidate.createdAt)) ||
      typeof candidate.id !== "string" ||
      !/^[A-Za-z0-9_-]{1,64}$/.test(candidate.id)
    ) {
      return null;
    }

    return { createdAt: candidate.createdAt, id: candidate.id };
  } catch {
    return null;
  }
}

function encodeProductCursor(cursor: ProductCursor) {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export async function listProducts(cursor: ProductCursor | null = null) {
  const supabase = createSupabaseAdmin();
  let query = supabase
    .from("products")
    .select("id,name,price,link,image,created_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(PRODUCTS_PAGE_SIZE + 1);

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("Failed to query products in Supabase:", error);
    throw new Error("Could not retrieve products.");
  }

  const rows = data ?? [];
  const hasMore = rows.length > PRODUCTS_PAGE_SIZE;
  const page = rows.slice(0, PRODUCTS_PAGE_SIZE);
  const lastProduct = page.at(-1);
  const productIds = page.map(({ id }) => id);
  const ratingsByProductId = new Map<
    string,
    { averageScore: number; feedbackCount: number }
  >();

  if (productIds.length > 0) {
    const { data: ratings, error: ratingsError } = await supabase
      .from("product_feedback_ratings")
      .select("product_id, average_score, feedback_count")
      .in("product_id", productIds);

    if (ratingsError) {
      console.error("Failed to query product feedback ratings:", ratingsError);
      throw new Error("Could not retrieve product feedback ratings.");
    }

    for (const rating of ratings ?? []) {
      ratingsByProductId.set(rating.product_id, {
        averageScore: rating.average_score,
        feedbackCount: rating.feedback_count,
      });
    }
  }

  return {
    products: page.map(({ id, name, price, link, image }) => {
      const rating = ratingsByProductId.get(id);
      return {
        id,
        name,
        price,
        link,
        image,
        averageScore: rating?.averageScore ?? null,
        feedbackCount: rating?.feedbackCount ?? 0,
      };
    }) satisfies Product[],
    nextCursor:
      hasMore && lastProduct
        ? encodeProductCursor({
            createdAt: lastProduct.created_at,
            id: lastProduct.id,
          })
        : null,
  };
}
