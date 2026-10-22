create table if not exists public.products_feedback_summaries (
  product_id text primary key references public.products(id) on delete cascade,
  summary text not null,
  feedback_count integer not null check (feedback_count > 0),
  latest_feedback_id text not null,
  updated_at timestamptz not null default now()
);

alter table public.products_feedback_summaries enable row level security;
