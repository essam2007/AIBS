interface Entry<T> { data: T; expiresAt: number }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const store = new Map<string, Entry<any>>()

export function getCache<T>(key: string): T | null {
  const e = store.get(key)
  if (!e) return null
  if (Date.now() > e.expiresAt) { store.delete(key); return null }
  return e.data as T
}

export function setCache<T>(key: string, data: T, ttlMs: number): void {
  store.set(key, { data, expiresAt: Date.now() + ttlMs })
}

export function clearCache(prefix?: string): void {
  if (!prefix) { store.clear(); return }
  for (const k of store.keys()) {
    if (k.startsWith(prefix)) store.delete(k)
  }
}
