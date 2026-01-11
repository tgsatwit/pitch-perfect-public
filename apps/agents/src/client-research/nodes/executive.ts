import { ChatOpenAI } from "@langchain/openai";
import { ClientResearchAnnotation, type ClientResearchReturnType } from "../state";
import { GoogleCustomSearch } from "@langchain/community/tools/google_custom_search";

// API credentials
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // Ensure this is set in your .env file
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID; // Ensure this is set in your .env file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure this is set in your .env file

/**
 * Executive Research Node
 * 
 * Researches key decision makers and executive team
 */
export async function executiveNode(
  state: typeof ClientResearchAnnotation.State
): Promise<ClientResearchReturnType> {
  console.log(`Starting executive research for ${state.input.companyName}`);
  
  try {
    const companyName = state.input.companyName;
    
    // Initialize search tool
    const searchTool = new GoogleCustomSearch({
      apiKey: GOOGLE_API_KEY,
      googleCSEId: GOOGLE_CSE_ID,
    });
    
    // Search for executive information
    const queries = [
      `${companyName} executive team leadership`,
      `${companyName} CEO CFO management`,
      `${companyName} board of directors`
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
      throw new Error("Unable to find executive information");
    }
    
    // Analyze the executive data with LLM
    const model = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: 0,
      openAIApiKey: OPENAI_API_KEY
    });
    
    // System prompt for executive analysis
    const systemPrompt = `You are a business analyst specializing in corporate leadership.
Extract information about the executive team and key decision makers at ${companyName} from the provided search results.

Format your response as a JSON object with the following structure:
{
  "decisionMakers": {
    "keyPersonnel": [
      {
        "name": "Full Name",
        "role": "Job Title",
        "background": "Brief background information if available"
      },
      ...
    ],
    "treasuryStructure": "Information about treasury team structure if available",
    "decisionProcess": "Information about the decision-making process if available"
  }
}

Focus on C-suite executives, particularly the CEO, CFO, and other financial officers.
Only include information that is explicitly mentioned in the search results.
If information about treasury structure or decision processes is not available, omit those fields.`;

    // Process with the model
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: `Here are the search results about ${companyName}'s executive team:\n\n${combinedResults}`
      }
    ]);
    
    // Parse the response to JSON
    const responseText = response.content.toString();
    const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || 
                     responseText.match(/{[\s\S]*}/);
                     
    if (!jsonMatch) {
      throw new Error("Failed to parse executive data from LLM response");
    }
    
    const jsonContent = jsonMatch[0].startsWith("{") ? jsonMatch[0] : jsonMatch[1];
    const parsedResponse = JSON.parse(jsonContent);
    
    console.log("Executive research completed successfully");
    
    return {
      executiveData: parsedResponse.decisionMakers,
      output: {
        ...state.output,
        decisionMakers: parsedResponse.decisionMakers
      }
    };
  } catch (error) {
    console.error("Error in executive research:", error);
    return {
      error: `Executive research error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 