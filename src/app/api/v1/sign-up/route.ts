import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { signUpSchema } from "@/lib/sign-up-schema";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

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

  const validation = signUpSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: "Confira os dados informados.",
        fields: validation.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { firstName, lastName, email, password } = validation.data;

  try {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const supabase = createSupabaseAdmin();
    const { error } = await supabase.from("accounts").insert({
      id: nanoid(),
      first_name: firstName,
      last_name: lastName,
      email,
      password: passwordHash,
      salt,
    });

    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "Já existe uma conta cadastrada com este email." },
        { status: 409 },
      );
    }

    if (error) {
      console.error("Failed to create account in Supabase:", error);
      return NextResponse.json(
        { error: "Não foi possível criar sua conta agora." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "Conta criada com sucesso." },
      { status: 201 },
    );
  } catch (error) {
    console.error("Sign-up request failed:", error);
    return NextResponse.json(
      { error: "Não foi possível criar sua conta agora." },
      { status: 500 },
    );
  }
}
