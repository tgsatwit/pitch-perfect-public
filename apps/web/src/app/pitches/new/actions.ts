'use server';

// Dynamically import the generator to avoid client-side issues
import { generatePitchOutline } from "../../../../../agents/src/outline-generator";
// Import types directly from the types file instead of through index
import type { PitchOutlineGeneratorInput, PitchOutlineGeneratorResult } from "../../../../../agents/src/outline-generator/types";
import { generateSlides } from "../../../../../agents/src/slide-generation";
import type { SlideGenerationInput, SlideGenerationResult } from "../../../../../agents/src/slide-generation/types";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Server action to generate a pitch outline
 */
export async function generateOutlineServerAction(input: PitchOutlineGeneratorInput & { existingThreadId?: string | null }) {
  console.log("[Server Action] Starting pitch outline generation with agent...");
  
  try {
    // Prepare config with existing thread ID if available
    const config = input.existingThreadId ? {
      configurable: {
        thread_id: input.existingThreadId
      }
    } : undefined;
    
    // Generate the outline with the config
    const result = await generatePitchOutline(input, config);
    
    // Also update Firebase directly from the server action to ensure it succeeds
    if (input.pitchId && result.initialOutline) {
      try {
        console.log("[Server Action] Updating pitch document with generated outline");
        const pitchDocRef = doc(db, "pitches", input.pitchId);
        
        // Prepare update data
        const updateData: any = {
          initialOutline: result.initialOutline,
          outlineText: result.initialOutline,
          outlineSummary: result.summary || "Outline generated successfully",
          outlineGenerated: true, // Mark outline as generated for performance optimization
          status: 'outline-ready',
          lastUpdatedAt: new Date()
        };
        
        // Add thread ID if available in the result
        if (result.threadId) {
          updateData.langGraphThreadId = result.threadId;
          console.log("[Server Action] Adding thread ID to update:", result.threadId);
        }
        
        await updateDoc(pitchDocRef, updateData);
        
        console.log("[Server Action] Pitch document updated successfully");
      } catch (updateError) {
        console.error("[Server Action] Error updating pitch document:", updateError);
        // Continue despite error since we'll return the result anyway
      }
    }
    
    return { 
      success: true, 
      result,
      threadId: result.threadId // Return thread ID to client
    };
  } catch (error) {
    console.error("[Server Action] Error in outline generation:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error generating outline" 
    };
  }
}

/**
 * Server action to generate slide content
 */
export async function generateSlidesServerAction(input: SlideGenerationInput) {
  console.log("[Server Action] Starting slide generation with agent...");
  
  try {
    // Generate the slides
    const result = await generateSlides(input);
    
    // Update Firebase with the generated slides
    if (input.pitchId && result.slides) {
      try {
        console.log("[Server Action] Updating pitch document with generated slides");
        const pitchDocRef = doc(db, "pitches", input.pitchId);
        
        // Convert slides to the format expected by the frontend
        const slidesForStorage = result.slides.map(slide => ({
          id: slide.id,
          type: slide.type,
          content: slide.content
        }));
        
        const updateData = {
          slides: slidesForStorage,
          slideGenerationMetadata: result.generationMetadata,
          status: 'slides-ready',
          lastUpdatedAt: new Date()
        };
        
        await updateDoc(pitchDocRef, updateData);
        
        console.log("[Server Action] Pitch document updated with generated slides");
      } catch (updateError) {
        console.error("[Server Action] Error updating pitch document with slides:", updateError);
        // Continue despite error since we'll return the result anyway
      }
    }
    
    return { 
      success: true, 
      result
    };
  } catch (error) {
    console.error("[Server Action] Error in slide generation:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error generating slides" 
    };
  }
} 