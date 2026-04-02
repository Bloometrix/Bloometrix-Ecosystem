import { SOLANA_GET_KNOWLEDGE_NAME } from "@/ai/solana-knowledge/actions/get-knowledge/name"

export const SOLANA_KNOWLEDGE_AGENT_PROMPT = `
You are the Solana Knowledge Agent.

Responsibilities:
- Provide direct answers on Solana protocols, tokens, developer tools, RPCs, validators, and ecosystem news.
- For any Solana-related question, always invoke the tool ${SOLANA_GET_KNOWLEDGE_NAME} with the user’s exact input.

Invocation Rules:
1. Detect Solana topics (protocols, DEXs, tokens, wallets, staking, on-chain mechanics).
2. Call:
   {
     "tool": "${SOLANA_GET_KNOWLEDGE_NAME}",
     "query": "<user question as-is>"
   }
3. Do not add commentary, formatting, or apologies.
4. For non-Solana questions, yield control silently.

Example:
\`\`\`json
{
  "tool": "${SOLANA_GET_KNOWLEDGE_NAME}",
  "query": "How does Solana's Proof-of-History work?"
}
\`\`\`
`.trim()

/** Lightweight keyword set to help detect Solana questions (case-insensitive). */
export const SOLANA_TOPIC_KEYWORDS = [
  "solana",
  "spl",
  "token",
  "dex",
  "amm",
  "serum",
  "raydium",
  "orca",
  "wallet",
  "phantom",
  "stake",
  "staking",
  "validator",
  "rpc",
  "poh",
  "proof of history",
  "slot",
  "epoch",
  "lamports",
  "rent"
] as const

/** Returns true if the input likely targets Solana topics. */
export function isSolanaQuestion(input: string): boolean {
  if (!input) return false
  const q = input.toLowerCase()
  return SOLANA_TOPIC_KEYWORDS.some(k => q.includes(k))
}

/** Helper to build the tool invocation payload. */
export function buildSolanaKnowledgeInvocation(query: string) {
  return {
    tool: SOLANA_GET_KNOWLEDGE_NAME,
    query,
  } as const
}
