// Utility function to get sentiment label from numeric value
export const getSentimentLabel = (value: number): string => {
  if (value <= 20) return "Cynic";
  if (value <= 40) return "Skeptic";
  if (value <= 60) return "Neutral";
  if (value <= 80) return "Positive";
  return "Advocate";
};