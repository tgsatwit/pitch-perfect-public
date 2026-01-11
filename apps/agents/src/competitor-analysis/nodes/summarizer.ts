import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { getModelConfig, getModelFromConfig } from "../../utils";
import { CompetitorAnalysisAnnotation, CompetitorAnalysisReturnType } from "../state";
import { CompetitorAnalysisOutput } from "../types";

export async function summarizerNode(
  state: typeof CompetitorAnalysisAnnotation.State,
  config: LangGraphRunnableConfig
): Promise<CompetitorAnalysisReturnType> {
  try {
    const { competitorName, customQueries } = state.input;
    console.log(`Summarizing analysis for ${competitorName}`);

    // Get model configuration
    const modelConfig = getModelConfig(config);
    const model = await getModelFromConfig(config, {
      temperature: 0.1,
      maxTokens: 2000,
    });
    
    // Construct the prompt for summarization
    let promptContent = `
    You are tasked with creating a comprehensive summary of the competitive analysis 
    for ${competitorName}.
    
    Please synthesize the following research components into a cohesive summary:
    `;
    
    // Add sections that have data
    if (state.financialData) {
      promptContent += `\n### Financial Performance\n${state.financialData.summary}\n`;
    }
    
    if (state.newsData && state.newsData.length > 0) {
      promptContent += `\n### Recent News & Deals\n`;
      state.newsData.slice(0, 3).forEach(item => {
        promptContent += `- ${item.title} (${item.date}): ${item.summary}\n`;
      });
      if (state.newsData.length > 3) {
        promptContent += `- Plus ${state.newsData.length - 3} additional news items\n`;
      }
    }
    
    if (state.executiveData && state.executiveData.length > 0) {
      promptContent += `\n### Executive Team\n`;
      state.executiveData.slice(0, 3).forEach(exec => {
        promptContent += `- ${exec.name} (${exec.title})`;
        if (exec.background) promptContent += `: ${exec.background}`;
        promptContent += `\n`;
      });
      if (state.executiveData.length > 3) {
        promptContent += `- Plus ${state.executiveData.length - 3} additional executives\n`;
      }
    }
    
    if (state.productsData && state.productsData.length > 0) {
      promptContent += `\n### Products & Offerings\n`;
      state.productsData.slice(0, 3).forEach(product => {
        promptContent += `- ${product.name}: ${product.description}\n`;
      });
      if (state.productsData.length > 3) {
        promptContent += `- Plus ${state.productsData.length - 3} additional products/services\n`;
      }
    }
    
    if (state.pricingData) {
      promptContent += `\n### Pricing & Fees\n${state.pricingData.summary}\n`;
    }
    
    if (state.marketPositionData) {
      promptContent += `\n### Market Positioning\n${state.marketPositionData.summary}\n`;
    }
    
    if (state.pitchApproachData) {
      promptContent += `\n### Likely Pitch Approach\n${state.pitchApproachData.summary}\n`;
    }
    
    // Add custom queries if provided
    if (customQueries) {
      promptContent += `\n### Additional Context/Queries\n${customQueries}\n`;
    }
    
    promptContent += `
    Based on all this information, provide a concise but comprehensive summary of ${competitorName}'s 
    competitive positioning, key strengths and weaknesses, and most important insights for a pitch 
    situation. Focus on what makes this competitor unique and what would be most relevant to know 
    when competing against them.
    
    The summary should be well-structured and highlight the most important competitive intelligence findings.
    `;

    // Invoke model for the summary
    const summaryResponse = await model.invoke([
      { 
        role: "system", 
        content: "You are an expert consultant who specializes in competitive intelligence and analysis." 
      },
      { role: "user", content: promptContent }
    ]);

    // Create the final output
    const output: CompetitorAnalysisOutput = {
      competitor: competitorName,
      financialPerformance: state.financialData,
      newsAndDeals: state.newsData,
      executiveTeam: state.executiveData,
      productsOfferings: state.productsData,
      pricing: state.pricingData,
      marketPositioning: state.marketPositionData,
      pitchApproach: state.pitchApproachData,
      lastUpdated: new Date().toISOString(),
      version: 1, // Version 1 for new analysis
      summary: summaryResponse.content as string,
    };

    return {
      output,
    };
  } catch (error) {
    console.error("Error in summarizerNode:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error in summarizing analysis",
    };
  }
} 