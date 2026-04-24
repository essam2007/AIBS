const KEYWORD_MAP: Record<string, string[]> = {
  'wti': ['CL=F'],
  'west texas': ['CL=F'],
  'brent': ['BZ=F'],
  'natural gas': ['NG=F'],
  'nat gas': ['NG=F'],
  'opec': ['CL=F', 'BZ=F'],
  'crude oil': ['CL=F', 'BZ=F'],
  'crude': ['CL=F', 'BZ=F'],
  'oil': ['CL=F', 'BZ=F'],
  'gasoline': ['RB=F'],
  'rbob': ['RB=F'],
  'heating oil': ['HO=F'],
  'exxon': ['XOM'],
  'chevron': ['CVX'],
  'shell': ['SHEL'],
  'conocophillips': ['COP'],
  'pioneer': ['PXD'],
  'energy etf': ['XLE'],
  'xle': ['XLE'],
  'sp 500': ['^GSPC'],
  's&p 500': ['^GSPC'],
  'sp500': ['^GSPC'],
  'nasdaq': ['^IXIC'],
  'dow jones': ['^DJI'],
  'gold': ['GC=F'],
  'silver': ['SI=F'],
  'copper': ['HG=F'],
  'bitcoin': ['BTC-USD'],
  'btc': ['BTC-USD'],
  'ethereum': ['ETH-USD'],
  'eth': ['ETH-USD'],
  'dollar': ['DX=F'],
  'dxy': ['DX=F'],
  'vix': ['^VIX'],
  'volatility index': ['^VIX'],
  'fed': ['^GSPC', '^IXIC'],
  'federal reserve': ['^GSPC', '^IXIC'],
  'treasury': ['^TNX'],
  '10-year': ['^TNX'],
  'energy sector': ['XLE'],
  'saudi': ['CL=F', 'BZ=F'],
  'aramco': ['2222.SR', 'CL=F'],
  'iran': ['CL=F', 'BZ=F'],
  'hormuz': ['CL=F', 'BZ=F'],
  'eia': ['CL=F', 'NG=F'],
  'inventory': ['CL=F', 'BZ=F'],
}

export function extractTickers(text: string): string[] {
  const found = new Set<string>()
  const lower = text.toLowerCase()

  for (const [kw, tickers] of Object.entries(KEYWORD_MAP)) {
    if (lower.includes(kw)) tickers.forEach(t => found.add(t))
  }

  return [...found].slice(0, 8)
}

export function isEnergyTicker(symbol: string): boolean {
  const energy = ['CL=F', 'BZ=F', 'NG=F', 'HO=F', 'RB=F', 'XLE', 'XOM', 'CVX', 'SHEL', 'BP', 'COP', 'PXD']
  return energy.includes(symbol)
}
