import { Annotation } from "@langchain/langgraph";
import { PitchOutlineGeneratorInput, PitchOutlineGeneratorResult } from "./types";

export const PitchOutlineAnnotation = Annotation.Root({
  /**
   * The input parameters for the pitch outline generator
   */
  input: Annotation<PitchOutlineGeneratorInput>,
  
  /**
   * The output result of the pitch outline generator
   */
  output: Annotation<PitchOutlineGeneratorResult | undefined>,
  
  /**
   * Any errors that occurred during the outline generation
   */
  error: Annotation<string | undefined>,
  
  /**
   * Client information retrieved from Firebase
   */
  clientData: Annotation<any | undefined>,
  
  /**
   * Competitor information retrieved from Firebase
   */
  competitorData: Annotation<Record<string, any> | undefined>,
  
  /**
   * Processed client information with additional details
   */
  enhancedClientData: Annotation<any | undefined>,
  
  /**
   * Processed competitor information with additional details
   */
  enhancedCompetitorData: Annotation<Record<string, any> | undefined>,
  
  /**
   * Any files or data sources to include
   */
  dataSourceContent: Annotation<string | undefined>,
  
  /**
   * Generated outline in markdown format
   */
  outlineText: Annotation<string | undefined>,
  
  /**
   * Summary of the generated outline
   */
  outlineSummary: Annotation<string | undefined>,
});

export type PitchOutlineReturnType = Partial<
  typeof PitchOutlineAnnotation.State
>; 