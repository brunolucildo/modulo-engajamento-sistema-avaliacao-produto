# Engaja — Product Feedback

Next.js application for product discovery and feedback. People can browse
products publicly, create an account, sign in, and publish product reviews
after authenticating.

## Requirements

- Bun (version specified in `package.json`)
- A Supabase project with this repository's migration applied

## Setup

1. Install the dependencies:

   ```bash
   bun install
   ```

2. Copy `.env.example` to `.env.local` and configure:
   - `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. The service role key must
     remain on the server and must never be exposed in a `NEXT_PUBLIC_*`
     variable.
   - `AUTH_SESSION_SECRET` with at least 32 bytes of random data. This signs
     server-validated session cookies; keep it private and rotate it to
     invalidate existing sessions.
   - `OPENAI_API_KEY` for the server-side Mastra agent that summarizes product
     feedback with GPT-4o mini. Keep it private and never expose it in a
     `NEXT_PUBLIC_*` variable.
3. Apply the migrations in `supabase/migrations/` to your Supabase project, in
   timestamp order:
   - `20261019000000_create_accounts.sql`
   - `20261021000000_create_products.sql`
   - `20261021000001_create_products_feedbacks.sql`
   - `20261022000000_update_products_fields.sql`
   - `20261022000001_create_product_feedback_summaries.sql`
4. Start the local server:

   ```bash
   bun run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to browse products.

## Routes

- `GET /`: public, cursor-paginated product catalog with infinite scrolling.
- `GET /products/[id]`: public product details and reviews.
- `GET /auth/sign-up`: account creation form.
- `GET /auth/sign-in`: sign-in form.
- `POST /api/v1/sign-up`: validates the data, generates a bcrypt hash, and
  creates the account.
- `POST /api/v1/sign-in`: validates credentials and sets a signed, `HttpOnly`
  session cookie.
- `GET /auth/sign-up/success`: sign-up confirmation.
- `GET /api/v1/products`: returns `{ "products": [], "nextCursor": null }` for
  the public catalog; accepts an optional `cursor` query parameter.
- `POST /api/v1/products`: publicly creates products without authentication.
  The JSON body requires string fields `name`, `price`, `link`, and `image`.
  Any caller can add products, so protect this endpoint before exposing it to
  untrusted traffic.
- `GET /api/v1/products/[id]/feedback`: returns public reviews for a product.
- `POST /api/v1/products/[id]/feedback`: creates a review for the authenticated
  user and refreshes the saved AI summary for that product. The JSON body
  accepts an integer `score` from 1 to 5 and a non-empty `comment` of up to
  2000 characters.

The sign-up endpoint returns `400` for invalid data, `409` if the email is
already registered, `201` when the account is created, and `500` for unexpected
errors. Sign-in returns `400` for invalid input, `401` for invalid credentials,
and `200` when a session is created. Product and review endpoints document
their response shapes and status codes in [`docs/api/`](./docs/api/).

## Checks

```bash
bun run typecheck
bun run lint
bun run build
```
