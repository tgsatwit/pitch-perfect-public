import { NextRequest, NextResponse } from "next/server";
import { client_search } from "@/../../agents/src/client-search";
import type { ClientSearchInput } from "@/../../agents/src/client-search/types";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate input
    if (!body.companyName) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }
    
    // Prepare the input for the client-search agent
    const input: ClientSearchInput = {
      companyName: body.companyName,
      website: body.website,
      clientType: body.clientType || "prospective",
      relationshipStartDate: body.relationshipStartDate,
      currentMFI: body.currentMFI,
    };
    
    // Call the client-search agent using the LangGraph client
    console.log("Calling client-search agent with input:", input);
    const result = await client_search.invoke(input);
    
    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in client-search API route:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
} 