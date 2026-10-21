import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth-session";
import { signInSchema } from "@/lib/sign-in-schema";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const invalidCredentials = () =>
  NextResponse.json({ error: "Email ou senha inválidos." }, { status: 401 });

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "O corpo da requisição deve ser um JSON válido." },
      { status: 400 },
    );
  }

  const validation = signInSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Confira os dados informados.",
        fields: validation.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const supabase = createSupabaseAdmin();
    const { data: account, error } = await supabase
      .from("accounts")
      .select("id, first_name, last_name, email, password")
      .eq("email", validation.data.email)
      .maybeSingle();

    if (error) {
      console.error("Failed to look up sign-in account:", error);
      return NextResponse.json(
        { error: "Não foi possível entrar agora. Tente novamente." },
        { status: 500 },
      );
    }

    if (
      !account ||
      !(await bcrypt.compare(validation.data.password, account.password))
    ) {
      return invalidCredentials();
    }

    const token = createSessionToken({
      id: account.id,
      firstName: account.first_name,
      lastName: account.last_name,
      email: account.email,
    });
    const response = NextResponse.json({
      message: "Login realizado com sucesso.",
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Sign-in request failed:", error);
    return NextResponse.json(
      { error: "Não foi possível entrar agora. Tente novamente." },
      { status: 500 },
    );
  }
}
