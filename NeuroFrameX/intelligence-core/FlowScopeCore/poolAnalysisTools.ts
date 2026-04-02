import { toolkitBuilder } from "@/ai/core"
import { FETCH_POOL_DATA_KEY } from "@/ai/modules/liquidity/pool-fetcher/key"
import { ANALYZE_POOL_HEALTH_KEY } from "@/ai/modules/liquidity/health-checker/key"
import { FetchPoolDataAction } from "@/ai/modules/liquidity/pool-fetcher/action"
import { AnalyzePoolHealthAction } from "@/ai/modules/liquidity/health-checker/action"

type Toolkit = ReturnType<typeof toolkitBuilder>

/** Build a stable tool key as "namespace:id". */
const key = (ns: string, id: string) => `${ns}:${id}`

export const EXTENDED_LIQUIDITY_TOOLS = Object.freeze({
  [key("liquidityscan", FETCH_POOL_DATA_KEY)]: toolkitBuilder(new FetchPoolDataAction()),
  [key("poolhealth", ANALYZE_POOL_HEALTH_KEY)]: toolkitBuilder(new AnalyzePoolHealthAction()),
}) satisfies Readonly<Record<string, Toolkit>>

export type LiquidityToolKey = keyof typeof EXTENDED_LIQUIDITY_TOOLS

/** Convenience accessor with key narrowing */
export const getLiquidityTool = (k: LiquidityToolKey): Toolkit => EXTENDED_LIQUIDITY_TOOLS[k]
