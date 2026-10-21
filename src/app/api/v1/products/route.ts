import { createHash, timingSafeEqual } from "node:crypto";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";
import { decodeProductCursor, listProducts } from "@/lib/products";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

const productInputSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(2000).optional(),
  external_link: z.string().trim().url().max(2048),
  image_url: z.string().trim().url().max(2048),
});

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function isAuthorized(request: Request) {
  const expected = process.env.PRODUCTS_ADMIN_API_KEY;
  if (!expected) {
    return false;
  }

  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(header);
  const provided = match?.[1]?.trim() ?? "";
  const expectedDigest = createHash("sha256").update(expected, "utf8").digest();
  const providedDigest = createHash("sha256").update(provided, "utf8").digest();

  return (
    provided.length > 0 &&
    provided.length <= 1024 &&
    timingSafeEqual(expectedDigest, providedDigest)
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cursorParam = url.searchParams.get("cursor");
  const cursor = cursorParam === null ? null : decodeProductCursor(cursorParam);

  if (cursorParam !== null && !cursor) {
    return NextResponse.json(
      { error: "O cursor informado é inválido." },
      { status: 400 },
    );
  }

  try {
    const result = await listProducts(cursor);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to list products:", error);
    return NextResponse.json(
      { error: "Não foi possível carregar os produtos agora." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
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

  const validation = productInputSchema.safeParse(body);
  if (
    !validation.success ||
    !isHttpUrl(validation.data.external_link) ||
    !isHttpUrl(validation.data.image_url)
  ) {
    return NextResponse.json(
      {
        error: "Confira os dados informados.",
        fields: validation.success
          ? {
              external_link: isHttpUrl(validation.data.external_link)
                ? undefined
                : ["Informe um endereço HTTP ou HTTPS válido."],
              image_url: isHttpUrl(validation.data.image_url)
                ? undefined
                : ["Informe um endereço HTTP ou HTTPS válido."],
            }
          : validation.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("products")
      .insert({
        id: nanoid(),
        name: validation.data.name,
        description: validation.data.description || null,
        external_link: validation.data.external_link,
        image_url: validation.data.image_url,
      })
      .select("id,name,description,image_url,external_link")
      .single();

    if (error || !data) {
      console.error("Failed to create product in Supabase:", error);
      return NextResponse.json(
        { error: "Não foi possível cadastrar o produto agora." },
        { status: 500 },
      );
    }

    return NextResponse.json({ product: data }, { status: 201 });
  } catch (error) {
    console.error("Product creation request failed:", error);
    return NextResponse.json(
      { error: "Não foi possível cadastrar o produto agora." },
      { status: 500 },
    );
  }
}
