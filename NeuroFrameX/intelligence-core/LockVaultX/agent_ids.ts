/** Stable identifier for the Solana knowledge agent */
export const SOLANA_KNOWLEDGE_AGENT_ID = "solana-knowledge-agent" as const

/** Literal type of the agent ID */
export type SolanaKnowledgeAgentId = typeof SOLANA_KNOWLEDGE_AGENT_ID

/** Optional display name */
export const SOLANA_KNOWLEDGE_AGENT_NAME = "Solana Knowledge Agent"

/** Lightweight validator for Solana agent IDs */
export function isValidSolanaAgentId(id: string): boolean {
  return /^solana-[a-z-]+$/.test(id)
}
