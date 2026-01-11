import { Annotation } from "@langchain/langgraph";
import { ClientSearchInput, ClientSearchResult } from "./types";

export const ClientSearchAnnotation = Annotation.Root({
  /**
   * The input parameters for the client search
   */
  input: Annotation<ClientSearchInput>,
  
  /**
   * The output result of the client search
   */
  output: Annotation<ClientSearchResult | undefined>,
  
  /**
   * Any errors that occurred during the search
   */
  error: Annotation<string | undefined>,
});

export type ClientSearchReturnType = Partial<
  typeof ClientSearchAnnotation.State
>; 