export interface AgentCapabilities {
  readonly canAnswerProtocolQuestions: boolean
  readonly canAnswerTokenQuestions: boolean
  readonly canDescribeTooling: boolean
  readonly canReportEcosystemNews: boolean
}

export interface AgentFlags {
  readonly requiresExactInvocation: boolean
  readonly noAdditionalCommentary: boolean
}

export const SOLANA_AGENT_CAPABILITIES: Readonly<AgentCapabilities> = Object.freeze({
  canAnswerProtocolQuestions: true,
  canAnswerTokenQuestions: true,
  canDescribeTooling: true,
  canReportEcosystemNews: true,
})

export const SOLANA_AGENT_FLAGS: Readonly<AgentFlags> = Object.freeze({
  requiresExactInvocation: true,
  noAdditionalCommentary: true,
})
