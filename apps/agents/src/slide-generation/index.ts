import { z } from 'zod';
import { ChatOpenAI } from '@langchain/openai';
import { StateGraph, type LangGraphRunnableConfig, START, END } from "@langchain/langgraph";
import { SlideGenerationAnnotation, type SlideGenerationReturnType } from "./state";
import { SlideGenerationInput, SlideGenerationResult } from "./types";

// Import nodes
import { initializerNode } from "./nodes/initializer";
import { parallelSlideGeneratorNode } from "./nodes/slide-generator";
import { reviewerNode } from "./nodes/reviewer";
import { contentUpdaterNode } from "./nodes/content-updater";
import { titleEnhancerNode } from "./nodes/title-enhancer";
import { aggregatorNode } from "./nodes/aggregator";

// Core phase creator utility
const createLLMPhase = ({ name, llm, phase }: { 
  name: string;
  llm: ChatOpenAI;
  phase: (input: any) => Promise<any>;
}) => {
  return {
    name,
    run: phase
  };
};

// Schema for slide content
const slideContentSchema = z.object({
  blocks: z.array(
    z.object({
      type: z.enum(['title', 'subtitle', 'text', 'bullet', 'chart', 'table', 'image']),
      content: z.string(),
      data: z.any().optional(),
      style: z.string().optional(),
    })
  ),
  notes: z.string().optional(),
});

type SlideContent = z.infer<typeof slideContentSchema>;

// Default slide content in case of errors
const defaultSlideContent: SlideContent = {
  blocks: [
    {
      type: 'text',
      content: 'Failed to generate proper slide content. Please try again.'
    }
  ]
};

// Function to generate content for a slide
export async function generateSlideContent(
  model: ChatOpenAI,
  outlineText: string,
  slideName: string,
  slideNumber: number,
  totalSlides: number,
  pitchContext: any,
  guidance?: string
): Promise<SlideContent> {
  const systemPrompt = `You are a professional pitch deck expert tasked with generating high-quality slide content based on an outline.

CONTEXT ABOUT THE PITCH:
Company Name: ${pitchContext.companyName || 'the company'}
Industry: ${pitchContext.industry || 'Not specified'}
Pitch Stage: ${pitchContext.pitchStage || 'Not specified'}
Target Audience: Business decision makers and executives

TASK:
Create the content for this slide following institutional pitch best practices. Generate each content block separately.

Your output must be formatted as a JSON object with an array of "blocks", where each block represents a content element with the following structure:
{
  "blocks": [
    {
      "type": "title" | "subtitle" | "text" | "bullet" | "chart" | "table" | "image", 
      "content": string,
      "data": (optional) data for charts or tables,
      "style": (optional) styling information
    }
  ],
  "notes": "(optional) Speaker notes for this slide"
}

The "type" field should be one of: "title", "subtitle", "text", "bullet", "chart", "table", or "image".
For bullet points, create separate blocks with type "bullet" for each point.
For charts or tables, include structured data in the "data" field that can be used for visualization.

For presentation flow, consider:
1. Title/opening slides should be impactful and clear 
2. Content slides should have a clear structure with concise bullet points
3. Data slides should include insights, not just raw numbers
4. Closing slides should summarize and provide next steps

Make sure the content is professional, concise, and impactful.`;

  const userPrompt = `OUTLINE FOR THE ENTIRE PRESENTATION:
${outlineText}

SLIDE INSTRUCTIONS:
You are currently working on slide ${slideNumber} of ${totalSlides}: "${slideName}"

${guidance ? `SPECIFIC GUIDANCE: ${guidance}` : ''}

Generate the content for this slide based on the outline and context provided.`;

  try {
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);
    
    // Extract JSON from response if needed
    let content = response.content;
    if (typeof content === 'string') {
      // Extract JSON if it's wrapped in ```json blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        content = JSON.parse(jsonMatch[1]);
      } else {
        // Try to parse the whole content as JSON
        content = JSON.parse(content);
      }
    }
    
    // Validate against our schema
    return slideContentSchema.parse(content);
  } catch (error) {
    console.error('Error generating slide content:', error);
    return defaultSlideContent;
  }
}

