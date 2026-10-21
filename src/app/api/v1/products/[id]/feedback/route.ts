import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "@/lib/auth-session";
import { feedbackSchema } from "@/lib/feedback-schema";
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

    const { data: feedbacks, error } = await supabase
      .from("products_feedbacks")
      .select("id, score, comment, created_at")
      .eq("product_id", id)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });

    if (error) {
      console.error("Failed to load product feedback:", error);
      return NextResponse.json(
        { error: "Não foi possível carregar as avaliações agora." },
        { status: 500 },
      );
    }

    return NextResponse.json({ feedbacks: feedbacks ?? [] });
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
      .select("id")
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

    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error) {
    console.error("Feedback POST request failed:", error);
    return NextResponse.json(
      { error: "Não foi possível salvar sua avaliação agora." },
      { status: 500 },
    );
  }
}
