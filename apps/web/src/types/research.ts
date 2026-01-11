export interface ResearchPromptData {
  id?: string;
  title: string;
  prompt: string;
  category: string;
  parameters: {
    depth: "basic" | "standard" | "deep";
    tone: "formal" | "conversational" | "technical";
    format: "bullet" | "paragraph" | "narrative";
    timeframe: "recent" | "historical" | "future";
    includeCompetitors: boolean;
    includeMarketTrends: boolean;
    includeCaseStudies: boolean;
    customFocus?: string;
  };
  timestamp: Date;
  clientId?: string; // Optional for creation, required when stored
  tags: string[];
  aiProcessing?: boolean;
  aiResponse?: string;
  lastProcessedAt?: Date;
} 