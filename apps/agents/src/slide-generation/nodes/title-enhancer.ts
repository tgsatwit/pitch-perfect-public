import { SlideGenerationAnnotation, type SlideGenerationReturnType } from "../state";
import { ChatOpenAI } from "@langchain/openai";

/**
 * Title Enhancer Node
 * 
 * Generates compelling and consistent titles for all slides
 */
export async function titleEnhancerNode(
  state: typeof SlideGenerationAnnotation.State
): Promise<SlideGenerationReturnType> {
  console.log(`[titleEnhancerNode] Enhancing titles for ${state.generatedSlides.length} slides`);
  
  try {
    const { generatedSlides, input } = state;
    
    if (!generatedSlides || generatedSlides.length === 0) {
      return { error: "No slides to enhance titles for" };
    }
    
    // Initialize OpenAI model for title enhancement
    // Note: o3-mini doesn't support maxTokens parameter, using model defaults
    const model = new ChatOpenAI({
      modelName: "o3-mini",
    });
    
    // Prepare slides information for title enhancement
    const slidesInfo = generatedSlides
      .sort((a, b) => (a.metadata?.outline.number || 0) - (b.metadata?.outline.number || 0))
      .map(slide => {
        const outline = slide.metadata?.outline;
        const content = slide.content;
        
        return `SLIDE ${outline?.number}: "${outline?.title || ''}"
Purpose: ${outline?.purpose || 'Not specified'}
Key Takeaway: ${outline?.keyTakeaway || 'Not specified'}
Content Summary: ${content?.blocks?.slice(0, 3).map(block => block.content).join(' | ') || 'No content'}
---`;
      }).join('\n\n');
    
    // Create the prompts directly
    const systemPrompt = `You are a professional pitch deck title specialist. Your task is to create compelling, consistent, and impactful slide titles that:

1. GRAB ATTENTION: Use action words and compelling language
2. MAINTAIN CONSISTENCY: Follow a consistent style and tone throughout
3. TELL A STORY: Each title should contribute to the overall narrative
4. BE SPECIFIC: Avoid generic titles, make them specific to the content
5. STAY PROFESSIONAL: Appropriate for business executives

TITLE STYLE GUIDELINES:
- Use active voice when possible
- Include specific benefits or outcomes
- Keep titles concise but descriptive (5-8 words ideal)
- Use parallel structure across similar slide types
- Incorporate power words that resonate with executives
- Use British English spelling

Return your enhanced titles as a JSON object:
{
  "enhancedTitles": {
    "slideNumber": "Enhanced Title",
    ...
  },
  "titleStrategy": "Brief explanation of the title strategy used"
}`;

    const userPrompt = `Please enhance the titles for this pitch deck to ${input.clientName}:

PITCH CONTEXT:
- Client: ${input.clientName}
- Stage: ${input.pitchStage}
- Focus: ${input.pitchContext?.additionalContext?.pitchFocus || 'Not specified'}

CURRENT SLIDES AND TITLES:
${slidesInfo}

Create compelling titles that tell a cohesive story and grab executive attention while maintaining professionalism.`;
    
    // Generate enhanced titles
    const titleResponse = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);
    
    // Parse title results
    let titleResults;
    try {
      const content = titleResponse.content as string;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : content;
      titleResults = JSON.parse(jsonContent);
    } catch (parseError) {
      console.warn("[titleEnhancerNode] Could not parse title results, skipping title enhancement");
      return {};
    }
    
    if (!titleResults.enhancedTitles) {
      console.warn("[titleEnhancerNode] No enhanced titles found in response");
      return {};
    }
    
    // Apply enhanced titles to slides
    const enhancedSlides = generatedSlides.map(slide => {
      const slideNumber = slide.metadata?.outline.number;
      if (!slideNumber) return slide;
      
      const enhancedTitle = titleResults.enhancedTitles[slideNumber.toString()];
      
      if (enhancedTitle && enhancedTitle !== slide.metadata?.outline.title) {
        return {
          ...slide,
          content: {
            ...slide.content,
            title: enhancedTitle
          },
          metadata: slide.metadata ? {
            ...slide.metadata,
            enhancedTitle: enhancedTitle
          } : undefined
        };
      }
      
      return slide;
    });
    
    // Count how many titles were enhanced
    const enhancedCount = enhancedSlides.filter(slide => slide.metadata?.enhancedTitle).length;
    
    console.log(`[titleEnhancerNode] Enhanced ${enhancedCount} slide titles using strategy: ${titleResults.titleStrategy || 'Not specified'}`);
    
    return {
      generatedSlides: enhancedSlides,
      enhancedTitles: titleResults.enhancedTitles
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[titleEnhancerNode] Error in title enhancement: ${errorMessage}`);
    
    return {
      error: `Title enhancement failed: ${errorMessage}`
    };
  }
} 