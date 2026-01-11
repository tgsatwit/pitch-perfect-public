import { PitchOutlineAnnotation, type PitchOutlineReturnType } from "../state";
import { RunnableConfig } from "@langchain/core/runnables";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

/**
 * Aggregator node for combining results and saving to Firebase
 */
export async function aggregatorNode(
  state: typeof PitchOutlineAnnotation.State,
  config?: RunnableConfig
): Promise<PitchOutlineReturnType> {
  console.log("[aggregatorNode] Aggregating results and saving to Firebase");
  
  try {
    if (state.error) {
      console.error("[aggregatorNode] Error from previous steps:", state.error);
      return {
        output: {
          initialOutline: "",
          error: state.error
        }
      };
    }
    
    if (!state.outlineText) {
      const errorMessage = "No outline was generated.";
      console.error("[aggregatorNode]", errorMessage);
      return {
        output: {
          initialOutline: "",
          error: errorMessage
        }
      };
    }
    
    // Prepare final output
    const result = {
      initialOutline: state.outlineText,
      summary: state.outlineSummary
    };
    
    // Save to Firebase if pitch ID is available
    if (state.input.pitchId) {
      try {
        console.log(`[aggregatorNode] Updating pitch document ${state.input.pitchId} with outline`);
        const pitchDocRef = doc(db, "pitches", state.input.pitchId);
        await updateDoc(pitchDocRef, {
          initialOutline: state.outlineText,
          status: 'outline-generated',
        });
        console.log("[aggregatorNode] Successfully updated pitch document with outline");
      } catch (error) {
        console.error("[aggregatorNode] Error updating pitch document:", error);
        // Continue to return the result even if saving to Firebase fails
      }
    } else {
      console.log("[aggregatorNode] No pitch ID provided, skipping Firebase update");
    }
    
    return {
      output: result
    };
  } catch (error) {
    console.error("[aggregatorNode] Error:", error);
    return {
      output: {
        initialOutline: "",
        error: `Aggregation error: ${error instanceof Error ? error.message : String(error)}`
      }
    };
  }
} 