import type { TokenMetrics } from "./tokenAnalysisCalculator"

export interface IframeConfig {
  containerId: string
  srcUrl: string
  metrics: TokenMetrics
  refreshIntervalMs?: number
  targetOrigin?: string                 // defaults to origin of srcUrl
  sandbox?: string                      // optional iframe sandbox attribute (space-separated)
  referrerPolicy?: HTMLIFrameElement["referrerPolicy"]
}

export class TokenAnalysisIframe {
  private iframeEl: HTMLIFrameElement | null = null
  private intervalId: number | null = null
  private destroyed = false
  private readonly targetOrigin: string
  private metrics: TokenMetrics

  constructor(private readonly config: IframeConfig) {
    const url = new URL(config.srcUrl)
    this.targetOrigin = config.targetOrigin ?? `${url.protocol}//${url.host}`
    this.metrics = config.metrics
  }

  init(): void {
    if (this.destroyed) throw new Error("Instance destroyed")
    const container = document.getElementById(this.config.containerId)
    if (!container) throw new Error("Container not found: " + this.config.containerId)

    const iframe = document.createElement("iframe")
    iframe.src = this.config.srcUrl
    iframe.width = "100%"
    iframe.height = "100%"
    iframe.style.border = "0"
    if (this.config.sandbox) iframe.sandbox.add(this.config.sandbox)
    if (this.config.referrerPolicy) iframe.referrerPolicy = this.config.referrerPolicy
    iframe.onload = () => this.postMetrics()

    container.appendChild(iframe)
    this.iframeEl = iframe

    const ms = this.config.refreshIntervalMs
    if (typeof ms === "number" && ms > 0) {
      this.intervalId = window.setInterval(() => this.postMetrics(), ms)
    }
  }

  /** Update metrics and immediately post to the iframe */
  updateMetrics(next: TokenMetrics): void {
    if (!this.isValidMetrics(next)) throw new Error("Invalid TokenMetrics")
    this.metrics = next
    this.postMetrics()
  }

  /** Clean up iframe and timers */
  destroy(): void {
    this.destroyed = true
    if (this.intervalId !== null) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    if (this.iframeEl?.parentElement) {
      this.iframeEl.parentElement.removeChild(this.iframeEl)
    }
    this.iframeEl = null
  }

  private postMetrics(): void {
    if (this.destroyed) return
    const win = this.iframeEl?.contentWindow
    if (!win || !this.isValidMetrics(this.metrics)) return
    win.postMessage({ type: "TOKEN_ANALYSIS_METRICS", payload: this.metrics }, this.targetOrigin)
  }

  private isValidMetrics(m: any): m is TokenMetrics {
    return (
      m &&
      Number.isFinite(m.averagePrice) &&
      Number.isFinite(m.volatility) &&
      Number.isFinite(m.maxPrice) &&
      Number.isFinite(m.minPrice)
    )
  }
}
