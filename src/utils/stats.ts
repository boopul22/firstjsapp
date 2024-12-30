export interface UsageStats {
  wordCount: number;
  tokenCount: number;
  cost: number;
}

export const calculateStats = (text: string): UsageStats => {
  const words = text.trim().split(/\s+/).length;
  // Rough estimation: 1 word ≈ 1.3 tokens (this is a simplification)
  const estimatedTokens = Math.ceil(words * 1.3);
  // Cost calculation: $1.50 per 1M tokens
  const cost = (estimatedTokens / 1000000) * 1.50;

  return {
    wordCount: words,
    tokenCount: estimatedTokens,
    cost: cost
  };
};

export const formatCost = (cost: number): string => {
  return `$${cost.toFixed(4)}`;
}; 