import { ChatOpenAI } from "@langchain/openai";
import { ClientResearchAnnotation, type ClientResearchReturnType } from "../state";
import { GoogleCustomSearch } from "@langchain/community/tools/google_custom_search";

// API credentials
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // Ensure this is set in your .env file
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID; // Ensure this is set in your .env file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure this is set in your .env file

/**
 * Banking Opportunities Research Node
 * 
 * Identifies potential banking service opportunities based on client research
 */
export async function bankingOpportunitiesNode(
  state: typeof ClientResearchAnnotation.State
): Promise<ClientResearchReturnType> {
  console.log(`Starting banking opportunities research for ${state.input.companyName}`);
  
  try {
    const companyName = state.input.companyName;
    const industry = state.input.industry || "";
    
    // Use existing data from other research nodes if available
    const existingResearch = {
      financialOverview: state.financialData || "",
      marketPosition: state.marketPositionData || "",
      currentData: state.output || {}
    };
    
    // Initialize search tool for additional data if needed
    const searchTool = new GoogleCustomSearch({
      apiKey: GOOGLE_API_KEY,
      googleCSEId: GOOGLE_CSE_ID,
    });
    
    // Search for banking relationships information
    const queries = [
      `${companyName} banking relationships financial partners`,
      `${companyName} capital raising debt financing`,
      `${companyName} treasury operations banking needs`,
      `${companyName} ${industry} typical banking services required`
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
    
    // System prompt for banking opportunities analysis
    const systemPrompt = `You are a banking relationship manager specializing in identifying business banking opportunities.
Based on the provided research data and search results for ${companyName}, identify 3-5 specific banking service opportunities.

For each opportunity, provide:
1. The specific banking service or product
2. A detailed rationale based on the research
3. The urgency level (high/medium/low)
4. The competitive position for offering this service

Consider services such as:
- Capital raising
- Debt refinancing
- Trade finance
- Cash management
- Foreign exchange
- Transaction banking
- Working capital optimization
- Treasury services
- Payment processing solutions
- Risk management

Format your response as a JSON object with the following structure:
{
  "bankingOpportunities": [
    {
      "service": "Specific service name",
      "rationale": "Detailed explanation based on research",
      "urgency": "high/medium/low",
      "competitivePosition": "Assessment of competitive position"
    },
    ...
  ],
  "bankingRelationships": {
    "knownBankingPartners": ["Bank 1", "Bank 2", ...] (if found in research),
    "painPoints": ["Pain point 1", "Pain point 2", ...] (if found in research)
  }
}

Base these on concrete business needs identified in the research. Do not invent information - if you cannot identify specific opportunities, provide more general ones based on the industry and company size.`;

    // Combine existing research with search results
    const researchData = JSON.stringify(existingResearch, null, 2);

    // Process with the model
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: `Here is the research data and search results about ${companyName}'s banking needs and relationships:\n\nEXISTING RESEARCH:\n${researchData}\n\nADDITIONAL SEARCH RESULTS:\n${combinedResults}`
      }
    ]);
    
    // Parse the response to JSON
    const responseText = response.content.toString();
    const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || 
                     responseText.match(/{[\s\S]*}/);
                     
    if (!jsonMatch) {
      throw new Error("Failed to parse banking opportunities data from LLM response");
    }
    
    const jsonContent = jsonMatch[0].startsWith("{") ? jsonMatch[0] : jsonMatch[1];
    const parsedResponse = JSON.parse(jsonContent);
    
    console.log("Banking opportunities research completed successfully");
    
    // FIXED: Only update the bankingOpportunitiesData field, not the output field
    // This prevents concurrent modification of the output by multiple nodes
    return {
      bankingOpportunitiesData: parsedResponse.bankingOpportunities
    };
  } catch (error) {
    console.error("Error in banking opportunities research:", error);
    return {
      error: `Banking opportunities research error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 