// Create the slide generation phase for LangGraph
export const createSlideGenerationPhase = (model: ChatOpenAI) => {
  return createLLMPhase({
    name: 'slide-generation',
    llm: model,
    phase: async ({ outline, selectedSlides, pitchContext }: any) => {
      // Parse the outline to extract slide information
      const slideRegex = /#+\s*(?:Slide\s+)?(\d+)(?:\s*[:.]\s*|\s*[-–—]\s*|\s+)([^\n]+)(?:\n([\s\S]*?)(?=#+\s*(?:Slide\s+)?\d+(?:\s*[:.]\s*|\s*[-–—]\s*|\s+)|$))/gi;
      const slides: any[] = [];
      let match;
      
      while ((match = slideRegex.exec(outline)) !== null) {
        const slideNumber = parseInt(match[1]);
        const slideTitle = match[2].trim();
        const slideContent = match[3].trim();
        
        slides.push({
          number: slideNumber,
          title: slideTitle,
          content: slideContent
        });
      }
      
      // Sort by slide number
      slides.sort((a, b) => a.number - b.number);
      
      // Filter only selected slides if specified
      const slidesToProcess = selectedSlides && selectedSlides.length > 0
        ? slides.filter(slide => selectedSlides.includes(slide.number))
        : slides;
      
      // Generate content for each slide
      const totalSlides = slides.length;
      const generatedSlides = await Promise.all(
        slidesToProcess.map(async (slide) => {
          const content = await generateSlideContent(
            model,
            outline,
            slide.title,
            slide.number,
            totalSlides,
            pitchContext
          );
          
          return {
            number: slide.number,
            title: slide.title,
            content
          };
        })
      );
      
      return {
        generatedSlides,
        message: `Generated content for ${generatedSlides.length} slides.`
      };
    }
  });
};

export default createSlideGenerationPhase;

/**
 * Check if any error occurred during slide generation
 */
function checkErrors(
  state: typeof SlideGenerationAnnotation.State
): "reviewer" | "errorHandler" {
  if (state.error) {
    return "errorHandler";
  }
  return "reviewer";
}

/**
 * Check if slides need revision based on review results
 */
function checkRevisionNeeded(
  state: typeof SlideGenerationAnnotation.State
): "contentUpdater" | "titleEnhancer" {
  if (state.needsRevision) {
    return "contentUpdater";
  }
  return "titleEnhancer";
}

/**
 * Route after content update - always go to title enhancer
 */
function routeAfterUpdate(
  state: typeof SlideGenerationAnnotation.State
): "titleEnhancer" {
  return "titleEnhancer";
}

/**
 * Error handler node
 */
async function errorHandlerNode(
  state: typeof SlideGenerationAnnotation.State
): Promise<SlideGenerationReturnType> {
  console.error(`[errorHandlerNode] Slide generation failed: ${state.error}`);
  
  return {
    output: {
      slides: [],
      summary: `Slide generation failed: ${state.error}`,
      generationMetadata: {
        totalSlides: state.slideOutlines?.length || 0,
        successfulSlides: 0,
        failedSlides: state.slideOutlines?.length || 0,
        processingTime: 0,
        contextSources: []
      }
    }
  };
}

// Build the graph
const builder = new StateGraph(SlideGenerationAnnotation)
  .addNode("initializer", initializerNode)
  .addNode("slideGenerator", parallelSlideGeneratorNode)
  .addNode("reviewer", reviewerNode)
  .addNode("contentUpdater", contentUpdaterNode)
  .addNode("titleEnhancer", titleEnhancerNode)
  .addNode("aggregator", aggregatorNode)
  .addNode("errorHandler", errorHandlerNode);

// Define the enhanced graph flow
builder
  .addEdge(START, "initializer")
  .addEdge("initializer", "slideGenerator")
  .addConditionalEdges(
    "slideGenerator",
    checkErrors,
    ["reviewer", "errorHandler"]
  )
  .addConditionalEdges(
    "reviewer",
    checkRevisionNeeded,
    ["contentUpdater", "titleEnhancer"]
  )
  .addConditionalEdges(
    "contentUpdater",
    routeAfterUpdate,
    ["titleEnhancer"]
  )
  .addEdge("titleEnhancer", "aggregator")
  .addEdge("aggregator", END)
  .addEdge("errorHandler", END);

