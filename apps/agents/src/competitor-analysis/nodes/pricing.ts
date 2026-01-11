import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { z } from "zod";
import { getModelConfig, getModelFromConfig } from "../../utils";
import { CompetitorAnalysisAnnotation, CompetitorAnalysisReturnType } from "../state";
import { PricingInfo } from "../types";

const pricingOutputSchema = z.object({
  model: z.string().optional().describe("Pricing model (e.g., subscription, one-time, usage-based)"),
  strategy: z.string().optional().describe("Pricing strategy (e.g., premium, budget, value-based)"),
  summary: z.string().describe("Summary of the competitor's pricing approach and any notable aspects")
});

export async function pricingNode(
  state: typeof CompetitorAnalysisAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<CompetitorAnalysisReturnType> {
  try {
    const { competitorName, website, pitchContext } = state.input;
    console.log(`Researching pricing strategy for ${competitorName}`);

    // Get model configuration
    const modelConfig = getModelConfig(config);
    const model = await getModelFromConfig(config, {
      temperature: 0.1,
      maxTokens: 1200,
    });

    // Construct the prompt for pricing analysis
    const prompt = `
    You are tasked with researching the pricing strategy and fee structures of ${competitorName}.
    
    In institutional settings like banking or finance, specific pricing is often not public, 
    but look for any indications of:
    
    1. General pricing model (subscription, transaction-based, AUM-based, etc.)
    2. Premium vs. discount positioning in the market
    3. Any public information about fee levels or ranges
    4. Pricing strategies for key services or products
    5. Any evidence of pricing flexibility, negotiation approaches, or discount practices
    
    ${website ? `The competitor's website is: ${website}` : ""}
    ${
      pitchContext?.industry 
        ? `Industry context: The analysis should emphasize pricing relevant to the ${pitchContext.industry} industry.` 
        : ""
    }
    ${
      pitchContext?.service 
        ? `Service context: The analysis should focus on pricing related to ${pitchContext.service}.` 
        : ""
    }
    
    Even if specific numbers aren't available, provide insights on their general pricing strategy 
    and approach that would be valuable for competitive positioning.
    `;

    // Invoke model with structured output
    const result = await model
      .withStructuredOutput(pricingOutputSchema)
      .invoke([
        { 
          role: "system", 
          content: "You are a pricing strategy analyst specializing in competitive intelligence." 
        },
        { role: "user", content: prompt }
      ]);

    // Return the pricing data
    const pricingData: PricingInfo = {
      model: result.model,
      strategy: result.strategy,
      summary: result.summary,
    };

    return {
      pricingData,
    };
  } catch (error) {
    console.error("Error in pricingNode:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error in pricing analysis",
    };
  }
} 