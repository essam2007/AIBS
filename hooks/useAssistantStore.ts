'use client'

import { useState, useCallback } from 'react'
import type { AssistantResponse } from '@/lib/types'

interface ChatMessage {
  id:        string
  role:      'user' | 'assistant'
  content:   string | AssistantResponse
  timestamp: Date
  error?:    boolean
}

export function useAssistantStore() {
  const [messages, setMessages]   = useState<ChatMessage[]>([])
  const [loading,  setLoading]    = useState(false)
  const [tickers,  setTickers]    = useState<string[]>(['CL=F', 'BZ=F'])

  const sendMessage = useCallback(async (prompt: string, contextTickers?: string[]) => {
    if (!prompt.trim() || loading) return

    const id = Date.now().toString()
    setMessages(prev => [...prev, { id, role: 'user', content: prompt, timestamp: new Date() }])
    setLoading(true)

    try {
      const res = await fetch('/api/assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, tickers: contextTickers ?? tickers, timeWindow: '24h' }),
      })
      const data: AssistantResponse | { error: string } = await res.json()

      if ('error' in data) {
        setMessages(prev => [...prev, { id: id + '-r', role: 'assistant', content: data.error, timestamp: new Date(), error: true }])
      } else {
        setMessages(prev => [...prev, { id: id + '-r', role: 'assistant', content: data, timestamp: new Date() }])
      }
    } catch {
      setMessages(prev => [...prev, { id: id + '-r', role: 'assistant', content: 'Connection error. Please try again.', timestamp: new Date(), error: true }])
    } finally {
      setLoading(false)
    }
  }, [loading, tickers])

  const clearHistory = useCallback(() => setMessages([]), [])

  const lastResponse = messages.filter(m => m.role === 'assistant' && !m.error).at(-1)?.content as AssistantResponse | undefined

  return { messages, loading, tickers, setTickers, sendMessage, clearHistory, lastResponse }
}
