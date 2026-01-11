import { NextRequest, NextResponse } from "next/server";
// Fix the import paths to match the actual project structure
import { competitorAnalysis } from "@/lib/agents/competitor-analysis";
import type { CompetitorAnalysisInput, CompetitorAnalysisOutput } from "@/lib/agents/competitor-analysis/types";

// Use dynamic import since the agent is in a different workspace package
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max

// Re-export the types for external usage if needed
export type { CompetitorAnalysisInput, CompetitorAnalysisOutput };

export async function POST(req: NextRequest): Promise<NextResponse<any>> {
  try {
    const body = await req.json();
    
    // Validate the input
    if (!body.competitorName) {
      return NextResponse.json(
        { error: "Competitor name is required" },
        { status: 400 }
      );
    }

    console.log("Starting competitor analysis for:", body.competitorName);
    
    // Prepare input with the correct type
    const input: CompetitorAnalysisInput = {
      competitorName: body.competitorName,
      website: body.website,
      pitchContext: body.pitchContext,
      focusAreas: body.focusAreas,
      newsTimeFrame: body.newsTimeFrame || 12,
      customQueries: body.customQueries
    };
    
    // Invoke the agent
    const result = await competitorAnalysis.invoke(input);

    // Check for errors
    if ('error' in result && result.error) {
      console.error("Error in competitor analysis:", result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    console.log("Competitor analysis completed successfully");

    // Use type assertion to safely access the output
    const analysisResult = result as any;
    
    // Return the analysis results
    return NextResponse.json(analysisResult.output || { error: "No output returned" });
  } catch (error: any) {
    console.error("Error in competitor analysis API:", error);
    
    return NextResponse.json(
      { error: error.message || "Failed to perform competitor analysis" },
      { status: 500 }
    );
  }
} 