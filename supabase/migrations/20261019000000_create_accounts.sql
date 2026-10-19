create table if not exists public.accounts (
  id text primary key,
  first_name text not null,
  last_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  active boolean not null default true,
  email text not null,
  password text not null,
  salt text not null
);

create unique index if not exists accounts_email_lower_unique
  on public.accounts (lower(email));

alter table public.accounts enable row level security;
