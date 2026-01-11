import {
  type LangGraphRunnableConfig,
  START,
  StateGraph,
} from "@langchain/langgraph";
import { GoogleCustomSearch } from "@langchain/community/tools/google_custom_search";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";

// Ensure environment variables are loaded
dotenv.config();

// Import our types and state definitions
import { ClientSearchInput, ClientSearchResult } from "./types";
import { ClientSearchAnnotation, type ClientSearchReturnType } from "./state";

// System prompt for company research
const SYSTEM_PROMPT = `You are a financial institution research assistant specializing in gathering information about companies in Australia.
Your task is to analyze web search results and extract key details about a company to help bankers understand potential clients.

Be sure to identify the correct company. For example:
- If searching for "Myer", ensure it's the Australian department store
- If searching for "NAB", ensure it's National Australia Bank

Extract the following information in a structured format with clear headings:

Description: A concise summary of what the company does (2-3 sentences)
Industry: The primary industry the company operates in
Founded: Only the year the company was established (just the 4-digit year)
Headquarters: Where the company is headquartered (city, state)
Key Products: Major products or services offered (list format)
Recent News: Any significant recent developments (1-2 sentences)
Market Position: Where they stand in their industry (e.g., market leader, growing challenger)
Competitors: Major competitors in their industry (list format)

IMPORTANT FORMATTING RULES:
1. Each section should start with the heading followed by a colon
2. Do NOT include section numbers in your response
3. For "Founded" only include the 4-digit year (e.g., "Founded: 1900")
4. For list items, use a dash or bullet point at the start of each item
5. If information is not available, simply write "Not available" for that section

IMPORTANT: If the information is not available in the search results, mark it as "Not available" rather than making it up.
Do not include financial advice, speculation, or personal opinions.
`;

// Known API credentials from the .env file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure this is set in your .env file

/**
 * Search for client information using web search
 */
