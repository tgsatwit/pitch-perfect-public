import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { z } from "zod";
import { getModelConfig, getModelFromConfig } from "../../utils";
import { CompetitorAnalysisAnnotation, CompetitorAnalysisReturnType } from "../state";

const executiveSchema = z.object({
  name: z.string().describe("Name of the executive"),
  title: z.string().describe("Job title of the executive"),
  background: z.string().optional().describe("Professional background and previous experience"),
  linkedInUrl: z.string().optional().describe("LinkedIn URL of the executive if available"),
  strategicVision: z.string().optional().describe("Any public statements about strategy or vision")
});

const executiveOutputSchema = z.array(executiveSchema).describe("Array of executive profiles");

export async function executiveNode(
  state: typeof CompetitorAnalysisAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<CompetitorAnalysisReturnType> {
  try {
    const { competitorName, website, pitchContext } = state.input;
    console.log(`Researching executive team for ${competitorName}`);

    // Get model configuration
    const modelConfig = getModelConfig(config);
    const model = await getModelFromConfig(config, {
      temperature: 0.1,
      maxTokens: 1500,
    });

    // Construct the prompt for executive analysis
    const prompt = `
    You are tasked with researching the key executives and leadership team of ${competitorName}.
    
    Focus on:
    1. CEO, CFO, and other C-suite executives
    2. Heads of relevant divisions (especially those related to the client's industry)
    3. Any other key decision-makers
    
    For each significant executive, provide:
    - Name
    - Current title/role
    - Professional background (previous companies, experience)
    - LinkedIn URL if available
    - Any public statements about strategy or vision that might indicate their approach
    
    ${website ? `The competitor's website is: ${website}` : ""}
    ${
      pitchContext?.industry 
        ? `Industry context: The analysis should emphasize executives with experience in the ${pitchContext.industry} industry.` 
        : ""
    }
    ${
      pitchContext?.service 
        ? `Service context: The analysis should highlight executives involved with ${pitchContext.service}.` 
        : ""
    }
    
    Focus on information that would be most relevant for understanding the competitive landscape.
    `;

    // Invoke model with structured output
    const result = await model
      .withStructuredOutput(executiveOutputSchema)
      .invoke([
        { 
          role: "system", 
          content: "You are a business intelligence analyst specializing in corporate leadership research." 
        },
        { role: "user", content: prompt }
      ]);

    // Return the executive data
    return {
      executiveData: result,
    };
  } catch (error) {
    console.error("Error in executiveNode:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error in executive team analysis",
    };
  }
} 