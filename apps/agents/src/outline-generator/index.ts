import { type LangGraphRunnableConfig } from "@langchain/langgraph";
import type { PitchOutlineGeneratorInput, PitchOutlineGeneratorResult } from "./types";
import generatePitchOutline from "./graph";

/**
 * Export the main function for generating pitch outlines
 */
export { generatePitchOutline };

/**
 * Export types for external use
 */
export type { 
  PitchOutlineGeneratorInput, 
  PitchOutlineGeneratorResult 
};

/**
 * Main function to create a pitch outline
 */
export default async function createPitchOutline(
  input: PitchOutlineGeneratorInput,
  config?: Partial<LangGraphRunnableConfig>
): Promise<PitchOutlineGeneratorResult> {
  try {
    console.log(`Creating pitch outline for ${input.clientName}`);
    
    // Call the internal generator function
    const result = await generatePitchOutline(input, config);
    
    console.log("Pitch outline generation completed");
    return result;
  } catch (error) {
    console.error("Error in createPitchOutline:", error);
    return {
      initialOutline: "",
      error: `Outline creation error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 