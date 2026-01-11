import { GoogleCustomSearch } from "@langchain/community/tools/google_custom_search";
import { ResearchTopicConfig } from "../types";
import { ClientResearchAnnotation } from "../state";
import { RunnableConfig } from "@langchain/core/runnables";

// Define the enhanced state type that includes searchResults
type EnhancedState = typeof ClientResearchAnnotation.State & {
  searchResults?: string;
};

// Environment variables or known API credentials
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // Ensure this is set in your .env file
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID; // Ensure this is set in your .env file

/**
 * Generate search queries based on the company information and enabled research topics
 */
export function generateSearchQueries(
  companyName: string,
  industry = "",
  config?: ResearchTopicConfig
): string[] {
  // Core queries that are always included
  const queries = [
    `${companyName} Australia financial results annual report`,
    `${companyName} Australia market position competitors ${industry}`,
    `${companyName} Australia business strategy expansion`,
    `${companyName} Australia recent news developments`,
    `${companyName} Australia financial challenges opportunities`
  ];
  
  // Add topic-specific queries based on configuration
  const includeESG = config?.includeESG ?? true;
  const includeBenchmarking = config?.includeBenchmarking ?? true;
  const includeBankingRelationships = config?.includeBankingRelationships ?? true;
  const includeDecisionMakers = config?.includeDecisionMakers ?? true;
  
  if (includeESG) {
    queries.push(`${companyName} Australia ESG sustainability corporate social responsibility values`);
  }
  
  if (includeBenchmarking) {
    queries.push(`${companyName} Australia compared to competitors benchmarking industry performance`);
  }
  
  if (includeBankingRelationships) {
    queries.push(`${companyName} Australia banking partners financial services treasurer`);
  }
  
  if (includeDecisionMakers) {
    queries.push(`${companyName} Australia leadership team CFO Finance Director Treasurer`);
  }
  
  // Add custom topic queries if provided
  if (config?.customTopics && config.customTopics.length > 0) {
    config.customTopics.forEach(topic => {
      queries.push(`${companyName} Australia ${topic.searchQuery}`);
    });
  }
  
  return queries;
}

/**
 * Node for executing Google search queries
 */
export const performSearchNode = async (
  state: EnhancedState,
  _config: RunnableConfig
): Promise<Partial<EnhancedState>> => {
  try {
    // Extract input parameters
    const input = state.input;
    if (!input || !input.companyName) {
      throw new Error("Company name is required for research");
    }
    
    console.log(`Starting research for company: ${input.companyName}`);
    
    // Initialize the search tool with API credentials
    const searchTool = new GoogleCustomSearch({
      apiKey: GOOGLE_API_KEY,
      googleCSEId: GOOGLE_CSE_ID
    });
    
    // Generate search queries
    const searchQueries = generateSearchQueries(
      input.companyName,
      input.industry || "",
      input.researchTopics
    );
    
    // Add website-specific search if website is provided
    if (input.website) {
      searchQueries.push(`site:${input.website} about investors finance annual report`);
    }
    
    // Execute all searches in parallel and collect results
    console.log(`Executing ${searchQueries.length} search queries...`);
    const searchPromises = searchQueries.map(query => 
      searchTool.call(query)
        .catch(error => {
          console.warn(`Search failed for query "${query}": ${error.message}`);
          return `Search failed for query "${query}". Error: ${error.message}`;
        })
    );
    
    const searchResults = await Promise.all(searchPromises);
    
    // Combine search results
    const combinedResults = searchResults.join("\n\n");
    
    console.log("Search completed successfully");
    
    // Return the search results for the next node
    return {
      searchResults: combinedResults,
    };
  } catch (error) {
    console.error("Error in search node:", error);
    return {
      error: `Search error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

export default performSearchNode; 