// Compile the graph
export const graph = builder.compile();

// Export the agent interface
export const slide_generation = {
  name: "slide_generation",
  metadata: {
    description: "Generates professional slide content for pitch decks using AI in parallel processing"
  },
  invoke: async (input: SlideGenerationInput | any, config?: LangGraphRunnableConfig) => {
    console.log("Slide Generation agent invoked with input:", input);
    try {
      // Generate a unique trace ID if not provided in config
      const configWithDefaults: LangGraphRunnableConfig = {
        ...config,
        configurable: {
          ...config?.configurable,
          thread_id: config?.configurable?.thread_id || `slide_generation_${Date.now()}`
        }
      };
      
      const result = await graph.invoke({
        input: input.input || input
      }, configWithDefaults);
      
      return result;
    } catch (error) {
      console.error("Error running Slide Generation agent:", error);
      return {
        error: error instanceof Error ? error.message : "Unknown error in Slide Generation agent"
      };
    }
  },
  stream: async function* (input?: SlideGenerationInput | any, config?: LangGraphRunnableConfig) {
    try {
      // Generate a unique trace ID if not provided in config
      const configWithDefaults: LangGraphRunnableConfig = {
        ...config,
        configurable: {
          ...config?.configurable,
          thread_id: config?.configurable?.thread_id || `slide_generation_${Date.now()}`
        }
      };
      
      const result = await graph.invoke({
        input: input?.input || input || {}
      }, configWithDefaults);
      
      yield result;
    } catch (error) {
      console.error("Error streaming from Slide Generation agent:", error);
      yield {
        error: error instanceof Error ? error.message : "Unknown error in Slide Generation agent"
      };
    }
  }
};

// Main function to generate slides with progress tracking
export const generateSlides = async (
  input: SlideGenerationInput, 
  config?: LangGraphRunnableConfig
): Promise<SlideGenerationResult> => {
  // Extract the onProgress callback if provided
  const { onProgress, ...restInput } = input;
  
  // Create a wrapper function to send progress updates
  const sendProgress = (message: string) => {
    if (onProgress && typeof onProgress === 'function') {
      try {
        onProgress(message);
        console.log(message); // Also log to console
      } catch (error) {
        console.error("Error in progress callback:", error);
      }
    } else {
      console.log(message); // Just log to console if no callback
    }
  };
  
  // Send initial progress message
  sendProgress(`Starting slide generation for ${input.clientName}`);
  
  // Helper to add delay between progress updates
  const sendDelayedProgress = async (message: string, delayMs: number) => {
    await new Promise(resolve => setTimeout(resolve, delayMs));
    sendProgress(message);
  };
  
  // Schedule progress updates with delays
  void sendDelayedProgress(`Initializing slide generation for ${input.slideOutlines.length} slides...`, 1000);
  void sendDelayedProgress("Setting up pitch context and slide outlines...", 2000);
  void sendDelayedProgress("Starting parallel slide content generation...", 3000);
  void sendDelayedProgress("Generating slide content using AI...", 5000);
  void sendDelayedProgress("Processing slide content and formatting...", 8000);
  void sendDelayedProgress("Reviewing slides for quality and consistency...", 12000);
  void sendDelayedProgress("Enhancing narrative flow and eliminating repetition...", 15000);
  void sendDelayedProgress("Generating compelling slide titles...", 18000);
  void sendDelayedProgress("Finalizing slide generation and aggregating results...", 21000);
  
  // Run the slide generation
  const result = await slide_generation.invoke(restInput, config);
  
  // Final completion message
  sendProgress("Slide generation completed successfully");
  
  // Return the output or throw error
  if ('error' in result && result.error) {
    throw new Error(result.error);
  }
  
  if (!('output' in result) || !result.output) {
    throw new Error("No output generated from slide generation");
  }
  
  return result.output;
};
