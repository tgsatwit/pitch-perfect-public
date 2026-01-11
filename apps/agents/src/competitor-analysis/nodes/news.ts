import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { z } from "zod";
import { getModelConfig, getModelFromConfig } from "../../utils";
import { CompetitorAnalysisAnnotation, CompetitorAnalysisReturnType } from "../state";

const newsItemSchema = z.object({
  title: z.string().describe("Title of the news article or announcement"),
  date: z.string().describe("Date of the news article or announcement"),
  summary: z.string().describe("Summary of the news article or announcement"),
  source: z.string().optional().describe("Source of the news article or announcement"),
  url: z.string().optional().describe("URL of the news article or announcement")
});

const newsOutputSchema = z.array(newsItemSchema).describe("Array of news items");

export async function newsNode(
  state: typeof CompetitorAnalysisAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<CompetitorAnalysisReturnType> {
  try {
    const { competitorName, website, newsTimeFrame = 12, pitchContext } = state.input;
    console.log(`Gathering recent news and deals for ${competitorName}`);

    // Get model configuration
    const modelConfig = getModelConfig(config);
    const model = await getModelFromConfig(config, {
      temperature: 0.1,
      maxTokens: 1500,
    });

    // Construct the prompt for news analysis
    const timeFrameText = newsTimeFrame === 1 
      ? "past month" 
      : `past ${newsTimeFrame} months`;
    
    const prompt = `
    You are tasked with researching recent news and deal announcements for ${competitorName}.
    
    Focus on news from the ${timeFrameText}, with emphasis on:
    1. Major client wins or partnerships
    2. Mergers and acquisitions
    3. New product or service launches
    4. Leadership changes
    5. Strategic initiatives or pivots
    
    For each significant news item, provide:
    - Title of the news
    - Approximate date (if known)
    - Brief summary of what happened and its significance
    - Source of the information (if applicable)
    
    ${website ? `The competitor's website is: ${website}` : ""}
    ${
      pitchContext?.industry 
        ? `Industry context: The analysis should focus on news relevant to the ${pitchContext.industry} industry.` 
        : ""
    }
    ${
      pitchContext?.service 
        ? `Service context: The analysis should emphasize news related to ${pitchContext.service}.` 
        : ""
    }
    
    Provide the most important news items first, focusing on developments that would 
    be most relevant for competitive positioning.
    `;

    // Invoke model with structured output
    const result = await model
      .withStructuredOutput(newsOutputSchema)
      .invoke([
        { 
          role: "system", 
          content: "You are a business intelligence analyst who specializes in tracking company news and developments." 
        },
        { role: "user", content: prompt }
      ]);

    // Return the news data
    return {
      newsData: result,
    };
  } catch (error) {
    console.error("Error in newsNode:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error in news analysis",
    };
  }
} 