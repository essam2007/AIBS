# Gulf Oil Desk — Configuration Guide

## Quick Start (Zero Config)

The app deploys and runs with **no environment variables required**. Every data provider has a graceful fallback to realistic mock data, so you can evaluate the full UI without any API keys.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the keys you need:

```bash
cp .env.example .env.local
```

---

## Provider Configuration

### AI Assistant — `ANTHROPIC_API_KEY`

| Variable | Default | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | *(none)* | Anthropic API key. Without it, the assistant returns realistic mock responses. |
| `ANTHROPIC_MODEL` | `claude-haiku-4-5-20251001` | Model for fast, cost-efficient responses. Use `claude-sonnet-4-5` for higher quality. |
| `ANTHROPIC_MAX_TOKENS` | `1500` | Max tokens per assistant response. |
| `ASSISTANT_TIMEOUT_MS` | `6000` | Latency budget in ms (default 6 seconds). |
| `ASSISTANT_RATE_LIMIT` | `10` | Max requests per minute per IP. |

**Without a key:** Returns structured mock market summaries with correct schema (summary, bullets, links, disclaimer).

---

### Economic Calendar — `TRADING_ECONOMICS_API_KEY`

| Variable | Default | Description |
|---|---|---|
| `TRADING_ECONOMICS_API_KEY` | *(none)* | [Trading Economics](https://tradingeconomics.com/api/) key. Free tier available. |
| `FINNHUB_API_KEY` | *(none)* | Alternative: [Finnhub.io](https://finnhub.io/) free calendar API. |

**Without a key:** Uses mock calendar with realistic EIA, FOMC, CPI, NFP, and OPEC events.

---

### EIA Oil Inventory — `EIA_API_KEY`

| Variable | Default | Description |
|---|---|---|
| `EIA_API_KEY` | *(none)* | [EIA Open Data](https://www.eia.gov/opendata/) key. Free registration. |

**Without a key:** Uses mock EIA inventory data (crude, gasoline, distillate stocks with rolling 7/30/90-day changes).

---

### Twitter / X Stream — `TWITTER_BEARER_TOKEN`

| Variable | Default | Description |
|---|---|---|
| `TWITTER_BEARER_TOKEN` | *(none)* | X API v2 Bearer Token. Without this the source is silently skipped. |
| `TWITTER_ACCOUNT_ZEROHEDGE` | `zerohedge` | Overridable handle for ZeroHedge. |
| `TWITTER_ACCOUNT_WATCHER_GURU` | `watcherguru` | Overridable handle for Watcher.Guru. |
| `TWITTER_ACCOUNT_BLOOMBERG` | `WalterBloomberg` | Overridable handle for Walter Bloomberg. |

**Swapping the proxy:** The abstraction lives in `data/providers/newsProviders/x.ts`. Replace `fetchUserTimeline()` with any proxy implementation (e.g. Nitter, RapidAPI Twitter) without changing the rest of the codebase.

---

## Disabling Paywalled Sources

Every news source has an on/off flag. Set any of these to `"false"` in `.env.local`:

```env
NEWS_WSJ=false      # Wall Street Journal (headlines only even when enabled)
NEWS_FT=false       # Financial Times (headlines only)
NEWS_TWITTER=false  # Twitter/X (requires API key anyway)
NEWS_YAHOO=false    # Yahoo Finance RSS
NEWS_REUTERS=false  # Reuters RSS
NEWS_CNBC=false     # CNBC RSS
NEWS_MARKETWATCH=false
NEWS_OILPRICE=false
```

---

## Swapping Data Providers

Each provider is a standalone module in `data/providers/`. To swap:

1. Create a new file in the relevant sub-directory (e.g., `newsProviders/bloomberg.ts`)
2. Export `fetchLatest(): Promise<NewsItem[]>` and `normalize(raw): NewsItem`
3. Import and add it to `app/api/news/route.ts`

The `NewsItem` schema is the universal contract — all providers must normalize to it.

```ts
// data/providers/newsProviders/bloomberg.ts
import type { NewsItem } from '@/lib/types'

export async function fetchLatest(): Promise<NewsItem[]> {
  // ... your fetch logic
}

export function normalize(raw: unknown): NewsItem {
  // ... map to NewsItem
}
```

---

## Architecture Overview

```
app/
├── api/
│   ├── news/route.ts          # Aggregates all news providers
│   ├── calendar/route.ts      # Economic calendar
│   ├── energy/route.ts        # EIA inventory + equities
│   ├── assistant/query/route.ts  # AI assistant (POST)
│   ├── market-data/route.ts   # Real-time quotes
│   └── chart-data/route.ts    # OHLCV candles
├── page.tsx                   # Dashboard
├── charts/page.tsx            # Chart with tabs
├── news/page.tsx              # News feed
├── calendar/page.tsx          # Economic calendar
├── oil/page.tsx               # Oil Desk (EnergyPanel)
├── deals/page.tsx             # Deal Desk (buy/sell oil)
└── assistant/page.tsx         # AI assistant

data/providers/
├── newsProviders/             # yahoo, wsj, ft, x, base
├── calendarProviders/         # tradingEconomics
└── marketDataProviders/       # oil (EIA), equities

components/
├── charts/ChartWidget.tsx     # Full-featured chart + tabs
├── news/NewsFeed.tsx          # Filterable news feed
├── calendar/Calendar.tsx      # Economic calendar
├── energy/EnergyPanel.tsx     # Oil metrics + news
└── assistant/AssistantPanel.tsx  # AI chat interface

hooks/
├── useNewsFeedStore.ts        # News state + filters
├── useCalendarStore.ts        # Calendar state
├── useChartStore.ts           # Chart settings + watchlist
└── useAssistantStore.ts       # Chat history

lib/
├── types.ts      # Shared types (NewsItem, EconomicEvent, OilMetric…)
├── sentiment.ts  # Keyword-based sentiment scoring
├── ticker.ts     # Symbol extraction from text
├── cache.ts      # In-memory cache with TTL
└── config.ts     # All env-based configuration
```

---

## Deal Desk

The Deal Desk (`/deals`) is a bulletin board for oil buyers and sellers. It is **indicative only** — Gulf Oil Desk is not a broker or counterparty.

Current implementation uses in-memory state. To persist deals:
1. Add a database (e.g., Supabase, PlanetScale, Turso)
2. Replace the `useState` in `app/deals/page.tsx` with a `/api/deals` CRUD endpoint
3. Add auth (e.g., NextAuth) to gate posting

---

## Deployment

### Vercel (recommended)

```bash
vercel deploy
```

Set environment variables in the Vercel dashboard under **Project → Settings → Environment Variables**.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
CMD ["npm", "start"]
```

---

*Gulf Oil Desk v2.0 — For informational purposes only. Not financial advice.*
