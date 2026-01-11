import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { z } from "zod";
import { getModelConfig, getModelFromConfig } from "../../utils";
import { CompetitorAnalysisAnnotation, CompetitorAnalysisReturnType } from "../state";

const productSchema = z.object({
  name: z.string().describe("Name of the product or service"),
  description: z.string().describe("Description of the product or service"),
  uniqueFeatures: z.array(z.string()).optional().describe("Unique features or selling points")
});

const productsOutputSchema = z.array(productSchema).describe("Array of product information");

export async function productsNode(
  state: typeof CompetitorAnalysisAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<CompetitorAnalysisReturnType> {
  try {
    const { competitorName, website, pitchContext } = state.input;
    console.log(`Researching products and offerings for ${competitorName}`);

    // Get model configuration
    const modelConfig = getModelConfig(config);
    const model = await getModelFromConfig(config, {
      temperature: 0.1,
      maxTokens: 1500,
    });

    // Construct the prompt for products analysis
    const prompt = `
    You are tasked with researching the products and services offered by ${competitorName}.
    
    Focus on:
    1. Core products/services in the company's portfolio
    2. Recent product launches or service expansions
    3. Unique features or differentiators they emphasize
    4. Any specialized solutions for specific industries or use cases
    
    For each significant product or service, provide:
    - Name of the product/service
    - Description of what it does and who it's for
    - Any unique features or selling points that differentiate it
    
    ${website ? `The competitor's website is: ${website}` : ""}
    ${
      pitchContext?.industry 
        ? `Industry context: The analysis should emphasize products/services relevant to the ${pitchContext.industry} industry.` 
        : ""
    }
    ${
      pitchContext?.service 
        ? `Service context: The analysis should focus on offerings related to ${pitchContext.service}.` 
        : ""
    }
    
    Focus on information that would be most relevant for understanding the competitive positioning.
    `;

    // Invoke model with structured output
    const result = await model
      .withStructuredOutput(productsOutputSchema)
      .invoke([
        { 
          role: "system", 
          content: "You are a product analyst specializing in competitive product analysis." 
        },
        { role: "user", content: prompt }
      ]);

    // Return the products data
    return {
      productsData: result,
    };
  } catch (error) {
    console.error("Error in productsNode:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error in products and offerings analysis",
    };
  }
} 