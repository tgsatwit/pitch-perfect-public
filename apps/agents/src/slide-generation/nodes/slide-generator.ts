import { ChatOpenAI } from "@langchain/openai";
import { SlideGenerationAnnotation, type SlideGenerationReturnType } from "../state";
import { GeneratedSlideContent, SlideOutlineData } from "../types";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/**
 * Individual Slide Generator Node
 * 
 * Generates content for a single slide based on its outline and pitch context
 */
export async function slideGeneratorNode(
  state: typeof SlideGenerationAnnotation.State,
  slideOutline: SlideOutlineData
): Promise<SlideGenerationReturnType> {
  console.log(`[slideGeneratorNode] Starting generation for slide ${slideOutline.number}: ${slideOutline.title}`);
  
  try {
    const { input, contextData } = state;
    
    // Update progress to processing
    // const progressUpdate = {
    //   [slideOutline.id]: 'processing' as const
    // };
    
    // Initialize LLM - o3-mini doesn't support maxTokens, will use default limits
    const model = new ChatOpenAI({
      modelName: "o3-mini",
      openAIApiKey: OPENAI_API_KEY
      // Note: o3-mini doesn't support temperature or maxTokens parameters, using model defaults
    });
    
    // Build context string from available data
    const contextSources: string[] = [];
    let contextString = "";
    
    // Add client details
    if (contextData?.clientDetails) {
      contextString += `\n\nCLIENT DETAILS:\n${JSON.stringify(contextData.clientDetails, null, 2)}`;
      contextSources.push("Client Details");
    }
    
    // Add competitor details
    if (contextData?.competitorDetails && Object.keys(contextData.competitorDetails).length > 0) {
      contextString += `\n\nCOMPETITOR DETAILS:\n${JSON.stringify(contextData.competitorDetails, null, 2)}`;
      contextSources.push("Competitor Analysis");
    }
    
    // Add additional context
    if (contextData?.additionalContext) {
      const ctx = contextData.additionalContext;
      contextString += `\n\nADDITIONAL CONTEXT:`;
      if (ctx.importantClientInfo) contextString += `\nImportant Client Info: ${ctx.importantClientInfo}`;
      if (ctx.importantToClient) contextString += `\nWhat's Important to Client: ${ctx.importantToClient}`;
      if (ctx.ourAdvantages) contextString += `\nOur Advantages: ${ctx.ourAdvantages}`;
      if (ctx.competitorStrengths) contextString += `\nCompetitor Strengths: ${ctx.competitorStrengths}`;
      if (ctx.pitchFocus) contextString += `\nPitch Focus: ${ctx.pitchFocus}`;
      if (ctx.relevantCaseStudies) contextString += `\nRelevant Case Studies: ${ctx.relevantCaseStudies}`;
      if (ctx.keyMetrics) contextString += `\nKey Metrics: ${ctx.keyMetrics}`;
      if (ctx.implementationTimeline) contextString += `\nImplementation Timeline: ${ctx.implementationTimeline}`;
      if (ctx.expectedROI) contextString += `\nExpected ROI: ${ctx.expectedROI}`;
      contextSources.push("Pitch Context");
    }
    
    // Create the system prompt
    const systemPrompt = `You are an expert pitch deck content creator for institutional banking. Your task is to generate professional, compelling content for a single slide in a pitch presentation.

CRITICAL REQUIREMENTS:
1. Follow the slide outline EXACTLY - do not deviate from the specified purpose and key content
2. Use a professional, confident tone appropriate for winning business
3. Be specific and concrete rather than generic
4. Incorporate the provided context naturally and strategically
5. Focus on value proposition and client benefits
6. Use banking industry terminology appropriately
7. Use British English spelling and writing style consistently in all text you produce.

SLIDE TYPE: ${slideOutline.slideType}
${slideOutline.purpose ? `SLIDE PURPOSE: ${slideOutline.purpose}` : ''}
${slideOutline.keyTakeaway ? `KEY TAKEAWAY: ${slideOutline.keyTakeaway}` : ''}
${slideOutline.strategicFraming ? `STRATEGIC FRAMING: ${slideOutline.strategicFraming}` : ''}

${slideOutline.keyContent && slideOutline.keyContent.length > 0 ? `CONTENT STRUCTURE TO FOLLOW:
${slideOutline.keyContent.map((item, index) => `${index + 1}. ${item}`).join('\n')}` : ''}

${slideOutline.supportingEvidence && slideOutline.supportingEvidence.length > 0 ? `SUPPORTING EVIDENCE TO INCORPORATE:
${slideOutline.supportingEvidence.map((item, index) => `- ${item}`).join('\n')}` : ''}

${slideOutline.visualRecommendation ? `VISUAL RECOMMENDATION: ${slideOutline.visualRecommendation}` : ''}

${slideOutline.rawContent ? `COMPLETE SLIDE OUTLINE:
${slideOutline.rawContent}` : ''}

Return your response as a JSON object with this exact structure:
{
  "title": "Slide title (concise and impactful)",
  "subtitle": "Optional subtitle if needed",
  "body": "Main content as flowing text that can be broken into blocks",
  "blocks": [
    {
      "type": "heading|text|bullet",
      "content": "Content text",
      "level": 1-3
    }
  ]
}

The blocks array should represent the structured content that would appear on the slide. Use:
- "heading" for section headers (level 1-3 for hierarchy)
- "text" for paragraph content (level 1)
- "bullet" for bullet points (level 1-2 for sub-bullets)

Make the content compelling, specific to this client, and focused on winning their business.`;

    const userPrompt = `Generate content for slide ${slideOutline.number}: "${slideOutline.title}"

CLIENT: ${input.clientName}
PITCH STAGE: ${input.pitchStage}

CONTEXT AVAILABLE:${contextString}

Remember to:
- Follow the outline structure exactly
- Use the context to make content specific and relevant
- Maintain a professional, confident tone
- Focus on value and benefits to the client
- Be concrete and specific rather than generic`;

    console.log(`[slideGeneratorNode] Invoking LLM for slide ${slideOutline.number}...`);
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);
    
    const responseText = response.content.toString();
    
    // Parse JSON response
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                     responseText.match(/{[\s\S]*}/);
                     
    if (!jsonMatch) {
      throw new Error(`Failed to parse JSON from LLM response for slide ${slideOutline.number}`);
    }
    
    const jsonContent = jsonMatch[0].startsWith("{") ? jsonMatch[0] : jsonMatch[1];
    const parsedContent = JSON.parse(jsonContent);
    
    // Validate required fields
    if (!parsedContent.title || !parsedContent.blocks) {
      throw new Error(`Invalid content structure returned for slide ${slideOutline.number}`);
    }
    
    // Create the generated slide content
    const generatedSlide: GeneratedSlideContent = {
      id: slideOutline.id,
      type: slideOutline.slideType,
      content: {
        title: parsedContent.title,
        subtitle: parsedContent.subtitle || '',
        body: parsedContent.body || '',
        blocks: parsedContent.blocks.map((block: any) => ({
          type: block.type || 'text',
          content: block.content || '',
          level: block.level || 1
        }))
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        outline: slideOutline,
        contextUsed: contextSources
      }
    };
    
    console.log(`[slideGeneratorNode] Successfully generated content for slide ${slideOutline.number}`);
    
    // Update progress to completed
    const completedProgress = {
      [slideOutline.id]: 'completed' as const
    };
    
    return {
      generatedSlides: [generatedSlide],
      slideProgress: completedProgress
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[slideGeneratorNode] Error generating slide ${slideOutline.number}: ${errorMessage}`);
    
    // Update progress to failed
    const failedProgress = {
      [slideOutline.id]: 'failed' as const
    };
    
    return {
      slideProgress: failedProgress,
      error: `Failed to generate slide ${slideOutline.number}: ${errorMessage}`
    };
  }
}

/**
 * Parallel Slide Generation Coordinator Node
 * 
 * Coordinates the parallel generation of all slides
 */
export async function parallelSlideGeneratorNode(
  state: typeof SlideGenerationAnnotation.State
): Promise<SlideGenerationReturnType> {
  console.log(`[parallelSlideGeneratorNode] Starting parallel generation of ${state.slideOutlines?.length || 0} slides`);
  
  try {
    if (!state.slideOutlines || state.slideOutlines.length === 0) {
      throw new Error("No slide outlines provided for generation");
    }
    
    // Initialize progress for all slides
    const initialProgress: Record<string, 'pending' | 'processing' | 'completed' | 'failed'> = {};
    state.slideOutlines.forEach(outline => {
      initialProgress[outline.id] = 'pending';
    });
    
    // Update metadata
    const startTime = Date.now();
    const metadata = {
      startTime,
      totalSlides: state.slideOutlines.length,
      completedSlides: 0,
      failedSlides: 0
    };
    
    // Generate all slides in parallel
    const slidePromises = state.slideOutlines.map(outline => 
      slideGeneratorNode(state, outline)
    );
    
    console.log(`[parallelSlideGeneratorNode] Waiting for ${slidePromises.length} slide generations to complete...`);
    const results = await Promise.allSettled(slidePromises);
    
    // Collect results
    const generatedSlides: GeneratedSlideContent[] = [];
    const finalProgress: Record<string, 'pending' | 'processing' | 'completed' | 'failed'> = { ...initialProgress };
    const errors: string[] = [];
    
    results.forEach((result, index) => {
      const outline = state.slideOutlines![index];
      
      if (result.status === 'fulfilled' && result.value.generatedSlides) {
        generatedSlides.push(...result.value.generatedSlides);
        finalProgress[outline.id] = 'completed';
      } else {
        finalProgress[outline.id] = 'failed';
        const error = result.status === 'rejected' ? result.reason : result.value.error;
        errors.push(`Slide ${outline.number}: ${error}`);
      }
    });
    
    const endTime = Date.now();
    const finalMetadata = {
      ...metadata,
      endTime,
      completedSlides: generatedSlides.length,
      failedSlides: state.slideOutlines.length - generatedSlides.length
    };
    
    console.log(`[parallelSlideGeneratorNode] Completed: ${generatedSlides.length}/${state.slideOutlines.length} slides generated successfully`);
    
    if (errors.length > 0) {
      console.warn(`[parallelSlideGeneratorNode] Errors occurred: ${errors.join('; ')}`);
    }
    
    return {
      generatedSlides,
      slideProgress: finalProgress,
      processingMetadata: finalMetadata,
      ...(errors.length > 0 ? { error: `Some slides failed: ${errors.join('; ')}` } : {})
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[parallelSlideGeneratorNode] Critical error in parallel generation: ${errorMessage}`);
    
    return {
      error: `Parallel slide generation failed: ${errorMessage}`,
      processingMetadata: {
        startTime: Date.now(),
        endTime: Date.now(),
        totalSlides: state.slideOutlines?.length || 0,
        completedSlides: 0,
        failedSlides: state.slideOutlines?.length || 0
      }
    };
  }
} 