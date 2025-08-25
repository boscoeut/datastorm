
SELECT cron.schedule('tesla-news-fetcher-job', '*/5 * * * *', 'SELECT call_tesla_news_fetcher()');

-- SELECT * FROM cron.job;
-- SELECT cron.unschedule('tesla-news-fetcher-job');