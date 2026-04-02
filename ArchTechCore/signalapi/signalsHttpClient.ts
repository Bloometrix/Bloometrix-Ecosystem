export interface Signal {
  id: string
  type: string
  timestamp: number
  payload: Record<string, any>
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface ClientOptions {
  apiKey?: string
  timeoutMs?: number
}

/**
 * Simple HTTP client for fetching signals.
 */
export class SignalApiClient {
  private readonly timeoutMs: number

  constructor(private baseUrl: string, private apiKey?: string, opts?: ClientOptions) {
    this.timeoutMs = opts?.timeoutMs ?? 10_000
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`
    return headers
  }

  private async doRequest<T>(path: string): Promise<ApiResponse<T>> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: "GET",
        headers: this.getHeaders(),
        signal: controller.signal,
      })

      if (!res.ok) {
        return { success: false, error: `HTTP ${res.status} ${res.statusText}` }
      }

      const data = (await res.json()) as T
      return { success: true, data }
    } catch (err: any) {
      return { success: false, error: err?.message ?? "Unknown error" }
    } finally {
      clearTimeout(timer)
    }
  }

  async fetchAllSignals(): Promise<ApiResponse<Signal[]>> {
    return this.doRequest<Signal[]>("/signals")
  }

  async fetchSignalById(id: string): Promise<ApiResponse<Signal>> {
    return this.doRequest<Signal>(`/signals/${encodeURIComponent(id)}`)
  }
}
