# AIBS — Gulf Oil Desk

A full-stack oil trading platform built with Next.js 15, Prisma, and NextAuth.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fessam2007%2FAIBS)

## Features

- **Dashboard** — real-time trading overview and portfolio summary
- **Markets** — live oil price charts powered by TradingView
- **Deals** — manage and track trading deals
- **Listings** — browse available oil listings
- **Brokers** — broker directory and management
- **News** — industry news feed
- **Documents** — document management
- **AI Assistant** — Bloomberg-style AI trading assistant
- **Authentication** — secure login via NextAuth

## Tech Stack

- [Next.js 15](https://nextjs.org/) — React framework with App Router
- [Prisma](https://www.prisma.io/) — database ORM
- [NextAuth](https://next-auth.js.org/) — authentication
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [Radix UI](https://www.radix-ui.com/) — accessible UI components
- [Recharts](https://recharts.org/) — charting library

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, NEXTAUTH_SECRET, etc.
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Deploy

Click the **Deploy with Vercel** button above, or run:

```bash
npx vercel
```

Set the required environment variables in your Vercel project settings:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Random secret for NextAuth |
| `NEXTAUTH_URL` | Your deployed app URL |
