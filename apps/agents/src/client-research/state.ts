import { Annotation } from "@langchain/langgraph";
import { ClientResearchInput, ClientResearchResult } from "./types";

export const ClientResearchAnnotation = Annotation.Root({
  /**
   * The input parameters for the client research
   */
  input: Annotation<ClientResearchInput>,
  
  /**
   * The output result of the client research
   */
  output: Annotation<ClientResearchResult | undefined>,
  
  /**
   * Any errors that occurred during the research
   */
  error: Annotation<string | undefined>,
  
  /**
   * Financial data collected about the client
   */
  financialData: Annotation<ClientResearchResult["financialOverview"] | undefined>,
  
  /**
   * News and developments data
   */
  newsData: Annotation<ClientResearchResult["recentDevelopments"] | undefined>,
  
  /**
   * Recent developments data (separate from news)
   */
  recentDevelopmentsData: Annotation<ClientResearchResult["recentDevelopments"] | undefined>,
  
  /**
   * Executive team data
   */
  executiveData: Annotation<ClientResearchResult["decisionMakers"] | undefined>,
  
  /**
   * Enhanced executive team data with comprehensive analysis
   */
  enhancedExecutiveData: Annotation<any | undefined>,
  
  /**
   * Decision making process analysis
   */
  decisionMakingProcess: Annotation<string | undefined>,
  
  /**
   * Products and offerings data
   */
  productsData: Annotation<Record<string, string> | undefined>,
  
  /**
   * Market positioning data
   */
  marketPositionData: Annotation<
    string | 
    {
      marketAnalysis?: string;
      marketPosition?: string;
      competitors?: string[];
      swotAnalysis?: {
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
        threats: string[];
      };
      strategicConsiderations?: string;
    } | 
    undefined
  >,
  
  /**
   * Banking opportunities data
   */
  bankingOpportunitiesData: Annotation<ClientResearchResult["bankingOpportunities"] | undefined>,
  
  /**
   * ESG profile data
   */
  esgData: Annotation<ClientResearchResult["esgProfile"] | undefined>,
  
  /**
   * Peer comparison data
   */
  benchmarkingData: Annotation<ClientResearchResult["peerComparison"] | undefined>,
});

export type ClientResearchReturnType = Partial<
  typeof ClientResearchAnnotation.State
>; 