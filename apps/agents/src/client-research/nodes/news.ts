import { ChatOpenAI } from "@langchain/openai";
import { ClientResearchAnnotation, type ClientResearchReturnType } from "../state";
import { GoogleCustomSearch } from "@langchain/community/tools/google_custom_search";

// API credentials
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // Ensure this is set in your .env file
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID; // Ensure this is set in your .env file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure this is set in your .env file

/**
 * News Research Node
 * 
 * Researches recent news and developments about the client
 */
export async function newsNode(
  state: typeof ClientResearchAnnotation.State
): Promise<ClientResearchReturnType> {
  console.log(`Starting news research for ${state.input.companyName}`);
  
  try {
    const companyName = state.input.companyName;
    const industry = state.input.industry || "";
    
    // Initialize search tool
    const searchTool = new GoogleCustomSearch({
      apiKey: GOOGLE_API_KEY,
      googleCSEId: GOOGLE_CSE_ID,
    });
    
    // Search for recent news
    const queries = [
      `${companyName} recent news developments last 12 months`,
      `${companyName} press releases announcements`,
      `${companyName} ${industry} business updates`,
      `${companyName} recent events`
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
      throw new Error("Unable to find recent news");
    }
    
    // Analyze the news data with LLM
    const model = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: 0,
      openAIApiKey: OPENAI_API_KEY
    });
    
    // System prompt for news analysis
    const systemPrompt = `You are a business analyst specialized in tracking company news and developments.
Extract the following information from the provided search results for ${companyName}:

1. Recent Developments: List 3-5 significant recent events or developments (with dates where possible).
   Focus on events with business or financial implications.

Format your response as a JSON object with the following structure:
{
  "recentDevelopments": [
    {
      "date": "YYYY-MM-DD" or approximate date if exact not available,
      "title": "Brief title of the development",
      "description": "Detailed description of the event"
    },
    ...
  ]
}

Only include developments if they are mentioned in the search results. 
Be factual and specific rather than general. If information is not available, return an empty array.`;

    // Process with the model
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: `Here are the search results about ${companyName}'s recent news and developments:\n\n${combinedResults}`
      }
    ]);
    
    // Parse the response to JSON
    const responseText = response.content.toString();
    const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || 
                     responseText.match(/{[\s\S]*}/);
                     
    if (!jsonMatch) {
      throw new Error("Failed to parse news data from LLM response");
    }
    
    const jsonContent = jsonMatch[0].startsWith("{") ? jsonMatch[0] : jsonMatch[1];
    const parsedResponse = JSON.parse(jsonContent);
    
    console.log("News research completed successfully");
    
    return {
      newsData: parsedResponse.recentDevelopments
    };
  } catch (error) {
    console.error("Error in news research:", error);
    return {
      error: `News research error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 