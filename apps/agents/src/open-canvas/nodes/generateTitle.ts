import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { Client } from "@langchain/langgraph-sdk";
import { OpenCanvasGraphAnnotation } from "../state.js";

export const generateTitleNode = async (
  state: typeof OpenCanvasGraphAnnotation.State,
  config: LangGraphRunnableConfig
) => {
  if (state.messages.length > 2) {
    // Skip if it's not first human ai conversation
    return {};
  }

  try {
    const threadId = config.configurable?.thread_id;
    if (!threadId) {
      throw new Error("thread_id not found in configurable");
    }

    // Extract relevant information from the configured state
    const metadata = config.configurable?.metadata || {};
    
    // Get client name and pitch stage from metadata
    const clientName = metadata.clientName || "";
    const pitchStage = metadata.pitchStage || "";
    
    // Create title by directly concatenating client name and pitch stage
    const title = clientName && pitchStage 
      ? `${clientName} ${pitchStage}`
      : metadata.title_prefix || "";
    
    const langGraphClient = new Client({
      apiUrl: `http://localhost:${process.env.PORT}`,
    });

    // Update thread metadata with the concatenated title
    await langGraphClient.threads.update(threadId, {
      metadata: {
        thread_title: title,
      },
    });
  } catch (e) {
    console.error("Failed to set title\n\n", e);
  }

  return {};
};
