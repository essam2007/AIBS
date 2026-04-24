import type { NewsItem } from '@/lib/types'
import { fetchRSS } from './base'

const YAHOO_RSS = 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=CL%3DF%2CBZ%3DF%2CNG%3DF%2CXLE%2CXOM%2CCVX&region=US&lang=en-US'

export async function fetchLatest(): Promise<NewsItem[]> {
  return fetchRSS(YAHOO_RSS, 'Yahoo Finance', 'https://finance.yahoo.com', 'markets', 12)
}

export function normalize(raw: NewsItem): NewsItem {
  return { ...raw, source: 'Yahoo Finance' }
}
