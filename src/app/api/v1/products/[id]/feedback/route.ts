import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "@/lib/auth-session";
import { feedbackSchema } from "@/lib/feedback-schema";
import { listProductFeedbacks } from "@/lib/product-feedback";
import { getProductSummary } from "@/lib/product-summary";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const supabase = createSupabaseAdmin();
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", id)
      .maybeSingle();

    if (productError) {
      console.error("Failed to check product for feedback:", productError);
      return NextResponse.json(
        { error: "Não foi possível carregar as avaliações agora." },
        { status: 500 },
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 },
      );
    }

    const feedbacks = await listProductFeedbacks(id);
    return NextResponse.json({ feedbacks });
  } catch (error) {
    console.error("Feedback GET request failed:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar as avaliações agora." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  let user: SessionUser | null;
  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error("Failed to verify feedback session:", error);
    return NextResponse.json(
      { error: "Não foi possível verificar sua sessão agora." },
      { status: 500 },
    );
  }

  if (!user) {
    return NextResponse.json(
      { error: "Entre na sua conta para avaliar este produto." },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "O corpo da requisição deve ser um JSON válido." },
      { status: 400 },
    );
  }

  const validation = feedbackSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        error:
          "Informe uma nota de 1 a 5 e um comentário de até 2000 caracteres.",
        fields: validation.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { id: productId } = await params;

  try {
    const supabase = createSupabaseAdmin();
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name")
      .eq("id", productId)
      .maybeSingle();

    if (productError) {
      console.error("Failed to check product for feedback:", productError);
      return NextResponse.json(
        { error: "Não foi possível salvar sua avaliação agora." },
        { status: 500 },
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 },
      );
    }

    const { data: feedback, error } = await supabase
      .from("products_feedbacks")
      .insert({
        id: nanoid(),
        product_id: productId,
        created_by: user.id,
        score: validation.data.score,
        comment: validation.data.comment,
      })
      .select("id, score, comment, created_at")
      .single();

    if (error || !feedback) {
      console.error("Failed to create product feedback:", error);
      return NextResponse.json(
        { error: "Não foi possível salvar sua avaliação agora." },
        { status: 500 },
      );
    }

    let summary = {
      summary: null as string | null,
      feedbackCount: 0,
      summaryError: true,
    };
    try {
      const feedbacks = await listProductFeedbacks(productId);
      summary = await getProductSummary(productId, product.name, feedbacks);
    } catch (summaryError) {
      console.error(
        "Feedback was saved, but its product summary could not be updated:",
        summaryError,
      );
    }

    return NextResponse.json({ feedback, summary }, { status: 201 });
  } catch (error) {
    console.error("Feedback POST request failed:", error);
    return NextResponse.json(
      { error: "Não foi possível salvar sua avaliação agora." },
      { status: 500 },
    );
  }
}
