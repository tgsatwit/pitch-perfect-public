import { SlideGenerationAnnotation, type SlideGenerationReturnType } from "../state";
import { SlideGenerationResult } from "../types";

/**
 * Aggregator Node
 * 
 * Combines all generated slides into the final result
 */
export async function aggregatorNode(
  state: typeof SlideGenerationAnnotation.State
): Promise<SlideGenerationReturnType> {
  console.log(`[aggregatorNode] Aggregating results for ${state.generatedSlides.length} generated slides`);
  
  try {
    const { generatedSlides, processingMetadata, input } = state;
    
    if (!generatedSlides || generatedSlides.length === 0) {
      throw new Error("No slides were generated successfully");
    }
    
    // Sort slides by their number for proper ordering
    const sortedSlides = [...generatedSlides].sort((a, b) => {
      const aNum = a.metadata?.outline.number || 0;
      const bNum = b.metadata?.outline.number || 0;
      return aNum - bNum;
    });
    
    // Calculate processing time
    const processingTime = processingMetadata?.endTime && processingMetadata?.startTime 
      ? processingMetadata.endTime - processingMetadata.startTime 
      : 0;
    
    // Collect all context sources used
    const allContextSources = new Set<string>();
    sortedSlides.forEach(slide => {
      slide.metadata?.contextUsed?.forEach(source => allContextSources.add(source));
    });
    
    // Generate summary
    const totalSlides = processingMetadata?.totalSlides || 0;
    const successfulSlides = processingMetadata?.completedSlides || 0;
    const failedSlides = processingMetadata?.failedSlides || 0;
    
    const summary = `Generated ${successfulSlides} of ${totalSlides} slides successfully for ${input.clientName}. ` +
      `Processing completed in ${Math.round(processingTime / 1000)}s. ` +
      `Context sources used: ${Array.from(allContextSources).join(', ')}.` +
      (failedSlides > 0 ? ` ${failedSlides} slides failed to generate.` : '');
    
    // Create the final result
    const result: SlideGenerationResult = {
      slides: sortedSlides,
      summary,
      generationMetadata: {
        totalSlides,
        successfulSlides,
        failedSlides,
        processingTime,
        contextSources: Array.from(allContextSources)
      }
    };
    
    console.log(`[aggregatorNode] Aggregation complete: ${successfulSlides}/${totalSlides} slides`);
    
    return {
      output: result
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[aggregatorNode] Error in aggregation: ${errorMessage}`);
    
    return {
      error: `Aggregation failed: ${errorMessage}`
    };
  }
} 