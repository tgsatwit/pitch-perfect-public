import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { z } from "zod";
import { getModelConfig, getModelFromConfig } from "../../utils";
import { CompetitorAnalysisAnnotation, CompetitorAnalysisReturnType } from "../state";
import { MarketPositionInfo } from "../types";

const marketPositionOutputSchema = z.object({
  targetSegments: z.array(z.string()).optional().describe("Target client segments or industries"),
  differentiators: z.array(z.string()).optional().describe("Key differentiators or strengths"),
  perception: z.string().optional().describe("How they are generally perceived in the industry"),
  summary: z.string().describe("Summary of the competitor's market positioning and strategy")
});

export async function marketPositioningNode(
  state: typeof CompetitorAnalysisAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<CompetitorAnalysisReturnType> {
  try {
    const { competitorName, website, pitchContext } = state.input;
    console.log(`Analyzing market positioning for ${competitorName}`);

    // Get model configuration
    const modelConfig = getModelConfig(config);
    const model = await getModelFromConfig(config, {
      temperature: 0.1,
      maxTokens: 1500,
    });

    // Construct the prompt for market positioning analysis
    const prompt = `
    You are tasked with analyzing the market positioning and strategy of ${competitorName}.
    
    Focus on:
    1. How they position themselves in the market (innovator, cost leader, premium service, etc.)
    2. Their target client segments or industries
    3. Key differentiators or strengths they emphasize
    4. Overall brand perception and reputation
    5. Geographic or sector focus
    
    ${website ? `The competitor's website is: ${website}` : ""}
    ${
      pitchContext?.industry 
        ? `Industry context: The analysis should emphasize positioning relevant to the ${pitchContext.industry} industry.` 
        : ""
    }
    ${
      pitchContext?.service 
        ? `Service context: The analysis should focus on positioning related to ${pitchContext.service}.` 
        : ""
    }
    
    Provide insights on their market positioning strategy that would be valuable 
    for understanding competitive dynamics.
    `;

    // Invoke model with structured output
    const result = await model
      .withStructuredOutput(marketPositionOutputSchema)
      .invoke([
        { 
          role: "system", 
          content: "You are a strategy consultant specializing in competitive market positioning analysis." 
        },
        { role: "user", content: prompt }
      ]);

    // Return the market positioning data
    const marketPositionData: MarketPositionInfo = {
      targetSegments: result.targetSegments,
      differentiators: result.differentiators,
      perception: result.perception,
      summary: result.summary,
    };

    return {
      marketPositionData,
    };
  } catch (error) {
    console.error("Error in marketPositioningNode:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error in market positioning analysis",
    };
  }
} 