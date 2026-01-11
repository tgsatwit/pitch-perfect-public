import { ChatOpenAI } from "@langchain/openai";
import { ClientResearchAnnotation, type ClientResearchReturnType } from "../state";
import { GoogleCustomSearch } from "@langchain/community/tools/google_custom_search";

// API credentials
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // Ensure this is set in your .env file
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID; // Ensure this is set in your .env file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure this is set in your .env file

/**
 * Market Positioning Research Node
 * 
 * Researches the client's market position, competitors, and SWOT analysis
 */
export async function marketPositioningNode(
  state: typeof ClientResearchAnnotation.State
): Promise<ClientResearchReturnType> {
  console.log(`Starting market positioning research for ${state.input.companyName}`);
  
  try {
    const companyName = state.input.companyName;
    const industry = state.input.industry || "";
    
    // Initialize search tool
    const searchTool = new GoogleCustomSearch({
      apiKey: GOOGLE_API_KEY,
      googleCSEId: GOOGLE_CSE_ID,
    });
    
    // Search for market positioning information
    const queries = [
      `${companyName} market position industry analysis`,
      `${companyName} competitors comparison ${industry}`,
      `${companyName} SWOT analysis strengths weaknesses`,
      `${companyName} market share ${industry}`
    ];
    
    // Combine search results
    let combinedResults = "";
    for (const query of queries) {
      try {
        const result = await searchTool.call(query);
        combinedResults += `\n\nResults for query "${query}":\n${result}`;
      } catch (error) {
        console.error(`Error searching for "${query}":`, error);
      }
    }
    
    if (!combinedResults.trim()) {
      console.warn("Limited search results for market positioning. Generating analysis based on company and industry information.");
      combinedResults = `Limited search results available. Company: ${companyName}, Industry: ${industry}. Please generate a thoughtful SWOT analysis based on typical industry characteristics and company positioning.`;
    }
    
    // Analyze the market data with LLM
    const model = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: 0,
      openAIApiKey: OPENAI_API_KEY
    });
    
    // System prompt for market analysis
    const systemPrompt = `You are a market analyst specializing in competitive intelligence.
Extract the following information from the provided search results for ${companyName}:

1. Market Analysis: Provide an overview of the company's market position and competitive landscape.
2. Market Position: Describe their position in the market and any significant market share information.
3. Competitors: Identify their key competitors.
4. SWOT Analysis:
   - Strengths: The company's competitive advantages
   - Weaknesses: Areas where the company faces challenges
   - Opportunities: Potential for growth or improvement
   - Threats: External factors that could negatively impact the company

IMPORTANT: Even if explicit SWOT analysis is not found in the search results, you MUST generate a thoughtful SWOT analysis based on:
- The company's industry position and competitive landscape
- Financial performance indicators mentioned
- Market trends and industry challenges
- Company size, market presence, and business model
- General industry knowledge for ${industry} sector

Each SWOT category should have at least 3 substantive points. Be analytical and specific rather than generic.

Format your response as a JSON object with the following structure:
{
  "marketAnalysis": "Detailed analysis text",
  "marketPosition": "Market position description", 
  "competitors": ["Competitor 1", "Competitor 2", ...],
  "swotAnalysis": {
    "strengths": ["Strength 1", "Strength 2", "Strength 3", ...],
    "weaknesses": ["Weakness 1", "Weakness 2", "Weakness 3", ...],
    "opportunities": ["Opportunity 1", "Opportunity 2", "Opportunity 3", ...],
    "threats": ["Threat 1", "Threat 2", "Threat 3", ...]
  },
  "strategicConsiderations": "Key strategic considerations and recommendations based on the analysis"
}

The strategic considerations should synthesize insights from the SWOT analysis and market position to provide actionable strategic guidance.`;

    // Process with the model
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: `Here are the search results about ${companyName}'s market position and competitors:\n\n${combinedResults}`
      }
    ]);
    
    // Parse the response to JSON
    const responseText = response.content.toString();
    const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || 
                     responseText.match(/{[\s\S]*}/);
                     
    if (!jsonMatch) {
      throw new Error("Failed to parse market data from LLM response");
    }
    
    const jsonContent = jsonMatch[0].startsWith("{") ? jsonMatch[0] : jsonMatch[1];
    const parsedResponse = JSON.parse(jsonContent);
    
    console.log("Market positioning research completed successfully");
    
    return {
      marketPositionData: {
        marketAnalysis: parsedResponse.marketAnalysis,
        marketPosition: parsedResponse.marketPosition,
        competitors: parsedResponse.competitors,
        swotAnalysis: parsedResponse.swotAnalysis,
        strategicConsiderations: parsedResponse.strategicConsiderations
      }
    };
  } catch (error) {
    console.error("Error in market positioning research:", error);
    return {
      error: `Market positioning research error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 