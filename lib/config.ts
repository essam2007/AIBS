export const CONFIG = {
  appName: 'OilDesk',
  appVersion: '2.0',

  news: {
    yahoo:       process.env.NEWS_YAHOO       !== 'false',
    wsj:         process.env.NEWS_WSJ         !== 'false',
    ft:          process.env.NEWS_FT          !== 'false',
    reuters:     process.env.NEWS_REUTERS     !== 'false',
    cnbc:        process.env.NEWS_CNBC        !== 'false',
    marketwatch: process.env.NEWS_MARKETWATCH !== 'false',
    oilprice:    process.env.NEWS_OILPRICE    !== 'false',
    twitter:     process.env.NEWS_TWITTER     !== 'false',
  },

  twitter: {
    bearerToken:      process.env.TWITTER_BEARER_TOKEN ?? '',
    accounts:         (process.env.TWITTER_ACCOUNTS ?? 'zerohedge,watcherguru,WalterBloomberg').split(','),
    zerohedge:        process.env.TWITTER_ACCOUNT_ZEROHEDGE    ?? 'zerohedge',
    watcherGuru:      process.env.TWITTER_ACCOUNT_WATCHER_GURU ?? 'watcherguru',
    bloombergWalter:  process.env.TWITTER_ACCOUNT_BLOOMBERG    ?? 'WalterBloomberg',
  },

  eia: {
    apiKey:   process.env.EIA_API_KEY ?? '',
    baseUrl:  'https://api.eia.gov/v2',
  },

  tradingEconomics: {
    apiKey:  process.env.TRADING_ECONOMICS_API_KEY ?? '',
    baseUrl: 'https://api.tradingeconomics.com',
  },

  finnhub: {
    apiKey:  process.env.FINNHUB_API_KEY ?? '',
    baseUrl: 'https://finnhub.io/api/v1',
  },

  anthropic: {
    apiKey:    process.env.ANTHROPIC_API_KEY ?? '',
    model:     process.env.ANTHROPIC_MODEL   ?? 'claude-haiku-4-5-20251001',
    maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS    ?? '1500'),
    timeoutMs: parseInt(process.env.ASSISTANT_TIMEOUT_MS    ?? '6000'),
  },

  cache: {
    newsTtl:      5  * 60 * 1000,
    marketTtl:    30 * 1000,
    calendarTtl:  15 * 60 * 1000,
    assistantTtl: 60 * 1000,
  },

  rateLimit: {
    assistantReqsPerMin: parseInt(process.env.ASSISTANT_RATE_LIMIT ?? '10'),
  },

  disclaimer: 'OilDesk provides market data for informational purposes only. Nothing here constitutes financial advice. Always consult a licensed financial advisor before making investment decisions.',
}
