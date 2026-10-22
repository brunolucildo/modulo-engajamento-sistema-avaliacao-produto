import "server-only";

import type { ProductFeedback } from "@/lib/feedback-schema";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { productSummaryAgent } from "@/mastra/agents/product-summary-agent";

const FEEDBACKS_PER_BATCH = 20;
const SUMMARY_BATCH_CONCURRENCY = 5;

type StoredProductSummary = {
  summary: string;
  feedback_count: number;
  latest_feedback_id: string;
};

export type ProductSummaryResult = {
  summary: string | null;
  feedbackCount: number;
  summaryError: boolean;
};

async function generateSummary(prompt: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const response = await productSummaryAgent.generate(prompt);
  const summary = response.text.trim();

  if (!summary) {
    throw new Error("The product summary agent returned an empty response.");
  }

  return summary;
}

function chunk<T>(items: T[], size: number) {
  const batches: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
}

async function summarizeFeedback(
  productName: string,
  feedbacks: ProductFeedback[],
) {
  let source = feedbacks.map(
    ({ score, comment }) => `Nota: ${score}/5\nComentário: ${comment}`,
  );

  while (source.length > FEEDBACKS_PER_BATCH) {
    const batches = chunk(source, FEEDBACKS_PER_BATCH);
    const summaries: string[] = [];
    for (const batchGroup of chunk(batches, SUMMARY_BATCH_CONCURRENCY)) {
      summaries.push(
        ...(await Promise.all(
          batchGroup.map((batch) =>
            generateSummary(
              `Resuma os principais pontos destas avaliações do produto "${productName}". ` +
                "Preserve elogios, críticas e divergências sem acrescentar fatos.\n\n" +
                batch.join("\n\n---\n\n"),
            ),
          ),
        )),
      );
    }
    source = summaries;
  }

  return generateSummary(
    `Escreva o resumo geral das avaliações do produto "${productName}" em português brasileiro. ` +
      "Considere todas as notas e comentários abaixo, destaque padrões e opiniões divergentes, " +
      "sem inventar informações. Escreva no máximo três frases.\n\n" +
      source.join("\n\n---\n\n"),
  );
}

export async function getProductSummary(
  productId: string,
  productName: string,
  feedbacks: ProductFeedback[],
): Promise<ProductSummaryResult> {
  const supabase = createSupabaseAdmin();
  const { data: stored, error: loadError } = await supabase
    .from("products_feedback_summaries")
    .select("summary, feedback_count, latest_feedback_id")
    .eq("product_id", productId)
    .maybeSingle();

  if (loadError) {
    console.error("Failed to load product feedback summary:", loadError);
    throw new Error("Could not load the product feedback summary.");
  }

  const latestFeedback = feedbacks[0];
  const isCurrent =
    stored?.feedback_count === feedbacks.length &&
    stored?.latest_feedback_id === latestFeedback?.id;

  if (isCurrent) {
    return {
      summary: stored.summary,
      feedbackCount: stored.feedback_count,
      summaryError: false,
    };
  }

  if (!latestFeedback) {
    return { summary: null, feedbackCount: 0, summaryError: false };
  }

  try {
    const summary = await summarizeFeedback(productName, feedbacks);
    const { error: saveError } = await supabase
      .from("products_feedback_summaries")
      .upsert(
        {
          product_id: productId,
          summary,
          feedback_count: feedbacks.length,
          latest_feedback_id: latestFeedback.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "product_id" },
      );

    if (saveError) {
      throw saveError;
    }

    return {
      summary,
      feedbackCount: feedbacks.length,
      summaryError: false,
    };
  } catch (error) {
    console.error(
      "Failed to generate or save product feedback summary:",
      error,
    );
    const previousSummary = stored as StoredProductSummary | null;
    return {
      summary: previousSummary?.summary ?? null,
      feedbackCount: previousSummary?.feedback_count ?? 0,
      summaryError: true,
    };
  }
}
