import { StateGraph, type LangGraphRunnableConfig, START, END } from "@langchain/langgraph";
import { CompetitorAnalysisAnnotation, type CompetitorAnalysisReturnType } from "./state";
import { CompetitorAnalysisInput } from "./types";

// Import nodes
import { financialNode } from "./nodes/financial";
import { newsNode } from "./nodes/news";
import { executiveNode } from "./nodes/executive";
import { productsNode } from "./nodes/products";
import { pricingNode } from "./nodes/pricing";
import { marketPositioningNode } from "./nodes/market-positioning";
import { pitchApproachNode } from "./nodes/pitch-approach";
import { summarizerNode } from "./nodes/summarizer";

/**
 * Router function to determine which nodes to run based on focus areas
 */
function focusAreasRouter(
  state: typeof CompetitorAnalysisAnnotation.State
): string[] {
  // Default to running all nodes if no focus areas specified
  const focusAreas = state.input.focusAreas || {
    financial: true,
    news: true,
    executiveTeam: true,
    products: true,
    pricing: true,
    marketPosition: true,
    pitchApproach: true,
  };

  const nodesToRun: string[] = [];

  if (focusAreas.financial) nodesToRun.push("financial");
  if (focusAreas.news) nodesToRun.push("news");
  if (focusAreas.executiveTeam) nodesToRun.push("executive");
  if (focusAreas.products) nodesToRun.push("products");
  if (focusAreas.pricing) nodesToRun.push("pricing");
  if (focusAreas.marketPosition) nodesToRun.push("marketPosition");
  
  // Only add pitch approach if explicitly requested or if we're running most other nodes
  // (since it depends on other nodes' results)
  if (focusAreas.pitchApproach && 
      (nodesToRun.length >= 3 || 
      (focusAreas.marketPosition && (focusAreas.products || focusAreas.financial)))) {
    nodesToRun.push("pitchApproach");
  }

  return nodesToRun;
}

/**
 * Check if any error occurred in the research nodes
 */
function checkErrors(
  state: typeof CompetitorAnalysisAnnotation.State
): "summarize" | "error" {
  if (state.error) {
    return "error";
  }
  return "summarize";
}

/**
 * Router node implementation
 */
async function routerNode(
  state: typeof CompetitorAnalysisAnnotation.State
): Promise<CompetitorAnalysisReturnType> {
  console.log(`Starting competitor analysis for ${state.input.competitorName}`);
  // This node doesn't modify state, just routes to the appropriate research nodes
  return {};
}

/**
 * CheckNodes node implementation
 */
async function checkNodesNode(
  _state: typeof CompetitorAnalysisAnnotation.State
): Promise<CompetitorAnalysisReturnType> {
  // This node checks if all expected nodes have completed
  // The actual routing is done in the checkErrors function
  return {};
}

// Build the graph
const builder = new StateGraph(CompetitorAnalysisAnnotation)
  .addNode("financial", financialNode)
  .addNode("news", newsNode)
  .addNode("executive", executiveNode)
  .addNode("products", productsNode)
  .addNode("pricing", pricingNode)
  .addNode("marketPosition", marketPositioningNode)
  .addNode("pitchApproach", pitchApproachNode)
  .addNode("summarize", summarizerNode)
  .addNode("router", routerNode)
  .addNode("checkNodes", checkNodesNode);

// Define the graph flow
builder
  .addEdge(START, "router")
  .addConditionalEdges(
    "router",
    focusAreasRouter,
    ["financial", "news", "executive", "products", "pricing", "marketPosition", "pitchApproach"]
  )
  .addEdge("financial", "checkNodes")
  .addEdge("news", "checkNodes")
  .addEdge("executive", "checkNodes")
  .addEdge("products", "checkNodes")
  .addEdge("pricing", "checkNodes")
  .addEdge("marketPosition", "checkNodes")
  .addEdge("pitchApproach", "checkNodes")
  .addConditionalEdges(
    "checkNodes",
    checkErrors,
    ["summarize", END]
  )
  .addEdge("summarize", END);

// Compile the graph
export const graph = builder.compile();

// Export the agent interface
export const competitor_analysis = {
  name: "competitor_analysis",
  metadata: {
    description: "Researches competitor companies and provides structured competitive intelligence"
  },
  invoke: async (input: CompetitorAnalysisInput | any, config?: LangGraphRunnableConfig) => {
    console.log("Competitor Analysis agent invoked with input:", input);
    try {
      // Generate a unique trace ID if not provided in config
      const configWithDefaults: LangGraphRunnableConfig = {
        ...config,
        configurable: {
          ...config?.configurable,
          thread_id: config?.configurable?.thread_id || `competitor_analysis_${Date.now()}`
        }
      };
      
      const result = await graph.invoke({
        input: input.input || input
      }, configWithDefaults);
      
      return result;
    } catch (error) {
      console.error("Error running Competitor Analysis agent:", error);
      return {
        error: error instanceof Error ? error.message : "Unknown error in Competitor Analysis agent"
      };
    }
  },
  stream: async function* (input?: CompetitorAnalysisInput | any, config?: LangGraphRunnableConfig) {
    try {
      // Generate a unique trace ID if not provided in config
      const configWithDefaults: LangGraphRunnableConfig = {
        ...config,
        configurable: {
          ...config?.configurable,
          thread_id: config?.configurable?.thread_id || `competitor_analysis_${Date.now()}`
        }
      };
      
      const result = await graph.invoke({
        input: input?.input || input || {}
      }, configWithDefaults);
      
      yield result;
    } catch (error) {
      console.error("Error streaming from Competitor Analysis agent:", error);
      yield {
        error: error instanceof Error ? error.message : "Unknown error in Competitor Analysis agent"
      };
    }
  }
}; 