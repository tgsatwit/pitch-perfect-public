import {
  type LangGraphRunnableConfig,
  StateGraph,
  END,
} from "@langchain/langgraph";
import { RunnableConfig } from "@langchain/core/runnables";
import * as dotenv from "dotenv";
import { randomUUID } from "crypto";

// Import node implementations
import {
  retrieveDataNode,
  enhanceDataNode,
  generateOutlineNode,
  aggregatorNode,
} from "./nodes";

import { PitchOutlineAnnotation } from "./state";
import { PitchOutlineGeneratorInput, PitchOutlineGeneratorResult } from "./types";

// Ensure environment variables are loaded
dotenv.config();

// Create the state graph for our agent
export const graph = new StateGraph(PitchOutlineAnnotation)
  .addNode("retrieveData", retrieveDataNode)
  .addNode("enhanceData", enhanceDataNode)
  .addNode("generateOutline", generateOutlineNode)
  .addNode("aggregator", aggregatorNode)
  .setEntryPoint("retrieveData");

// Add edges to connect the nodes
graph
  .addEdge("retrieveData", "enhanceData")
  .addEdge("enhanceData", "generateOutline")
  .addEdge("generateOutline", "aggregator")
  .addEdge("aggregator", END);

// Compile the graph
export const pitchOutlineGraph = graph.compile();

/**
 * Main function to generate a pitch outline
 */
export async function generatePitchOutline(
  input: PitchOutlineGeneratorInput,
  config?: RunnableConfig
): Promise<PitchOutlineGeneratorResult> {
  try {
    console.log(`Starting pitch outline generation for client: ${input.clientName}`);
    
    // Use the thread ID from config if provided, otherwise generate a new UUID
    const threadId = config?.configurable?.thread_id || randomUUID();
    
    // Create config with thread ID for tracing
    const fullConfig: LangGraphRunnableConfig = {
      ...(config || {}),
      configurable: {
        thread_id: threadId,
        ...(config?.configurable || {}),
      }
    };
    
    // Invoke the graph with the input
    const result = await pitchOutlineGraph.invoke({ input }, fullConfig);
    
    if (result.error) {
      throw new Error(`Outline generation failed: ${result.error}`);
    }
    
    if (!result.output) {
      throw new Error("Outline generation completed but no output was produced");
    }
    
    // Add the thread ID to the result
    return {
      ...result.output,
      threadId
    };
  } catch (error) {
    console.error("Error in generatePitchOutline:", error);
    
    // Generate a fallback thread ID for error cases
    const fallbackThreadId = config?.configurable?.thread_id || randomUUID();
    
    // Return a minimal result with the error information
    return {
      initialOutline: "",
      error: `Outline generation error: ${error instanceof Error ? error.message : String(error)}`,
      threadId: fallbackThreadId
    };
  }
}

export default generatePitchOutline; 