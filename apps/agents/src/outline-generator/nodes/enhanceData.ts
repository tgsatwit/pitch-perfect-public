import { PitchOutlineAnnotation, type PitchOutlineReturnType } from "../state";
import { RunnableConfig } from "@langchain/core/runnables";

/**
 * Node for enhancing client and competitor data
 */
export async function enhanceDataNode(
  state: typeof PitchOutlineAnnotation.State,
  config?: RunnableConfig
): Promise<PitchOutlineReturnType> {
  console.log("[enhanceDataNode] Starting data enhancement");
  
  try {
    // If we have an error from a previous node, return it
    if (state.error) {
      return {};
    }
    
    // Check if we have client data
    if (!state.clientData) {
      console.log("[enhanceDataNode] No client data to enhance");
      return {
        enhancedClientData: null,
        enhancedCompetitorData: state.competitorData || {}
      };
    }
    
    // Process client data
    const enhancedClientData = {
      ...state.clientData,
      processedData: {
        industry: state.clientData.industry || "Unknown Industry",
        size: state.clientData.size || "Unknown Size",
        revenue: state.clientData.revenue || "Unknown Revenue",
      }
    };
    
    // Process competitor data
    const enhancedCompetitorData: Record<string, any> = {};
    
    if (state.competitorData) {
      for (const [id, competitor] of Object.entries(state.competitorData)) {
        enhancedCompetitorData[id] = {
          ...competitor,
          processedData: {
            industry: competitor.industry || "Unknown Industry",
            description: competitor.description || "No description available",
          }
        };
      }
    }
    
    // Extract list of competitor names for the prompt
    const competitorNames = Object.values(state.competitorData || {})
      .map((competitor: any) => competitor.name || "Unnamed Competitor")
      .join(", ");
    
    console.log("[enhanceDataNode] Data enhancement completed successfully");
    
    // Prepare data sources from selected categories
    let dataSourceContent = "";
    if (state.input.dataSourcesSelected) {
      dataSourceContent = "Selected Data Sources:\n";
      for (const [category, selected] of Object.entries(state.input.dataSourcesSelected)) {
        if (selected) {
          dataSourceContent += `- ${category}\n`;
        }
      }
    }
    
    if (state.input.subDataSourcesSelected && state.input.subDataSourcesSelected.length > 0) {
      dataSourceContent += "\nSelected Sub-Data Sources:\n";
      for (const subSource of state.input.subDataSourcesSelected) {
        dataSourceContent += `- ${subSource}\n`;
      }
    }
    
    if (state.input.uploadedFileNames && state.input.uploadedFileNames.length > 0) {
      dataSourceContent += "\nUploaded Files:\n";
      for (const fileName of state.input.uploadedFileNames) {
        dataSourceContent += `- ${fileName}\n`;
      }
    }
    
    return {
      enhancedClientData,
      enhancedCompetitorData,
      dataSourceContent
    };
  } catch (error) {
    console.error("[enhanceDataNode] Error:", error);
    return {
      error: `Data enhancement error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 