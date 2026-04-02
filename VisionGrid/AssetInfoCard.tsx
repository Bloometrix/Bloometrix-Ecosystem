import React, { useEffect, useMemo, useState } from "react"

interface AssetOverviewPanelProps {
  assetId: string
  /** Optional API base (defaults to "/api") */
  apiBase?: string
}

interface AssetOverview {
  name: string
  priceUsd: number
  supply: number
  holders: number
}

const isAssetOverview = (v: any): v is AssetOverview =>
  v &&
  typeof v.name === "string" &&
  Number.isFinite(v.priceUsd) &&
  Number.isFinite(v.supply) &&
  Number.isFinite(v.holders)

export const AssetOverviewPanel: React.FC<AssetOverviewPanelProps> = ({ assetId, apiBase = "/api" }) => {
  const [info, setInfo] = useState<AssetOverview | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const base = useMemo(() => apiBase.replace(/\/+$/, ""), [apiBase])
  const currency = useMemo(
    () => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 }),
    []
  )
  const numberFmt = useMemo(() => new Intl.NumberFormat(undefined), [])

  useEffect(() => {
    const ctrl = new AbortController()
    setLoading(true)
    setError(null)

    ;(async () => {
      try {
        const res = await fetch(`${base}/assets/${encodeURIComponent(assetId)}`, { signal: ctrl.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
        const json = await res.json()
        if (!isAssetOverview(json)) throw new Error("Unexpected payload shape")
        setInfo(json)
      } catch (e: any) {
        if (ctrl.signal.aborted) return
        setError(e?.message ?? "Failed to load asset overview")
        setInfo(null)
      } finally {
        if (!ctrl.signal.aborted) setLoading(false)
      }
    })()

    return () => ctrl.abort()
  }, [assetId, base])

  if (loading) {
    return (
      <div className="p-4 bg-white rounded shadow" role="status" aria-live="polite">
        Loading asset overview…
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-white rounded shadow text-red-600" role="alert">
        Failed to load asset overview: {error}
      </div>
    )
  }

  if (!info) return null

  return (
    <section className="p-4 bg-white rounded shadow" aria-label="Asset overview">
      <h2 className="text-xl font-semibold mb-2">Asset Overview</h2>
      <p><strong>ID:</strong> {assetId}</p>
      <p><strong>Name:</strong> {info.name}</p>
      <p><strong>Price (USD):</strong> {currency.format(info.priceUsd)}</p>
      <p><strong>Circulating Supply:</strong> {numberFmt.format(info.supply)}</p>
      <p><strong>Holders:</strong> {numberFmt.format(info.holders)}</p>
    </section>
  )
}

export default AssetOverviewPanel
