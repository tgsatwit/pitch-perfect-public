import { NextRequest, NextResponse } from "next/server";
import { ResearchPromptData } from "@/types/research";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Use dynamic import and increase timeout for AI calls
export const dynamic = "force-dynamic";
export const maxDuration = 120; // 2 minutes max

interface AIResearchRequest {
  promptId?: string;
  prompt: string;
  clientId: string;
  clientName: string;
  clientData?: any;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as AIResearchRequest;
    
    // Validate the input
    if (!body.prompt) {
      return NextResponse.json(
        { error: "Research prompt is required" },
        { status: 400 }
      );
    }

    if (!body.clientId) {
      return NextResponse.json(
        { error: "Client ID is required" },
        { status: 400 }
      );
    }
    
    console.log("Processing AI research for client:", body.clientName);
    
    // In a production environment, this would call your actual LLM service
    // For now, we'll mock a response after a delay
    
    // Replace [COMPANY] placeholders in the prompt with the actual client name
    const processedPrompt = body.prompt.replace(/\[COMPANY\]/g, body.clientName);
    
    // Pull any additional client data if needed
    let clientData = body.clientData;
    if (!clientData && body.clientId) {
      try {
        const clientDoc = await getDoc(doc(db, "clients", body.clientId));
        if (clientDoc.exists()) {
          clientData = clientDoc.data();
        }
      } catch (error) {
        console.warn("Could not fetch additional client data:", error);
      }
    }
    
    // If this is an existing prompt with an ID, mark it as "processing"
    if (body.promptId) {
      try {
        await updateDoc(doc(db, "researchPrompts", body.promptId), {
          aiProcessing: true,
          lastProcessedAt: new Date()
        });
      } catch (error) {
        console.warn("Could not update prompt processing status:", error);
      }
    }
    
    // Simulate AI processing with a delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate a mock response
    // In production, this would be the actual API call to your LLM
    const aiResponse = {
      result: `# AI Research Results for ${body.clientName}

## Overview
This is a simulated AI research response based on your prompt. In production, this would contain the actual research results from your LLM.

## Analysis
The prompt you provided was:

"${processedPrompt}"

This would generate a detailed analysis of ${body.clientName} based on your specified parameters.

## Key Findings
- First major finding about ${body.clientName}
- Second significant insight from the research
- Additional contextual information
- Market positioning analysis

## Recommendations
1. Primary recommendation based on the research
2. Secondary strategic suggestion
3. Additional opportunities identified

---
*Generated from AI research system*
`,
      metadata: {
        processedAt: new Date(),
        clientId: body.clientId,
        promptId: body.promptId || null,
        model: "mock-gpt-4", // In production, specify the actual model used
        processingTime: "3 seconds" // In production, track actual processing time
      }
    };
    
    // If this is an existing prompt with an ID, update its status
    if (body.promptId) {
      try {
        await updateDoc(doc(db, "researchPrompts", body.promptId), {
          aiProcessing: false,
          aiResponse: aiResponse.result,
          lastProcessedAt: new Date()
        });
      } catch (error) {
        console.warn("Could not update prompt with AI response:", error);
      }
    }
    
    return NextResponse.json(aiResponse);
    
  } catch (error: any) {
    console.error("Error in AI research API:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to process AI research request" },
      { status: 500 }
    );
  }
} 