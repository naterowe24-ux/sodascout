-- Lightweight config table for values that need to live in the DB
-- (e.g. the webhook secret the trigger must send to the edge function).
-- No RLS — access is gated by the security-definer trigger function only.
create table if not exists app_config (
  key   text primary key,
  value text not null
);

-- Revoke public access; only superuser / service role can read directly.
revoke all on app_config from anon, authenticated;

insert into app_config (key, value)
values ('webhook_secret', '0vVkp7LqgB5WIb2Q6oYrfen1XGjAh8RExiUamu9K')
on conflict (key) do update set value = excluded.value;

-- Trigger function: fires after each review insert, calls the edge
-- function asynchronously via pg_net (non-blocking HTTP POST).
create or replace function public.on_review_insert()
returns trigger
language plpgsql
security definer           -- runs as owner, can read app_config
set search_path = public
as $$
declare
  _secret text;
begin
  select value into _secret from app_config where key = 'webhook_secret';

  perform
    net.http_post(
      url     := 'https://jfdzztzcgabravamkypb.supabase.co/functions/v1/calculate-sip-score',
      headers := jsonb_build_object(
        'Content-Type',     'application/json',
        'x-webhook-secret', _secret
      ),
      body    := jsonb_build_object('record', row_to_json(new))
    );
  return new;
end;
$$;

-- Attach the trigger to the reviews table.
create trigger calculate_sip_score_on_review
  after insert on reviews
  for each row execute function public.on_review_insert();
