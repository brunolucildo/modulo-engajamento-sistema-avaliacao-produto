# Engaja — Account Creation

Next.js application for the initial account creation flow, with a form validated
on the client and by the API, and data persisted in Supabase.

## Requirements

- Bun (version specified in `package.json`)
- A Supabase project with this repository's migration applied

## Setup

1. Install the dependencies:

   ```bash
   bun install
   ```

2. Copy `.env.example` to `.env.local` and configure `SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY`. The service role key must remain on the server
   and must never be exposed in `NEXT_PUBLIC_*` variables.
3. Apply `supabase/migrations/20261019000000_create_accounts.sql` to your
  Supabase project.
4. Start the local server:

   ```bash
   bun run dev
   ```

Open [http://localhost:3000/auth/sign-up](http://localhost:3000/auth/sign-up).

## Routes

- `GET /auth/sign-up`: account creation form.
- `POST /api/v1/sign-up`: validates the data, generates a bcrypt hash, and
  creates the account.
- `GET /auth/sign-up/success`: sign-up confirmation.

The endpoint returns `400` for invalid data, `409` if the email is already
registered, `201` when the account is created, and `500` for unexpected errors.

## Checks

```bash
bun run typecheck
bun run lint
bun run build
```
