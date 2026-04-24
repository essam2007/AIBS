/**
 * Twitter/X provider — abstraction layer.
 * Uses X API v2 if TWITTER_BEARER_TOKEN is set, otherwise returns empty (graceful degradation).
 * Swap implementations by changing the fetch function without touching callers.
 */
import type { NewsItem } from '@/lib/types'
import { scoreSentiment, sentimentLabel } from '@/lib/sentiment'
import { extractTickers } from '@/lib/ticker'
import { CONFIG } from '@/lib/config'

interface XTweet {
  id: string
  text: string
  created_at?: string
  author_id?: string
  entities?: { urls?: Array<{ expanded_url: string }> }
}

interface XUser {
  id: string
  username: string
  name: string
}

async function fetchUserTimeline(username: string, token: string): Promise<XTweet[]> {
  // Step 1: resolve user id
  const userRes = await fetch(
    `https://api.twitter.com/2/users/by/username/${username}?user.fields=id,name,username`,
    {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    }
  )
  if (!userRes.ok) return []
  const userData = await userRes.json() as { data?: XUser }
  const userId = userData.data?.id
  if (!userId) return []

  // Step 2: fetch recent tweets
  const tweetRes = await fetch(
    `https://api.twitter.com/2/users/${userId}/tweets?max_results=10&tweet.fields=created_at,entities&expansions=author_id`,
    {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5000),
    }
  )
  if (!tweetRes.ok) return []
  const tweetData = await tweetRes.json() as { data?: XTweet[] }
  return tweetData.data ?? []
}

function tweetToNewsItem(tweet: XTweet, username: string, displayName: string): NewsItem {
  const url = tweet.entities?.urls?.[0]?.expanded_url
    ?? `https://twitter.com/${username}/status/${tweet.id}`
  const score = scoreSentiment(tweet.text)
  return {
    id: `x-${tweet.id}`,
    source: `@${username}`,
    sourceUrl: `https://twitter.com/${username}`,
    title: tweet.text.slice(0, 140),
    summary: tweet.text,
    url,
    publishedAt: tweet.created_at ?? new Date().toISOString(),
    category: 'markets',
    symbols: extractTickers(tweet.text),
    sentiment: score,
    sentimentLabel: sentimentLabel(score),
  }
}

export async function fetchLatest(): Promise<NewsItem[]> {
  const token = CONFIG.twitter.bearerToken
  if (!token) return []   // provider disabled without credentials

  const accounts = [
    { username: CONFIG.twitter.zerohedge,       display: 'ZeroHedge'       },
    { username: CONFIG.twitter.watcherGuru,      display: 'Watcher.Guru'    },
    { username: CONFIG.twitter.bloombergWalter,  display: 'Walter Bloomberg' },
  ]

  const results = await Promise.allSettled(
    accounts.map(a => fetchUserTimeline(a.username, token).then(tweets =>
      tweets.map(t => tweetToNewsItem(t, a.username, a.display))
    ))
  )

  const items: NewsItem[] = []
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...r.value)
  }
  return items
}

export function normalize(raw: NewsItem): NewsItem {
  return raw
}
