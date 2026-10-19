# Engaja — criação de conta

Aplicação Next.js para o fluxo inicial de criação de contas, com formulário
validado no cliente e na API e persistência no Supabase.

## Requisitos

- Bun (versão indicada no `package.json`)
- Um projeto Supabase com a migration deste repositório aplicada

## Configuração

1. Instale as dependências:

   ```bash
   bun install
   ```

2. Copie `.env.example` para `.env.local` e configure `SUPABASE_URL` e
   `SUPABASE_SERVICE_ROLE_KEY`. A chave de service role deve permanecer apenas
   no servidor e nunca ser exposta em variáveis `NEXT_PUBLIC_*`.
3. Aplique `supabase/migrations/20261019000000_create_accounts.sql` ao projeto
   Supabase.
4. Inicie o servidor local:

   ```bash
   bun run dev
   ```

Abra [http://localhost:3000/auth/sign-up](http://localhost:3000/auth/sign-up).

## Rotas

- `GET /auth/sign-up`: formulário de criação de conta.
- `POST /api/v1/sign-up`: valida os dados, gera hash bcrypt e cria a conta.
- `GET /auth/sign-up/success`: confirmação de cadastro.

O endpoint retorna `400` para dados inválidos, `409` para email já cadastrado,
`201` para criação e `500` para falhas inesperadas.

## Verificações

```bash
bun run typecheck
bun run lint
bun run build
```
