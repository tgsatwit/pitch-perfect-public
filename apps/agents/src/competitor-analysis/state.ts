import { Annotation } from "@langchain/langgraph";
import { CompetitorAnalysisInput, CompetitorAnalysisOutput } from "./types";

export const CompetitorAnalysisAnnotation = Annotation.Root({
  /**
   * The input parameters for the competitor analysis
   */
  input: Annotation<CompetitorAnalysisInput>,
  
  /**
   * The output result of the competitor analysis
   */
  output: Annotation<CompetitorAnalysisOutput | undefined>,
  
  /**
   * Any errors that occurred during the analysis
   */
  error: Annotation<string | undefined>,
  
  /**
   * Financial performance data
   */
  financialData: Annotation<CompetitorAnalysisOutput["financialPerformance"] | undefined>,
  
  /**
   * News and deals data
   */
  newsData: Annotation<CompetitorAnalysisOutput["newsAndDeals"] | undefined>,
  
  /**
   * Executive team data
   */
  executiveData: Annotation<CompetitorAnalysisOutput["executiveTeam"] | undefined>,
  
  /**
   * Products and offerings data
   */
  productsData: Annotation<CompetitorAnalysisOutput["productsOfferings"] | undefined>,
  
  /**
   * Pricing and fees data
   */
  pricingData: Annotation<CompetitorAnalysisOutput["pricing"] | undefined>,
  
  /**
   * Market positioning data
   */
  marketPositionData: Annotation<CompetitorAnalysisOutput["marketPositioning"] | undefined>,
  
  /**
   * Pitch approach data
   */
  pitchApproachData: Annotation<CompetitorAnalysisOutput["pitchApproach"] | undefined>,
});

export type CompetitorAnalysisReturnType = Partial<
  typeof CompetitorAnalysisAnnotation.State
>; 