import { ChatOpenAI } from "@langchain/openai";
import { ClientResearchAnnotation, type ClientResearchReturnType } from "../state";

// API credentials
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure this is set in your .env file

// Decision maker interface for type safety
interface DecisionMakerPerson {
  name: string;
  title: string;
  background: string;
  [key: string]: any; // Allow for additional properties
}

/**
 * Helper function to get a string representation of data that might be complex
 */
function getStringValue(data: any): string {
  if (data === undefined || data === null) {
    return "No data available";
  }
  
  if (typeof data === 'string') {
    return data;
  }
  
  if (typeof data === 'object') {
    try {
      return JSON.stringify(data);
    } catch (e) {
      return "Complex data available (object)";
    }
  }
  
  return String(data);
}

/**
 * Summarizer Research Node
 * 
 * Produces an overall summary of all research findings
 */
export async function summarizerNode(
  state: typeof ClientResearchAnnotation.State
): Promise<ClientResearchReturnType> {
  console.log(`Starting overall summary for ${state.input.companyName}`);
  
  try {
    const companyName = state.input.companyName;
    
    // Consolidate all research data
    const researchData = {
      company: companyName,
      industry: state.input.industry || "Unknown",
      // Now use the aggregated output data from the previous aggregator node
      ...(state.output || {}),
      // Add any additional state information that might not be in aggregated output
      additionalContext: {
        financialRawData: getStringValue(state.financialData),
        marketPositionRawData: getStringValue(state.marketPositionData),
        newsRawData: getStringValue(state.newsData),
        bankingOpportunitiesRawData: getStringValue(state.bankingOpportunitiesData),
        executiveRawData: getStringValue(state.executiveData),
        esgRawData: getStringValue(state.esgData),
        benchmarkingRawData: getStringValue(state.benchmarkingData)
      }
    };
    
    // Analyze the data with LLM
    const model = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: 0,
      openAIApiKey: OPENAI_API_KEY
    });
    
    // System prompt for summary analysis
    const systemPrompt = `You are a senior banking relationship manager creating an executive summary of client research.
Based on the consolidated research data for ${companyName}, create a comprehensive but concise summary of key findings.

Your summary should:
1. Provide a holistic view of the company's current situation
2. Highlight the most significant findings across all research areas
3. Draw connections between different aspects of the research
4. Emphasize particularly noteworthy banking opportunities
5. Highlight any critical recent developments
6. Keep a professional, objective tone

Format your response as a well-structured markdown summary with appropriate sections.
The summary should be comprehensive enough to be standalone but concise enough for an executive to read quickly.

While you should include important details from each research area, avoid simply listing everything - 
focus on synthesizing the information to provide valuable insights.`;

    // Create JSON string of research data
    const researchDataJson = JSON.stringify(researchData, null, 2);

    // Process with the model
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: `Here is the consolidated research data about ${companyName}:\n\n${researchDataJson}`
      }
    ]);
    
    const summary = response.content.toString();
    console.log("Summary generation completed successfully");
    
    // Handle executive data properly, ensuring it's an array first
    const executiveData = Array.isArray(state.executiveData) ? state.executiveData : [];
    const keyPersonnel = executiveData.map((person: DecisionMakerPerson) => ({
      name: person.name || "Unknown",
      role: person.title || "Unknown",
      background: person.background || "Unknown"
    }));
    
    // Construct the final output by combining all collected data
    // IMPORTANT: Preserve the aggregated output and only add/update the summary
    return {
      output: {
        // Preserve all existing aggregated data
        ...(state.output || {}),
        // Override/add the summary
        summary: summary,
        // Ensure we have all the key fields populated
        financialOverview: state.output?.financialOverview || (typeof state.financialData === 'string' ? state.financialData : getStringValue(state.financialData)),
        keyDecisionMakers: state.output?.keyDecisionMakers || executiveData,
        decisionMakers: state.output?.decisionMakers || {
          keyPersonnel: keyPersonnel,
          decisionProcess: "" // No specific decision process data available
        }
      }
    };
  } catch (error) {
    console.error("Error in summary generation:", error);
    return {
      error: `Summary generation error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 