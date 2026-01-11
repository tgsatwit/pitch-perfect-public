import { NextRequest, NextResponse } from "next/server";
// Using the actual LangGraph agent implementation
import { researchClient } from "@/lib/agents/client-research";
import type { ClientResearchInput } from "@/lib/agents/client-research/types";
import { collection, doc, setDoc, updateDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Use dynamic import since the agent is in a different workspace package
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes max

// Re-export the types for external usage if needed
export type { ClientResearchInput };

export async function POST(req: NextRequest): Promise<NextResponse<any | { error: string }>> {
  // Create an array to store logs
  const logs: string[] = [];
  
  try {
    const body = await req.json();
    
    // Validate the input
    if (!body.companyName) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    const clientId = body.clientId;
    
    // Update client status to researching if clientId is provided
    if (clientId) {
      try {
        const clientRef = doc(db, "clients", clientId);
        await updateDoc(clientRef, {
          profileStatus: "researching",
          lastResearchStartTime: new Date()
        });
        logs.push(`Updated client ${clientId} status to researching`);
        console.log(`Updated client ${clientId} status to researching`);
      } catch (err) {
        logs.push(`Warning: Failed to update client status: ${err}`);
        console.warn(`Failed to update client status: ${err}`);
        // Continue with research even if status update fails
      }
    }

    logs.push(`Starting client research for: ${body.companyName}`);
    console.log("Starting client research for:", body.companyName);
    
    // Prepare input with the correct type
    const input: ClientResearchInput = {
      clientId: body.clientId,
      companyName: body.companyName,
      website: body.website,
      industry: body.industry,
      researchTopics: body.researchTopics,
      onProgress: (message: string) => {
        logs.push(message);
        console.log(message);
      }
    };
    
    // Invoke the agent
    const result = await researchClient(input);
    
    logs.push("Research completed successfully");
    console.log("Research completed successfully");
    
    // Store the research results in Firestore if clientId is provided
    if (clientId) {
      try {
        // Create a new document in the researchResults collection using addDoc
        const researchResultsCollection = collection(db, "researchResults");
        const resultsDocRef = await addDoc(researchResultsCollection, {
          clientId,
          companyName: body.companyName,
          timestamp: new Date(),
          results: result
        });
        
        // Update client status to complete and store the research data properly
        const clientRef = doc(db, "clients", clientId);
        
        // The LangGraph agent returns an object with 'output' containing all data including summary
        // We need to structure this properly for the frontend
        const researchData = {
          ...result.output,  // Contains the structured research data including summary
          summary: result.output?.summary || "No summary available",  // Summary from summarizer node
          timestamp: new Date(),
          clientId
        };
        
        await updateDoc(clientRef, {
          profileStatus: "complete",
          lastResearchCompleteTime: new Date(),
          lastResearchResultId: resultsDocRef.id,
          research: researchData
        });
        
        logs.push(`Stored research results for client ${clientId}`);
        console.log(`Stored research results for client ${clientId}`);
      } catch (err) {
        logs.push(`Warning: Failed to store research results: ${err}`);
        console.warn(`Failed to store research results: ${err}`);
        // Continue returning results even if storage fails
      }
    }

    // Return the research results with logs
    return NextResponse.json({
      ...result,
      logs
    });
  } catch (error: any) {
    logs.push(`Error in client research API: ${error.message || "Unknown error"}`);
    console.error("Error in client research API:", error);
    
    // If there's a client ID, update status to error
    if (req.body && typeof req.body === 'object' && 'clientId' in req.body) {
      try {
        const clientId = (req.body as any).clientId;
        if (clientId) {
          const clientRef = doc(db, "clients", clientId);
          await updateDoc(clientRef, {
            profileStatus: "error",
            lastResearchError: error.message || "Unknown error"
          });
          logs.push(`Updated client ${clientId} status to error`);
        }
      } catch (err) {
        logs.push(`Warning: Failed to update client error status: ${err}`);
        console.warn(`Failed to update client error status: ${err}`);
      }
    }
    
    return NextResponse.json(
      { error: error.message || "Failed to perform client research", logs },
      { status: 500 }
    );
  }
} 