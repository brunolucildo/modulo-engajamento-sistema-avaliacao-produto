create or replace view public.product_feedback_ratings
with (security_invoker = true)
as
select
  product_id,
  round(avg(score)::numeric, 1)::double precision as average_score,
  count(*)::integer as feedback_count
from public.products_feedbacks
group by product_id;

grant select on public.product_feedback_ratings to service_role;
