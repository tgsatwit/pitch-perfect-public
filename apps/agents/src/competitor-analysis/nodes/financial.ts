import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { z } from "zod";
import { getModelConfig, getModelFromConfig } from "../../utils";
import { CompetitorAnalysisAnnotation, CompetitorAnalysisReturnType } from "../state";
import { FinancialData } from "../types";

const financialOutputSchema = z.object({
  revenue: z.string().optional().describe("Revenue information if available"),
  profitability: z.string().optional().describe("Profitability information if available"),
  growthTrends: z.string().optional().describe("Growth trends information if available"),
  summary: z.string().describe("Summary of the competitor's financial health and notable trends"),
});

export async function financialNode(
  state: typeof CompetitorAnalysisAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<CompetitorAnalysisReturnType> {
  try {
    const { competitorName, website, pitchContext } = state.input;
    console.log(`Analyzing financial performance for ${competitorName}`);

    // Get model configuration
    const modelConfig = getModelConfig(config);
    const model = await getModelFromConfig(config, {
      temperature: 0.1,
      maxTokens: 1000,
    });

    // Construct the prompt for financial analysis
    const prompt = `
    You are tasked with researching the financial performance of ${competitorName}.
    
    Please gather the following information:
    1. Revenue figures and trends (if available)
    2. Profitability data and margins (if available)
    3. Growth trends and projections (if available)
    
    Based on the available data, provide a summary of the competitor's financial health 
    and any notable trends that would be relevant to a competitive analysis.
    
    ${website ? `The competitor's website is: ${website}` : ""}
    ${
      pitchContext?.industry 
        ? `Industry context: The analysis should focus on aspects relevant to the ${pitchContext.industry} industry.` 
        : ""
    }
    ${
      pitchContext?.service 
        ? `Service context: The analysis should emphasize aspects relevant to ${pitchContext.service}.` 
        : ""
    }
    
    Provide a structured analysis with specific figures when available, but focus on 
    insights and trends that would be valuable for competitive positioning.
    `;

    // Invoke model with structured output
    const result = await model
      .withStructuredOutput(financialOutputSchema)
      .invoke([
        { role: "system", content: "You are a financial analyst skilled at researching companies." },
        { role: "user", content: prompt }
      ]);

    // Return the financial data
    const financialData: FinancialData = {
      revenue: result.revenue,
      profitability: result.profitability,
      growthTrends: result.growthTrends,
      summary: result.summary,
    };

    return {
      financialData,
    };
  } catch (error) {
    console.error("Error in financialNode:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error in financial analysis",
    };
  }
} 