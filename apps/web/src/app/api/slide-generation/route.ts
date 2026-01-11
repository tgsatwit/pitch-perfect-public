import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage } from '@langchain/core/messages';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';

// Define the model to use
const model = new ChatOpenAI({
  modelName: 'gpt-4-turbo',
  temperature: 0.5,
});

// Default slide content in case of errors
const defaultSlideContent = {
  blocks: [
    {
      type: 'text',
      content: 'Failed to generate proper slide content. Please try again.'
    }
  ]
};

// Function to generate content for a slide
async function generateSlideContent(
  model: ChatOpenAI,
  outlineText: string,
  slideName: string,
  slideNumber: number,
  totalSlides: number,
  pitchContext: any,
  guidance?: string
) {
  const template = ChatPromptTemplate.fromMessages([
    new HumanMessage(`You are a professional pitch deck expert tasked with generating high-quality slide content based on an outline.

CONTEXT ABOUT THE PITCH:
Company Name: ${pitchContext.clientName || 'the company'}
Pitch Stage: ${pitchContext.pitchStage || 'Not specified'}
Important to Client: ${pitchContext.importantToClient || 'Not specified'}
Our Advantages: ${pitchContext.ourAdvantages || 'Not specified'}
Competitor Strengths: ${pitchContext.competitorStrengths || 'Not specified'}
Pitch Focus: ${pitchContext.pitchFocus || 'Not specified'}
Target Audience: Business decision makers and executives

OUTLINE FOR THE ENTIRE PRESENTATION:
${outlineText}

SLIDE INSTRUCTIONS:
You are currently working on slide ${slideNumber} of ${totalSlides}: "${slideName}"

${guidance ? `SPECIFIC GUIDANCE: ${guidance}` : ''}

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

Make sure the content is professional, concise, and impactful.
`)
  ]);

  // Create a chain that will call the model
  const chain = RunnableSequence.from([
    template,
    model,
    async (response: any) => {
      try {
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
        
        // Basic validation
        if (!content.blocks || !Array.isArray(content.blocks)) {
          throw new Error('Invalid slide content format: blocks array missing');
        }
        
        return content;
      } catch (error) {
        console.error('Error parsing slide content:', error);
        return defaultSlideContent;
      }
    }
  ]);

  try {
    return await chain.invoke({});
  } catch (error) {
    console.error('Error generating slide content:', error);
    return defaultSlideContent;
  }
}

export async function POST(req: Request) {
  try {
    // Parse the request body
    const body = await req.json();
    const { pitchId, outline, selectedSlides, pitchContext } = body;
    
    console.log("Received request with:", { 
      pitchId, 
      outlineLength: outline?.length, 
      selectedSlides,
      pitchContext: JSON.stringify(pitchContext).substring(0, 100) + "..."
    });

    // Validate the required fields
    if (!outline) {
      return NextResponse.json(
        { error: 'Outline is required' },
        { status: 400 }
      );
    }

    if (!selectedSlides || !Array.isArray(selectedSlides) || selectedSlides.length === 0) {
      return NextResponse.json(
        { error: 'Selected slides array is required' },
        { status: 400 }
      );
    }

    // Parse the outline to extract slide information
    const slideRegex = /#+\s*(?:Slide\s+)?(\d+)(?:\s*[:.]\s*|\s*[-–—]\s*|\s+)([^\n]+)(?:\n([\s\S]*?)(?=#+\s*(?:Slide\s+)?\d+(?:\s*[:.]\s*|\s*[-–—]\s*|\s+)|$))/gi;
    
    // Also try to match list-formatted slides
    const listSlideRegex = /(?:^|\n)(\d+)[.)]\s+([^\n]+)/gm;
    
    const slides: any[] = [];
    let match;
    
    // First try to match using the heading format
    while ((match = slideRegex.exec(outline)) !== null) {
      const slideNumber = parseInt(match[1]);
      const slideTitle = match[2].trim();
      const slideContent = match[3]?.trim() || '';
      
      slides.push({
        number: slideNumber,
        title: slideTitle,
        content: slideContent
      });
    }
    
    // If we didn't find enough slides, try the list format
    if (slides.length < selectedSlides.length) {
      while ((match = listSlideRegex.exec(outline)) !== null) {
        const slideNumber = parseInt(match[1]);
        const slideTitle = match[2].trim();
        
        // Only add if we don't already have this slide number
        if (!slides.some(s => s.number === slideNumber)) {
          slides.push({
            number: slideNumber,
            title: slideTitle,
            content: ''
          });
        }
      }
    }
    
    // Sort by slide number
    slides.sort((a, b) => a.number - b.number);
    
    console.log("Parsed slides from outline:", slides.map(s => `${s.number}: ${s.title}`));
    
    // Filter only selected slides - handle both objects with number property and plain numbers
    const slidesToProcess = slides.filter(slide => {
      // Handle case where selectedSlides contains slide numbers
      if (selectedSlides.includes(slide.number)) {
        return true;
      }
      
      // Handle case where selectedSlides contains objects with number property
      return selectedSlides.some((selected: any) => {
        if (typeof selected === 'object' && selected !== null) {
          return selected.number === slide.number;
        }
        return false;
      });
    });

    console.log(`Processing ${slidesToProcess.length} selected slides out of ${slides.length} total slides`);
    
    if (slidesToProcess.length === 0) {
      return NextResponse.json(
        { error: 'No slides found matching the selected slide numbers' },
        { status: 400 }
      );
    }
    
    // Generate content for each slide
    const totalSlides = slides.length;
    const generatedSlides = await Promise.all(
      slidesToProcess.map(async (slide) => {
        console.log(`Generating content for slide ${slide.number}: ${slide.title}`);
        
        try {
          const content = await generateSlideContent(
            model,
            outline,
            slide.title,
            slide.number,
            totalSlides,
            pitchContext
          );
          
          return {
            id: `slide-${slide.number}`,
            number: slide.number,
            title: slide.title,
            content
          };
        } catch (error) {
          console.error(`Error generating slide ${slide.number}:`, error);
          return {
            id: `slide-${slide.number}`,
            number: slide.number,
            title: slide.title,
            content: defaultSlideContent,
            error: 'Failed to generate content for this slide'
          };
        }
      })
    );
    
    console.log(`Successfully generated ${generatedSlides.length} slides`);
    
    return NextResponse.json({
      generatedSlides,
      message: `Generated content for ${generatedSlides.length} slides.`
    });
  } catch (error) {
    console.error('Error in slide generation API:', error);
    return NextResponse.json(
      { error: 'Failed to generate slide content' },
      { status: 500 }
    );
  }
} 