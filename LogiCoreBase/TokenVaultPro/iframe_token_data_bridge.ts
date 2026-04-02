import type { TokenDataPoint } from "./tokenDataFetcher"

export interface DataIframeConfig {
  containerId: string            // DOM element id to host the iframe
  iframeUrl: string              // where the iframe is hosted
  apiBase: string                // base URL used to fetch token history
  token: string                  // token symbol or id
  refreshMs?: number             // optional polling interval in ms
  targetOrigin?: string          // strict postMessage target; defaults to iframeUrl origin
  sandbox?: string               // optional iframe sandbox attribute (space-separated)
  referrerPolicy?: HTMLIFrameElement["referrerPolicy"]
}

export class TokenDataIframeEmbedder {
  private iframe?: HTMLIFrameElement
  private intervalId?: number
  private destroyed = false
  private readonly targetOrigin: string

  constructor(private readonly cfg: DataIframeConfig) {
    const origin = new URL(cfg.iframeUrl)
    this.targetOrigin = cfg.targetOrigin ?? `${origin.protocol}//${origin.host}`
    if (!cfg.token) throw new Error("token is required")
    if (!cfg.apiBase) throw new Error("apiBase is required")
  }

  async init(): Promise<void> {
    if (this.destroyed) throw new Error("Instance destroyed")
    const container = document.getElementById(this.cfg.containerId)
    if (!container) throw new Error(`Container not found: ${this.cfg.containerId}`)

    const iframe = document.createElement("iframe")
    iframe.src = this.cfg.iframeUrl
    iframe.width = "100%"
    iframe.height = "100%"
    iframe.style.border = "0"
    if (this.cfg.sandbox) iframe.sandbox.add(this.cfg.sandbox)
    if (this.cfg.referrerPolicy) iframe.referrerPolicy = this.cfg.referrerPolicy
    iframe.onload = () => this.postTokenData().catch(() => void 0)

    container.appendChild(iframe)
    this.iframe = iframe

    if (this.cfg.refreshMs && this.cfg.refreshMs > 0) {
      this.intervalId = window.setInterval(
        () => this.postTokenData().catch(() => void 0),
        this.cfg.refreshMs
      )
    }
  }

  /** Update token and immediately push fresh data */
  async updateToken(nextToken: string): Promise<void> {
    if (!nextToken) throw new Error("token must be non-empty")
    ;(this as any).cfg.token = nextToken
    await this.postTokenData()
  }

  /** Clean up iframe and timers */
  destroy(): void {
    this.destroyed = true
    if (this.intervalId != null) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
    if (this.iframe?.parentElement) {
      this.iframe.parentElement.removeChild(this.iframe)
    }
    this.iframe = undefined
  }

  private async postTokenData(): Promise<void> {
    if (this.destroyed) return
    const win = this.iframe?.contentWindow
    if (!win) return

    try {
      const { TokenDataFetcher } = await import("./tokenDataFetcher")
      const fetcher = new TokenDataFetcher(this.cfg.apiBase)
      const data: TokenDataPoint[] = await fetcher.fetchHistory(this.cfg.token)

      win.postMessage(
        { type: "TOKEN_DATA_STREAM", token: this.cfg.token, data },
        this.targetOrigin
      )
    } catch (err) {
      // keep the embed resilient on transient failures
      console.error("[TokenDataIframeEmbedder] postTokenData failed:", err)
    }
  }
}
