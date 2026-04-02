export interface TokenDataPoint {
  timestamp: number
  priceUsd: number
  volumeUsd: number
  marketCapUsd: number
}

type HistoryQuery = {
  from?: number
  to?: number
  limit?: number
}

export class TokenDataFetcher {
  private readonly timeoutMs: number

  constructor(private readonly apiBase: string, opts?: { timeoutMs?: number }) {
    if (!apiBase) throw new Error("apiBase is required")
    this.timeoutMs = opts?.timeoutMs ?? 15_000
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)
    try {
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      return (await res.json()) as T
    } finally {
      clearTimeout(timer)
    }
  }

  private normalize(rec: any): TokenDataPoint | null {
    const t = Number(rec?.time ?? rec?.timestamp)
    const price = Number(rec?.priceUsd ?? rec?.price)
    const vol = Number(rec?.volumeUsd ?? rec?.volume)
    const mc = Number(rec?.marketCapUsd ?? rec?.marketCap)

    if (![t, price, vol, mc].every(Number.isFinite)) return null
    const tsMs = t < 1_000_000_000_000 ? t * 1000 : t

    return {
      timestamp: Math.trunc(tsMs),
      priceUsd: price,
      volumeUsd: vol,
      marketCapUsd: mc,
    }
  }

  /**
   * Fetch history for a token symbol from `${apiBase}/tokens/:symbol/history`
   */
  async fetchHistory(symbol: string, q?: HistoryQuery): Promise<TokenDataPoint[]> {
    if (!symbol) throw new Error("symbol is required")

    const base = this.apiBase.replace(/\/+$/, "")
    const params = new URLSearchParams()
    if (q?.from != null) params.set("from", String(q.from))
    if (q?.to != null) params.set("to", String(q.to))
    if (q?.limit != null) params.set("limit", String(q.limit))

    const url = `${base}/tokens/${encodeURIComponent(symbol)}/history${params.size ? `?${params}` : ""}`
    const raw = await this.fetchJson<any[]>(url)

    const data = (Array.isArray(raw) ? raw : [])
      .map(r => this.normalize(r))
      .filter((x): x is TokenDataPoint => x !== null)
      .sort((a, b) => a.timestamp - b.timestamp)

    const dedup: TokenDataPoint[] = []
    let lastTs = -Infinity
    for (const p of data) {
      if (p.timestamp !== lastTs) {
        dedup.push(p)
        lastTs = p.timestamp
      }
    }
    return dedup
  }
}
