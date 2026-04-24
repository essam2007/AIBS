const BULLISH = [
  'surge', 'surges', 'rally', 'rallies', 'gain', 'gains', 'rise', 'rises', 'rising',
  'higher', 'bullish', 'upside', 'recovery', 'recover', 'rebound', 'strong', 'strength',
  'positive', 'growth', 'boom', 'record high', 'jump', 'jumps', 'advance', 'advances',
  'demand', 'inventory draw', 'outperform', 'upgrade', 'beat', 'beats', 'exceeded',
  'soar', 'soars', 'climb', 'climbs', 'breakout', 'tightening', 'supply cut',
]

const BEARISH = [
  'fall', 'falls', 'drop', 'drops', 'decline', 'declines', 'plunge', 'plunges',
  'lower', 'bearish', 'downside', 'weakness', 'weak', 'sell-off', 'selloff',
  'crash', 'slump', 'slide', 'miss', 'misses', 'cut', 'downgrade', 'oversupply',
  'surplus', 'glut', 'recession', 'fear', 'concern', 'risk-off', 'miss expectations',
  'below forecast', 'inventory build', 'disappoint', 'disappoints', 'caution',
]

export function scoreSentiment(text: string): number {
  const lower = text.toLowerCase()
  let score = 0
  for (const w of BULLISH) {
    const count = lower.split(w).length - 1
    score += count * 0.12
  }
  for (const w of BEARISH) {
    const count = lower.split(w).length - 1
    score -= count * 0.12
  }
  return Math.max(-1, Math.min(1, score))
}

export function sentimentLabel(score: number): 'bullish' | 'bearish' | 'neutral' {
  if (score > 0.1) return 'bullish'
  if (score < -0.1) return 'bearish'
  return 'neutral'
}
