import { SlideGenerationAnnotation, type SlideGenerationReturnType } from "../state";

/**
 * Initializer Node
 * 
 * Sets up the context and slide outlines for generation
 */
export async function initializerNode(
  state: typeof SlideGenerationAnnotation.State
): Promise<SlideGenerationReturnType> {
  console.log(`[initializerNode] Initializing slide generation for ${state.input.clientName}`);
  
  try {
    const { input } = state;
    
    // Validate input
    if (!input.slideOutlines || input.slideOutlines.length === 0) {
      throw new Error("No slide outlines provided for generation");
    }
    
    if (!input.pitchContext) {
      throw new Error("No pitch context provided for generation");
    }
    
    console.log(`[initializerNode] Setting up generation for ${input.slideOutlines.length} slides`);
    
    // Initialize progress tracking for all slides
    const initialProgress: Record<string, 'pending' | 'processing' | 'completed' | 'failed'> = {};
    input.slideOutlines.forEach(outline => {
      initialProgress[outline.id] = 'pending';
    });
    
    // Set up initial metadata
    const initialMetadata = {
      startTime: Date.now(),
      totalSlides: input.slideOutlines.length,
      completedSlides: 0,
      failedSlides: 0
    };
    
    console.log(`[initializerNode] Initialization complete. Ready to generate ${input.slideOutlines.length} slides.`);
    
    return {
      contextData: input.pitchContext,
      slideOutlines: input.slideOutlines,
      slideProgress: initialProgress,
      processingMetadata: initialMetadata
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[initializerNode] Error in initialization: ${errorMessage}`);
    
    return {
      error: `Initialization failed: ${errorMessage}`
    };
  }
} 