export const searchClientInfo = async (
  state: typeof ClientSearchAnnotation.State,
  _config: LangGraphRunnableConfig
): Promise<ClientSearchReturnType> => {
  console.log("Starting search for client:", state.input);
  
  try {
    const companyName = state.input.companyName;
    
    // Get Google API key and CSE ID, either from environment or hardcoded
    const googleApiKey = process.env.GOOGLE_API_KEY; // Ensure this is set in your .env file
    const googleCseId = process.env.GOOGLE_CSE_ID; // Ensure this is set in your .env file
    
    console.log("Using hardcoded Google API credentials");
    
    // Initialize the search tool
    const searchTool = new GoogleCustomSearch({
      apiKey: googleApiKey,
      googleCSEId: googleCseId,
    });

    // Create the search query
    // Include 'Australia' for better local results since we're focusing on an Australian bank's clients
    let searchQuery = `${companyName} company Australia information`;
    
    if (state.input.website) {
      // If website is provided, add it to the query for more specific results
      searchQuery += ` ${state.input.website}`;
    }
    
    console.log(`Performing web search for: ${searchQuery}`);
    
    // Perform the search
    const searchResults = await searchTool.call(searchQuery);
    
    // Use OpenAI to analyze the search results
    const model = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",  // Use the best available model
      temperature: 0,  // Keep it factual
      openAIApiKey: OPENAI_API_KEY  // Explicitly provide the API key
    });

    console.log("Analyzing search results with LLM");
    
    // Have the model analyze the search results
    const response = await model.invoke([
      { role: "system", content: SYSTEM_PROMPT },
      { 
        role: "user", 
        content: `Here are the search results for ${companyName}:\n\n${searchResults}\n\nPlease extract the structured information about this company.` 
      }
    ]);

    // Parse the response to extract the company information
    const content = response.content.toString();
    
    // Use regex to find each piece of information in the response
    // These improved patterns help clean up the numbering and extra characters
    const descriptionMatch = content.match(/Description:?\s*([\s\S]*?)(?=Industry:|$)/i);
    const industryMatch = content.match(/Industry:?\s*([\s\S]*?)(?=Founded:|$)/i);
    const foundedMatch = content.match(/Founded:?\s*([\s\S]*?)(?=Headquarters:|$)/i);
    const headquartersMatch = content.match(/Headquarters:?\s*([\s\S]*?)(?=Key Products:|$)/i);
    const keyProductsMatch = content.match(/Key Products:?\s*([\s\S]*?)(?=Recent News:|$)/i);
    const recentNewsMatch = content.match(/Recent News:?\s*([\s\S]*?)(?=Market Position:|$)/i);
    const marketPositionMatch = content.match(/Market Position:?\s*([\s\S]*?)(?=Competitors:|$)/i);
    const competitorsMatch = content.match(/Competitors:?\s*([\s\S]*?)(?=$)/i);
    
    // Helper function to extract and clean text
    const extractText = (match: RegExpMatchArray | null) => {
      if (!match || !match[1]) return "Not available";
      
      // Clean up the text by removing numbering and extra whitespace
      let text = match[1].trim();
      text = text.replace(/^\d+\.\s*/, ''); // Remove leading numbers like "1. "
      text = text.replace(/\n+\d+\.\s*$/, ''); // Remove trailing numbers like "\n2."
      return text;
    };
    
    // Special case for founded year - extract just the year
    const extractFoundedYear = (match: RegExpMatchArray | null) => {
      if (!match || !match[1]) return "Not available";
      
      const text = match[1].trim();
      // Try to find a 4-digit year
      const yearMatch = text.match(/\b(1[0-9]{3}|20[0-9]{2})\b/);
      if (yearMatch && yearMatch[1]) {
        return yearMatch[1];
      }
      return text;
    };
    
    // Helper function to parse a list of items
    const parseList = (text: string) => {
      if (text === "Not available") return [];
      
      // Split by common list separators
      const items = text.split(/[,;•\n-]/).map(item => {
        let trimmed = item.trim();
        trimmed = trimmed.replace(/^[-•\s]+|[-•\s]+$/g, '');  // Remove leading/trailing bullets and spaces
        trimmed = trimmed.replace(/^\d+\.\s*/, ''); // Remove leading numbers
        return trimmed;
      }).filter(item => {
        // Filter out empty items and items that are just numbers (like trailing section numbers)
        return item.length > 0 && !/^\d+\.?$/.test(item);
      });
      
      return items.length > 0 ? items : ["Not available"];
    };
    
    // Construct the result
    const result: ClientSearchResult = {
      description: extractText(descriptionMatch),
      industry: extractText(industryMatch),
      founded: extractFoundedYear(foundedMatch),
      headquarters: extractText(headquartersMatch),
      keyProducts: parseList(extractText(keyProductsMatch)),
      recentNews: extractText(recentNewsMatch),
      marketPosition: extractText(marketPositionMatch),
      competitors: parseList(extractText(competitorsMatch))
    };
    
    console.log("Successfully retrieved company information from web search");
    
    return {
      output: result
    };
  } catch (error) {
    console.error("Error in client search:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error occurred during search"
    };
  }
};

// Build the graph
const builder = new StateGraph(ClientSearchAnnotation)
  .addNode("search", searchClientInfo)
  .addEdge(START, "search");

export const graph = builder.compile().withConfig({ runName: "client_search" });

// For backward compatibility with the old API
export const client_search = {
  name: "client_search",
  metadata: {
    description: "A client search agent that gathers information about companies"
  },
  invoke: async (input: any) => {
    console.log("Client search invoked with input:", input);
    const result = await graph.invoke({
      input: input.input || input
    });
    return result;
  },
  // Add stream method required by LangGraph CLI
  stream: async function* (input?: any) {
    const result = await graph.invoke({
      input: input?.input || input || {}
    });
    yield result;
  }
};

/**
 * Mock client search function that returns sample data
 */
export async function searchClient(input: ClientSearchInput): Promise<ClientSearchResult> {
  // Use the same search logic as in the graph
  const result = await graph.invoke({
    input: input
  });
  
  return result.output || {
    description: `Error searching for ${input.companyName}. Please check API keys.`
  };
}

// Default handler for the client-search endpoint
export default async function handler(req: any, _res: any) {
  try {
    const input = req.body as ClientSearchInput;
    return await searchClient(input);
  } catch (error) {
    console.error("Error in client search:", error);
    throw error;
  }
} 