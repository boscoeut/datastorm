
declare
  result jsonb;
begin
  select net.http_post(
    url := 'https://duiakhiloobwkgvfrcnl.functions.supabase.co/tesla-news-fetcher',
    headers := jsonb_build_object(
       'Authorization', 'Bearer ' || current_setting('app.settings.SERVICE_ROLE_KEY', true),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('name', 'from pg_cron via pg_net')
  ) into result;

  raise notice 'Edge Function response: %', result;
end;
