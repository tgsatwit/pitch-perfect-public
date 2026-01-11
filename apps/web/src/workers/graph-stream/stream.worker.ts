import { createClient } from "@/hooks/utils";
import { StreamConfig } from "./streamWorker.types";

// Since workers can't directly access the client SDK, you'll need to recreate/import necessary parts
const ctx: Worker = self as any;

ctx.addEventListener("message", async (event: MessageEvent<StreamConfig>) => {
  try {
    const { threadId, assistantId, input, modelName, modelConfigs, configurable: topLevelConfigurable } =
      event.data;

    const client = createClient();

    // Separate the state properties from the configurable property within the input object
    const { configurable, ...stateInput } = input as any;

    // Construct the config object, merging top-level and input-level configurables if needed
    const finalConfigurable = {
      customModelName: modelName,
      modelConfig: modelConfigs[modelName as keyof typeof modelConfigs],
      // Prioritize topLevelConfigurable if present, otherwise use from input
      supabase_user_id: topLevelConfigurable?.supabase_user_id || configurable?.supabase_user_id || "",
      assistant_id: topLevelConfigurable?.assistant_id || configurable?.assistant_id || assistantId,
      // Include any other configurable properties from both sources
      ...(configurable || {}),
      ...(topLevelConfigurable || {}),
    };

    // Call the stream method with input and config combined in the third argument
    const stream = client.runs.stream(threadId, assistantId, 
      {
        input: stateInput as Record<string, unknown>, // Pass the actual state keys under the 'input' key
        streamMode: "events", 
        config: {           
          configurable: finalConfigurable,
        }
      }
    );

    for await (const chunk of stream) {
      // Serialize the chunk and post it back to the main thread
      ctx.postMessage({
        type: "chunk",
        data: JSON.stringify(chunk),
      });
    }

    ctx.postMessage({ type: "done" });
  } catch (error: any) {
    ctx.postMessage({
      type: "error",
      error: error.message,
    });
  }
});
