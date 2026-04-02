export interface PricePoint {
  timestamp: number
  priceUsd: number
}

export type TrendDirection = "upward" | "downward" | "neutral"

export interface TrendResult {
  startTime: number
  endTime: number
  trend: TrendDirection
  changePct: number
}

/**
 * Analyze a series of price points to determine overall trend segments.
 * - Ensures chronological order
 * - Requires a minimum run length
 * - Ignores tiny net moves via minChangePct
 */
export function analyzePriceTrends(
  points: PricePoint[],
  minSegmentLength: number = 5,
  minChangePct: number = 0.25
): TrendResult[] {
  const results: TrendResult[] = []
  if (!Array.isArray(points) || points.length < minSegmentLength) return results

  // sanitize & sort
  const series = points
    .filter(p => Number.isFinite(p.timestamp) && Number.isFinite(p.priceUsd))
    .sort((a, b) => a.timestamp - b.timestamp)

  if (series.length < minSegmentLength) return results

  const dir = (a: number, b: number): 1 | -1 | 0 => (b > a ? 1 : b < a ? -1 : 0)
  const pct = (from: number, to: number): number =>
    from !== 0 ? ((to - from) / from) * 100 : (to === 0 ? 0 : (to > 0 ? 100 : -100))

  let segStart = 0
  let runDir: 1 | -1 | 0 = 0

  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1].priceUsd
    const curr = series[i].priceUsd
    const d = dir(prev, curr)
    if (runDir === 0 && d !== 0) runDir = d

    const isLast = i === series.length - 1
    const nextDir = isLast ? 0 : dir(curr, series[i + 1].priceUsd)
    const runLen = i - segStart + 1

    const shouldClose =
      runLen >= minSegmentLength && (isLast || (runDir !== 0 && nextDir !== runDir && nextDir !== 0))

    if (shouldClose) {
      const start = series[segStart]
      const end = series[i]
      const change = pct(start.priceUsd, end.priceUsd)
      const absChange = Math.abs(change)

      const trend: TrendDirection =
        absChange < minChangePct ? "neutral" : change > 0 ? "upward" : "downward"

      results.push({
        startTime: start.timestamp,
        endTime: end.timestamp,
        trend,
        changePct: Math.round(change * 100) / 100,
      })

      segStart = i
      runDir = 0
    }
  }

  return results
}
