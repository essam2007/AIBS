# Gulf Oil Desk

Professional oil & energy market terminal — live prices, TradingView-quality charts, real-time news aggregation, and oil market intelligence.

Built with Next.js 16, TypeScript, Tailwind CSS, and TradingView Lightweight Charts.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fessam2007%2FAIBS&project-name=gulf-oil-desk&repository-name=gulf-oil-desk)

The app deploys as-is with zero configuration. No environment variables required.

### What gets deployed

- **5 pages:** Dashboard, Markets, Charts, Discover (news), Oil Desk
- **3 API routes:** `/api/market-data`, `/api/chart-data`, `/api/news`
- All routes auto-fallback to curated mock data if external APIs (Yahoo Finance, RSS feeds) are blocked by the hosting provider.

## Run locally

Requires Node.js 18+.

```bash
git clone https://github.com/essam2007/AIBS.git
cd AIBS
git checkout claude/add-live-market-news-xAfXH
npm install
npm run dev
```

Open http://localhost:3000

## Features

### Live market data
- Yahoo Finance API proxy (30-second refresh)
- WTI, Brent, Natural Gas, Gold, Silver, S&P 500, NASDAQ, Dow, VIX, BTC, ETH, USD Index
- Graceful fallback to curated prices when blocked

### TradingView-quality charts
- Lightweight Charts v5
- Candlestick, Line, Area, Bar chart types
- SMA 20 indicator, volume histogram
- 7 timeframes: 1D, 5D, 1M, 3M, 6M, 1Y, 2Y
- Crosshair with OHLCV hover data, zoom, pan

### News & Discover
- Live RSS aggregation: Reuters, CNBC, MarketWatch, OilPrice.com
- Category filters: Oil, Markets, Economy, Business
- Trending topics + followed X/Twitter accounts panel
- AI Market Brief card

### Oil Desk
- WTI/Brent spread, regional benchmarks (Gulf, West Africa, North Sea, Americas, Asia Pacific)
- OPEC+ quota tracker
- Tanker rates, rig counts, strategic reserve, Cushing stocks
- Oil-specific news feed
- "List Your Oil" CTA

### Notifications
- Slide-in panel from right
- Categorized alerts (Price Alert, News, Market, Oil)
- Unread count badge, mark read/dismiss
- ESC to close

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + CSS custom properties
- **Charts:** lightweight-charts v5
- **Data fetching:** SWR
- **News parsing:** Custom RSS XML parser
- **Design:** whiterock.fi-inspired dark terminal aesthetic

## License

MIT
