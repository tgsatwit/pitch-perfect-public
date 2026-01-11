export interface CompetitorAnalysisInput {
  /**
   * Name of the competitor to research
   */
  competitorName: string;
  
  /**
   * Optional website URL of the competitor
   */
  website?: string;
  
  /**
   * Context of the pitch or client
   */
  pitchContext?: {
    /**
     * Industry of the client
     */
    industry?: string;
    
    /**
     * Specific service being pitched
     */
    service?: string;
    
    /**
     * Additional context
     */
    additionalContext?: string;
  };
  
  /**
   * Focus areas for the research
   */
  focusAreas?: {
    financial: boolean;
    news: boolean;
    executiveTeam: boolean;
    products: boolean;
    pricing: boolean;
    marketPosition: boolean;
    pitchApproach: boolean;
  };
  
  /**
   * Time frame for news and deals (in months)
   */
  newsTimeFrame?: number;
  
  /**
   * Any custom queries or areas of emphasis
   */
  customQueries?: string;
}

export interface FinancialData {
  revenue?: string;
  profitability?: string;
  growthTrends?: string;
  summary: string;
}

export interface NewsItem {
  title: string;
  date: string;
  summary: string;
  source?: string;
  url?: string;
}

export interface ExecutiveInfo {
  name: string;
  title: string;
  background?: string;
  linkedInUrl?: string;
  strategicVision?: string;
}

export interface ProductInfo {
  name: string;
  description: string;
  uniqueFeatures?: string[];
}

export interface PricingInfo {
  model?: string;
  strategy?: string;
  summary: string;
}

export interface MarketPositionInfo {
  targetSegments?: string[];
  differentiators?: string[];
  perception?: string;
  summary: string;
}

export interface PitchApproachInfo {
  likelyThemes?: string[];
  valuePropositions?: string[];
  summary: string;
}

export interface CompetitorAnalysisOutput {
  competitor: string;
  financialPerformance?: FinancialData;
  newsAndDeals?: NewsItem[];
  executiveTeam?: ExecutiveInfo[];
  productsOfferings?: ProductInfo[];
  pricing?: PricingInfo;
  marketPositioning?: MarketPositionInfo;
  pitchApproach?: PitchApproachInfo;
  lastUpdated: string;
  version: number;
  summary: string;
} 