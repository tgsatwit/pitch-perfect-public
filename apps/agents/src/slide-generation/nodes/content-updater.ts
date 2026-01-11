import { SlideGenerationAnnotation, type SlideGenerationReturnType } from "../state";
import { ChatOpenAI } from "@langchain/openai";
import { GeneratedSlideContent } from "../types";

/**
 * Content Updater Node
 * 
 * Updates slide content based on review feedback to eliminate repetition and improve narrative flow
 */
export async function contentUpdaterNode(
  state: typeof SlideGenerationAnnotation.State
): Promise<SlideGenerationReturnType> {
  console.log(`[contentUpdaterNode] Updating content for ${state.generatedSlides.length} slides based on review feedback`);
  
  try {
    const { generatedSlides, reviewResults, input } = state;
    
    if (!generatedSlides || generatedSlides.length === 0) {
      return { error: "No slides to update" };
    }
    
    if (!reviewResults || !reviewResults.issues || reviewResults.issues.length === 0) {
      console.log("[contentUpdaterNode] No issues found in review, skipping content updates");
      return {};
    }
    
    // Initialize OpenAI model for content updates
    // Note: o3-mini doesn't support maxTokens parameter, using model defaults
    const model = new ChatOpenAI({
      modelName: "o3-mini",
    });
    
    // Group issues by affected slides
    const slideIssues: Record<number, any[]> = {};
    reviewResults.issues.forEach(issue => {
      issue.affectedSlides.forEach(slideNum => {
        if (!slideIssues[slideNum]) {
          slideIssues[slideNum] = [];
        }
        slideIssues[slideNum].push(issue);
      });
    });
    
    // Create the prompts directly
    const systemPrompt = `You are a professional pitch deck content editor. Your task is to revise slide content based on specific feedback to improve quality and narrative flow.

REVISION GUIDELINES:
1. Eliminate repetitive content across slides
2. Ensure smooth narrative transitions
3. Maintain professional tone and clarity
4. Keep content concise and impactful
5. Preserve the original slide structure and purpose
6. Use British English spelling and writing style consistently in all text you produce.

Return the revised content as a JSON object with the same structure as the original:
{
  "blocks": [
    {
      "type": "title" | "subtitle" | "text" | "bullet" | "chart" | "table" | "image",
      "content": "revised content",
      "data": (optional),
      "style": (optional)
    }
  ],
  "notes": "(optional) Updated speaker notes"
}`;
    
    // Update slides that have issues
    const updatedSlides: GeneratedSlideContent[] = [];
    
    for (const slide of generatedSlides) {
      const slideNumber = slide.metadata?.outline.number;
      
      if (!slideNumber || !slideIssues[slideNumber]) {
        // No issues with this slide, keep as is
        updatedSlides.push(slide);
        continue;
      }
      
      try {
        // Prepare context from other slides for better narrative consistency
        const contextSlides = generatedSlides
          .filter(s => s.metadata?.outline.number !== slideNumber)
          .map(s => `Slide ${s.metadata?.outline.number}: ${s.metadata?.outline.title || ''} - ${s.content?.blocks?.map(b => b.content).join(' | ') || 'No content'}`)
          .join('\n');
        
        // Format issues for this slide
        const issuesText = slideIssues[slideNumber]
          .map(issue => `- ${issue.type.toUpperCase()}: ${issue.description || ''}\n  Recommendation: ${issue.recommendation || ''}`)
          .join('\n');
        
        // Format original content
        const originalContent = slide.content?.blocks?.map(block => 
          `${block.type}: ${block.content}`
        ).join('\n') || 'No content';
        
        const userPrompt = `Please revise this slide content based on the feedback provided:

SLIDE ${slideNumber}: ${slide.metadata?.outline.title || 'Untitled'}

ORIGINAL CONTENT:
${originalContent}

ISSUES TO ADDRESS:
${issuesText}

CONTEXT FROM OTHER SLIDES:
${contextSlides}

Please provide the revised content that addresses these issues while maintaining the slide's purpose and improving the overall narrative flow.`;
        
        // Generate updated content
        const updateResponse = await model.invoke([
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]);
        
        // Parse updated content
        let updatedContent;
        try {
          const content = updateResponse.content as string;
          const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          const jsonContent = jsonMatch ? jsonMatch[1] : content;
          updatedContent = JSON.parse(jsonContent);
        } catch (parseError) {
          console.warn(`[contentUpdaterNode] Could not parse updated content for slide ${slideNumber}, keeping original`);
          updatedSlides.push(slide);
          continue;
        }
        
        // Create updated slide
        const updatedSlide: GeneratedSlideContent = {
          ...slide,
          content: updatedContent,
          metadata: {
            generatedAt: slide.metadata?.generatedAt || new Date().toISOString(), 
            outline: slide.metadata?.outline || {} as any, 
            contextUsed: slide.metadata?.contextUsed || [],
            revised: true,
            revisionReason: slideIssues[slideNumber].map(i => i.type).join(', ')
          }
        };
        
        updatedSlides.push(updatedSlide);
        console.log(`[contentUpdaterNode] Updated slide ${slideNumber} to address ${slideIssues[slideNumber].length} issues`);
        
      } catch (error) {
        console.error(`[contentUpdaterNode] Error updating slide ${slideNumber}:`, error);
        // Keep original slide if update fails
        updatedSlides.push(slide);
      }
    }
    
    console.log(`[contentUpdaterNode] Content update completed. Updated ${updatedSlides.filter(s => s.metadata?.revised).length} slides`);
    
    return {
      generatedSlides: updatedSlides
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[contentUpdaterNode] Error in content update: ${errorMessage}`);
    
    return {
      error: `Content update failed: ${errorMessage}`
    };
  }
} 