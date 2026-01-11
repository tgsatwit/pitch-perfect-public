import { SlideGenerationAnnotation, type SlideGenerationReturnType } from "../state";
import { ChatOpenAI } from "@langchain/openai";

/**
 * Reviewer Node
 * 
 * Reviews generated slides for repetitive content and narrative consistency
 */
export async function reviewerNode(
  state: typeof SlideGenerationAnnotation.State
): Promise<SlideGenerationReturnType> {
  console.log(`[reviewerNode] Reviewing ${state.generatedSlides.length} slides for quality and consistency`);
  
  try {
    const { generatedSlides, input } = state;
    
    if (!generatedSlides || generatedSlides.length === 0) {
      return { error: "No slides to review" };
    }
    
    // Initialize OpenAI model for review
    // Note: o3-mini doesn't support maxTokens parameter, using model defaults
    const model = new ChatOpenAI({
      modelName: "o3-mini",
    });
    
    // Prepare slides content for review
    const slidesContent = generatedSlides
      .sort((a, b) => (a.metadata?.outline.number || 0) - (b.metadata?.outline.number || 0))
      .map(slide => {
        const outline = slide.metadata?.outline;
        const content = slide.content;
        
        return `SLIDE ${outline?.number}: ${outline?.title}
Purpose: ${outline?.purpose || 'Not specified'}
Key Content: ${outline?.keyContent?.join(', ') || 'Not specified'}
Generated Content: ${content?.blocks?.map(block => `${block.type}: ${block.content}`).join(' | ') || 'No content'}
Key Takeaway: ${outline?.keyTakeaway || 'Not specified'}
---`;
      }).join('\n\n');
    
    // Create the prompts directly
    const systemPrompt = `You are a professional pitch deck reviewer. Your task is to analyze a set of generated slides and identify:

1. REPETITIVE CONTENT: Look for duplicate information, similar bullet points, or redundant messaging across slides
2. NARRATIVE CONSISTENCY: Ensure the story flows logically from slide to slide
3. CONTENT GAPS: Identify missing connections or abrupt transitions
4. QUALITY ISSUES: Flag slides with poor structure or unclear messaging

For each issue found, provide:
- Slide numbers affected
- Description of the issue
- Specific recommendation for improvement
- Severity level (HIGH, MEDIUM, LOW)

Return your analysis as a JSON object with this structure:
{
  "issues": [
    {
      "type": "repetitive_content" | "narrative_gap" | "quality_issue",
      "severity": "HIGH" | "MEDIUM" | "LOW",
      "affectedSlides": [slide_numbers],
      "description": "Description of the issue",
      "recommendation": "Specific recommendation for improvement"
    }
  ],
  "overallScore": 1-10,
  "summary": "Brief summary of review findings"
}`;

    const userPrompt = `Please review these slides for a pitch to ${input.clientName}:

PITCH CONTEXT:
- Client: ${input.clientName}
- Stage: ${input.pitchStage}
- Focus: ${input.pitchContext?.additionalContext?.pitchFocus || 'Not specified'}

SLIDES TO REVIEW:
${slidesContent}

Provide your detailed review analysis.`;
    
    // Run the review
    const reviewResponse = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);
    
    // Parse review results
    let reviewResults;
    try {
      const content = reviewResponse.content as string;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : content;
      reviewResults = JSON.parse(jsonContent);
    } catch (parseError) {
      console.warn("[reviewerNode] Could not parse review results, using default");
      reviewResults = {
        issues: [],
        overallScore: 7,
        summary: "Review completed but results could not be parsed properly"
      };
    }
    
    console.log(`[reviewerNode] Review completed. Found ${reviewResults.issues?.length || 0} issues. Overall score: ${reviewResults.overallScore}/10`);
    
    return {
      reviewResults,
      needsRevision: reviewResults.overallScore < 7 || 
                    (reviewResults.issues && reviewResults.issues.some((issue: any) => issue.severity === 'HIGH'))
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[reviewerNode] Error in review: ${errorMessage}`);
    
    return {
      error: `Review failed: ${errorMessage}`
    };
  }
} 