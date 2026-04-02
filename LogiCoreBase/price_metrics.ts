export interface PricePoint {
  timestamp: number
  price: number
}

export interface TokenMetrics {
  averagePrice: number
  volatility: number      // standard deviation
  maxPrice: number
  minPrice: number
}

export class TokenAnalysisCalculator {
  private readonly series: PricePoint[]
  private readonly n: number

  constructor(data: PricePoint[]) {
    // keep only finite points and sort chronologically
    this.series = (Array.isArray(data) ? data : [])
      .filter(p => Number.isFinite(p.timestamp) && Number.isFinite(p.price))
      .sort((a, b) => a.timestamp - b.timestamp)
    this.n = this.series.length
  }

  getAveragePrice(): number {
    if (this.n === 0) return 0
    let sum = 0
    for (let i = 0; i < this.n; i++) sum += this.series[i].price
    return sum / this.n
  }

  /**
   * Standard deviation of prices.
   * @param useSample if true, uses n-1 in the denominator (sample std dev)
   */
  getVolatility(useSample: boolean = false): number {
    if (this.n === 0) return 0
    const mean = this.getAveragePrice()
    let numer = 0
    for (let i = 0; i < this.n; i++) {
      const d = this.series[i].price - mean
      numer += d * d
    }
    const denom = useSample ? Math.max(this.n - 1, 1) : this.n
    return Math.sqrt(numer / denom)
  }

  getMaxPrice(): number {
    if (this.n === 0) return 0
    let max = -Infinity
    for (let i = 0; i < this.n; i++) {
      const v = this.series[i].price
      if (v > max) max = v
    }
    return Number.isFinite(max) ? max : 0
  }

  getMinPrice(): number {
    if (this.n === 0) return 0
    let min = Infinity
    for (let i = 0; i < this.n; i++) {
      const v = this.series[i].price
      if (v < min) min = v
    }
    return Number.isFinite(min) ? min : 0
  }

  computeMetrics(opts?: { sampleVolatility?: boolean }): TokenMetrics {
    return {
      averagePrice: this.getAveragePrice(),
      volatility: this.getVolatility(!!opts?.sampleVolatility),
      maxPrice: this.getMaxPrice(),
      minPrice: this.getMinPrice(),
    }
  }
}
