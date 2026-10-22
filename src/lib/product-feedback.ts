import "server-only";

import type { ProductFeedback } from "@/lib/feedback-schema";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const FEEDBACK_PAGE_SIZE = 500;

export async function listProductFeedbacks(
  productId: string,
): Promise<ProductFeedback[]> {
  const supabase = createSupabaseAdmin();
  const feedbacks: ProductFeedback[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabase
      .from("products_feedbacks")
      .select("id, score, comment, created_at")
      .eq("product_id", productId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + FEEDBACK_PAGE_SIZE - 1);

    if (error) {
      console.error("Failed to load all product feedback:", error);
      throw new Error("Could not retrieve product feedback.");
    }

    const page = data ?? [];
    feedbacks.push(...(page as ProductFeedback[]));

    if (page.length < FEEDBACK_PAGE_SIZE) {
      return feedbacks;
    }

    offset += page.length;
  }
}
