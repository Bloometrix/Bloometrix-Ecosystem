import React, { Suspense } from "react"
import SentimentGauge from "./SentimentGauge"
import AssetOverviewPanel from "./AssetOverviewPanel"

// Lazy-load to trim initial bundle
const WhaleTrackerCard = React.lazy(() => import("./WhaleTrackerCard"))

interface AnalyticsDashboardProps {
  symbol?: string
  assetId?: string
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  symbol = "TKN",
  assetId = "TKN-01",
}) => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <h1 className="text-4xl font-bold mb-6">Analytics Dashboard</h1>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SentimentGauge symbol={symbol} />
      <AssetOverviewPanel assetId={assetId} />
      <Suspense fallback={<div className="p-4 bg-white rounded shadow">Loading whales…</div>}>
        <WhaleTrackerCard />
      </Suspense>
    </div>
  </div>
)

export default AnalyticsDashboard
