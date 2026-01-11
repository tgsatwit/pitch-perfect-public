import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { ClientResearchAnnotation } from "../state";
import { ResearchTopicConfig } from "../types";

// Define the enhanced state type that includes searchResults and analysisText
type EnhancedState = typeof ClientResearchAnnotation.State & {
  searchResults?: string;
  analysisText?: string;
};

// Environment variables for API access
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure this is set in your .env file

// Core system prompt for comprehensive company research
const CORE_SYSTEM_PROMPT = `You are a financial analyst and corporate research expert specializing in Australian businesses.
Your task is to conduct deep research on a company to help a commercial bank understand potential banking opportunities.

Analyze the search results thoroughly to extract detailed insights about the company's financial position, market strategy, and potential banking needs.

Your analysis should include:

1. Financial Overview:
   - Provide a concise summary of the company's financial health
   - Include revenue trends, profitability, and growth trajectory
   - Note major financial events (acquisitions, expansions, restructuring)

2. Key Financial Metrics (where available):
   - Revenue
   - Profit Margin
   - Market Cap/Valuation
   - Debt-to-Equity Ratio
   - Cash Reserves
   - Annual Growth Rate

3. Market Analysis:
   - Current market position and competitive landscape
   - Market trends affecting the company
   - Geographic presence and expansion plans

4. SWOT Analysis:
   - Strengths: Competitive advantages, strong assets, etc.
   - Weaknesses: Operational challenges, financial constraints, etc.
   - Opportunities: Growth areas, untapped markets, etc.
   - Threats: Competitors, market risks, regulatory issues, etc.

5. Recent Developments:
   - List 3-5 significant recent events (with dates where possible)
   - Focus on events with financial implications`;

// Optional research topic prompts - will be added dynamically as needed
const RESEARCH_TOPIC_PROMPTS = {
  esg: `
6. ESG Profile & Corporate Values:
   - Environmental commitments and initiatives
   - Social responsibility programs and community engagement
   - Governance policies and practices
   - Stated corporate values and their alignment with actions
   - Any ESG ratings or sustainability indices the company appears in`,

  benchmarking: `
7. Peer Comparison & Benchmarking:
   - Compare the company's key metrics against 3-5 industry peers
   - Identify areas where the company is outperforming or underperforming
   - Note industry-specific trends that affect this company and its competitors
   - Provide context on the company's competitive position in its market`,

  bankingRelationships: `
8. Banking Relationships:
   - Identify current known banking partners (if publicly available)
   - Note any recent RFPs or banking mandate changes
   - Identify pain points in current banking relationships
   - Assess openness to new banking partnerships
   - Note any public statements about treasury operations or banking needs`,

  decisionMakers: `
9. Decision-Making Structure:
   - Identify key decision makers (CFO, Treasurer, etc.)
   - Note any recent leadership changes in the finance team
   - Describe the treasury team structure if information is available
   - Understand the decision-making process for banking relationships`
};

// Banking opportunities prompt
const BANKING_OPPORTUNITIES_PROMPT = `
10. Banking Opportunities:
   - Identify 3-5 specific banking services this client likely needs
   - For each opportunity provide:
     * The specific banking service or product
     * A detailed rationale based on your research
     * The urgency level (high/medium/low)
     * Our competitive position for offering this service
   - Consider: capital raising, debt refinancing, trade finance, cash management, forex, transaction banking, etc.
   - Base these on identifiable business needs from your research`;

// Formatting instructions
const FORMATTING_INSTRUCTIONS = `
IMPORTANT FORMATTING RULES:
1. Present information in clear, concise language appropriate for banking professionals
2. Be factual and specific rather than general
3. When information is not available, state "Not available" rather than inventing details
4. For the SWOT analysis, provide 3-5 bullet points for each category
5. Be specific about banking opportunities - don't just list generic services
6. Format output in a way that can be easily parsed into structured data

Note: This is a deep analysis for a commercial banking relationship. Focus on identifying actual business needs and financial trends.`;

/**
 * Dynamically builds the system prompt based on the research topics configuration
 */
export function buildSystemPrompt(config?: ResearchTopicConfig): string {
  let prompt = CORE_SYSTEM_PROMPT;
  
  // Default to including all research topics if none specified
  const includeESG = config?.includeESG ?? true;
  const includeBenchmarking = config?.includeBenchmarking ?? true;
  const includeBankingRelationships = config?.includeBankingRelationships ?? true;
  const includeDecisionMakers = config?.includeDecisionMakers ?? true;
  
  // Add research topic prompts based on configuration
  if (includeESG) {
    prompt += RESEARCH_TOPIC_PROMPTS.esg;
  }
  
  if (includeBenchmarking) {
    prompt += RESEARCH_TOPIC_PROMPTS.benchmarking;
  }
  
  if (includeBankingRelationships) {
    prompt += RESEARCH_TOPIC_PROMPTS.bankingRelationships;
  }
  
  if (includeDecisionMakers) {
    prompt += RESEARCH_TOPIC_PROMPTS.decisionMakers;
  }
  
  // Add custom topic instructions if provided
  if (config?.customTopics && config.customTopics.length > 0) {
    // Determine the next section number
    const nextSectionNumber = prompt.split(/\d+\.\s/).length;
    
    config.customTopics.forEach((topic, index) => {
      prompt += `\n\n${nextSectionNumber + index}. ${topic.name}:\n   - Research and provide insights on this topic as requested`;
    });
  }
  
  // Always add banking opportunities and formatting instructions
  prompt += BANKING_OPPORTUNITIES_PROMPT;
  prompt += FORMATTING_INSTRUCTIONS;
  
  return prompt;
}

/**
 * Node for analyzing search results and extracting insights
 */
export const analyzeResearchNode = async (
  state: EnhancedState,
  _config: RunnableConfig
): Promise<Partial<EnhancedState>> => {
  try {
    // Extract input parameters and search results
    const input = state.input;
    const searchResults = state.searchResults;
    
    if (!input || !input.companyName) {
      throw new Error("Company name is required for analysis");
    }
    
    if (!searchResults) {
      throw new Error("No search results available for analysis");
    }
    
    console.log("Analyzing search results to extract insights...");
    
    // Initialize LLM with appropriate parameters
    const llm = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: 0.2,
      apiKey: OPENAI_API_KEY,
      maxTokens: 4000,
    });
    
    // Build the system prompt based on research topic configuration
    const systemPrompt = buildSystemPrompt(input.researchTopics);
    
    // Prepare the user prompt with company information and search results
    const userPrompt = `
Company: ${input.companyName}
${input.industry ? `Industry: ${input.industry}` : ''}
${input.website ? `Website: ${input.website}` : ''}

Please analyze the following information about this company and provide a comprehensive research report according to the instructions.

Search Results:
${searchResults}
`;

    // Get the analysis from the LLM
    const analysisResponse = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(userPrompt)
    ]);
    
    const analysisText = analysisResponse.content.toString();
    
    console.log("Analysis completed successfully");
    
    // Return the raw analysis for the next node to parse
    return {
      analysisText
    };
  } catch (error) {
    console.error("Error in analysis node:", error);
    return {
      error: `Analysis error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

export default analyzeResearchNode; 