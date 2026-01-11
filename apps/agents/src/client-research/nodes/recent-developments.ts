import { ChatOpenAI } from "@langchain/openai";
import { ClientResearchAnnotation, type ClientResearchReturnType } from "../state";
import { GoogleCustomSearch } from "@langchain/community/tools/google_custom_search";

// API credentials
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // Ensure this is set in your .env file
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID; // Ensure this is set in your .env file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure this is set in your .env file

/**
 * Recent Developments Research Node
 * 
 * Identifies recent news, events, and developments related to the client company
 */
export async function recentDevelopmentsNode(
  state: typeof ClientResearchAnnotation.State
): Promise<ClientResearchReturnType> {
  console.log(`Starting recent developments research for ${state.input.companyName}`);
  
  try {
    const companyName = state.input.companyName;
    
    // Initialize search tool
    const searchTool = new GoogleCustomSearch({
      apiKey: GOOGLE_API_KEY,
      googleCSEId: GOOGLE_CSE_ID,
    });
    
    // Search for recent developments
    const queries = [
      `${companyName} recent news last 3 months`,
      `${companyName} financial announcement quarterly results`,
      `${companyName} acquisition merger partnership`,
      `${companyName} executive change leadership`,
      `${companyName} product launch new service`
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
    
    // Analyze the data with LLM
    const model = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: 0,
      openAIApiKey: OPENAI_API_KEY
    });
    
    // System prompt for recent developments analysis
    const systemPrompt = `You are a business intelligence analyst specializing in tracking company developments.
Based on the provided search results for ${companyName}, identify the 5-7 most significant recent developments.

For each development, provide:
1. An approximate date (if available, otherwise use "Recent")
2. A concise title
3. A detailed description of the development
4. Any potential banking or financial implications

Focus on developments like:
- Financial results and earnings
- Mergers, acquisitions, or partnerships
- Executive changes
- New product launches
- Regulatory issues
- Major client wins or losses
- Strategic shifts

Format your response as a JSON object with the following structure:
{
  "recentDevelopments": [
    {
      "date": "YYYY-MM-DD or approximate timeframe",
      "title": "Concise title of the development",
      "description": "Detailed description of what happened",
      "financialImplications": "Potential banking or financial implications"
    },
    ...
  ]
}

Only include developments that are supported by the search results. Prioritize the most recent and most significant developments.`;

    // Process with the model
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: `Here is the search data about ${companyName}'s recent developments:\n\n${combinedResults}`
      }
    ]);
    
    // Parse the response to JSON
    const responseText = response.content.toString();
    const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || 
                      responseText.match(/{[\s\S]*}/);
                      
    if (!jsonMatch) {
      throw new Error("Failed to parse recent developments data from LLM response");
    }
    
    const jsonContent = jsonMatch[0].startsWith("{") ? jsonMatch[0] : jsonMatch[1];
    const parsedResponse = JSON.parse(jsonContent);
    
    console.log("Recent developments research completed successfully");
    
    // Map the developments to the expected format
    const formattedDevelopments = parsedResponse.recentDevelopments.map((dev: any) => ({
      date: dev.date,
      title: dev.title,
      description: dev.description
    }));
    
    // FIXED: Use a different channel (recentDevelopmentsData) instead of newsData
    // This prevents conflict with newsNode which also updates newsData
    return {
      recentDevelopmentsData: formattedDevelopments
    };
  } catch (error) {
    console.error("Error in recent developments research:", error);
    return {
      error: `Recent developments research error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 