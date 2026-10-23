import { NextResponse } from "next/server";

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

  if (
    typeof body !== "object" ||
    body === null ||
    !("theme" in body) ||
    (body.theme !== "light" && body.theme !== "dark")
  ) {
    return NextResponse.json(
      { error: "Informe um tema válido." },
      { status: 400 },
    );
  }

  const response = NextResponse.json({ theme: body.theme });
  response.cookies.set("engaja_theme", body.theme, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
