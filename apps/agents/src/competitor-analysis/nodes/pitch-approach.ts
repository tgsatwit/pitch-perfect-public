import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { z } from "zod";
import { getModelConfig, getModelFromConfig } from "../../utils";
import { CompetitorAnalysisAnnotation, CompetitorAnalysisReturnType } from "../state";
import { PitchApproachInfo } from "../types";

const pitchApproachOutputSchema = z.object({
  likelyThemes: z.array(z.string()).optional().describe("Likely themes or messaging the competitor would use"),
  valuePropositions: z.array(z.string()).optional().describe("Key value propositions they would emphasize"),
  summary: z.string().describe("Summary of the competitor's likely pitch approach and strategy")
});

export async function pitchApproachNode(
  state: typeof CompetitorAnalysisAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<CompetitorAnalysisReturnType> {
  try {
    const { competitorName, pitchContext } = state.input;
    console.log(`Analyzing potential pitch approach for ${competitorName}`);

    // Make sure we have enough information to infer pitch approach
    // Need at least some of the other analyses
    const hasMarketData = !!state.marketPositionData;
    const hasProductsData = !!state.productsData;
    const hasFinancialData = !!state.financialData;
    
    if (!hasMarketData && !hasProductsData && !hasFinancialData) {
      console.log("Insufficient data to analyze pitch approach");
      return {
        pitchApproachData: {
          summary: "Insufficient data to analyze potential pitch approach"
        }
      };
    }

    // Get model configuration
    const modelConfig = getModelConfig(config);
    const model = await getModelFromConfig(config, {
      temperature: 0.2, // Slightly higher temperature as this is more speculative
      maxTokens: 1500,
    });

    // Construct the prompt for pitch approach analysis
    let promptContent = `
    You are tasked with inferring the likely pitch approach that ${competitorName} would use when 
    approaching potential clients.
    
    Based on the available information about this competitor, predict:
    1. The main themes or messages they would emphasize in a pitch
    2. The key value propositions they would highlight
    3. Their likely overall pitch strategy and approach
    `;

    // Add context from other analyses if available
    if (hasMarketData) {
      promptContent += `\nMarket positioning insights:\n`;
      if (state.marketPositionData?.targetSegments) {
        promptContent += `- Target segments: ${state.marketPositionData.targetSegments.join(", ")}\n`;
      }
      if (state.marketPositionData?.differentiators) {
        promptContent += `- Key differentiators: ${state.marketPositionData.differentiators.join(", ")}\n`;
      }
      if (state.marketPositionData?.perception) {
        promptContent += `- Market perception: ${state.marketPositionData.perception}\n`;
      }
      if (state.marketPositionData?.summary) {
        promptContent += `- Overall positioning: ${state.marketPositionData.summary}\n`;
      }
    }

    if (hasProductsData && state.productsData) {
      promptContent += `\nProduct offerings insights:\n`;
      state.productsData.slice(0, 3).forEach(product => {
        promptContent += `- ${product.name}: ${product.description}\n`;
        if (product.uniqueFeatures) {
          promptContent += `  Features: ${product.uniqueFeatures.join(", ")}\n`;
        }
      });
    }

    if (hasFinancialData && state.financialData) {
      promptContent += `\nFinancial performance insights:\n${state.financialData.summary}\n`;
    }

    // Add client context if available
    if (pitchContext) {
      promptContent += `\nClient context:\n`;
      if (pitchContext.industry) {
        promptContent += `- Industry: ${pitchContext.industry}\n`;
      }
      if (pitchContext.service) {
        promptContent += `- Service: ${pitchContext.service}\n`;
      }
      if (pitchContext.additionalContext) {
        promptContent += `- Additional context: ${pitchContext.additionalContext}\n`;
      }
    }

    promptContent += `
    Based on this information, predict how ${competitorName} would likely approach a pitch 
    to a client in this space. What would be their key messages, value propositions, and overall strategy?
    `;

    // Invoke model with structured output
    const result = await model
      .withStructuredOutput(pitchApproachOutputSchema)
      .invoke([
        { 
          role: "system", 
          content: "You are a strategic pitch consultant who specializes in analyzing competitors' sales approaches." 
        },
        { role: "user", content: promptContent }
      ]);

    // Return the pitch approach data
    const pitchApproachData: PitchApproachInfo = {
      likelyThemes: result.likelyThemes,
      valuePropositions: result.valuePropositions,
      summary: result.summary,
    };

    return {
      pitchApproachData,
    };
  } catch (error) {
    console.error("Error in pitchApproachNode:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error in pitch approach analysis",
    };
  }
} 