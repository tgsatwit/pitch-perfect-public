export interface CompetitorAnalysisInput {
  competitorName: string;
  website?: string;
  pitchContext?: string;
  focusAreas?: string[];
  newsTimeFrame?: number;
  customQueries?: string[];
}

export interface CompetitorAnalysisOutput {
  summary: string;
  findings: {
    company: {
      name: string;
      description: string;
      website?: string;
      foundedYear?: string;
      headquarters?: string;
      employees?: string;
      industry?: string;
    };
    financials?: {
      revenue?: string;
      funding?: string;
      valuation?: string;
      growth?: string;
      profitability?: string;
    };
    products?: {
      mainProducts: string[];
      pricing?: string;
      features?: string[];
      uniqueSellingPoints?: string[];
    };
    marketing?: {
      strategy?: string;
      channels?: string[];
      messaging?: string;
      audienceTargeting?: string;
    };
    executives?: {
      key_people?: {
        name: string;
        position: string;
        background?: string;
      }[];
    };
    news?: {
      recentDevelopments?: string[];
      pressReleases?: string[];
    };
    swot?: {
      strengths?: string[];
      weaknesses?: string[];
      opportunities?: string[];
      threats?: string[];
    };
  };
  competitiveAnalysis?: string;
  recommendations?: string[];
  error?: string;
} 