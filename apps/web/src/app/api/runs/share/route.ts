import { NextRequest, NextResponse } from "next/server";
import { Client } from "langsmith";

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 seconds

async function shareRunWithRetry(
  lsClient: Client,
  runId: string
): Promise<string> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Attempt ${attempt} to share run ${runId}`);
      
      // Validate runId format (should be a UUID)
      if (!runId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        throw new Error(`Invalid run ID format: ${runId}`);
      }
      
      const result = await lsClient.shareRun(runId);
      console.log(`Successfully shared run ${runId}`);
      return result;
    } catch (error) {
      console.warn(
        `Attempt ${attempt} failed. Error details:`,
        error
      );
      
      // Check if this is a non-retriable error
      if (error instanceof Error && 
          (error.message.includes("Invalid run ID format") || 
           error.message.includes("not found") ||
           error.message.includes("Permission denied"))) {
        throw error; // Don't retry for invalid run IDs or permission issues
      }
      
      if (attempt === MAX_RETRIES) {
        throw error;
      }
      
      console.warn(
        `Retrying in ${RETRY_DELAY / 1000} seconds...`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
  throw new Error("Max retries reached"); // This line should never be reached due to the throw in the loop
}

export async function POST(req: NextRequest) {
  const { runId } = await req.json();

  if (!runId) {
    return new NextResponse(
      JSON.stringify({
        error: "`runId` is required to share run.",
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const apiUrl = process.env.LANGCHAIN_ENDPOINT || "https://api.smith.langchain.com";
  console.log(`Using LangSmith API URL: ${apiUrl}`);
  
  const lsClient = new Client({
    apiKey: process.env.LANGCHAIN_API_KEY,
    apiUrl,
  });

  try {
    console.log(`Attempting to share run with id ${runId}`);
    const sharedRunURL = await shareRunWithRetry(lsClient, runId);

    return new NextResponse(JSON.stringify({ sharedRunURL }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(
      `Failed to share run with id ${runId} after ${MAX_RETRIES} attempts:\n`,
      error
    );
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error name:", error.name);
      console.error("Error stack:", error.stack);
    }
    
    // Provide more specific error messages
    let errorMessage = "Failed to share run after multiple attempts.";
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes("Invalid run ID format")) {
        errorMessage = `Invalid run ID format: ${runId}`;
        statusCode = 400;
      } else if (error.message.includes("not found")) {
        errorMessage = `Run with ID ${runId} not found`;
        statusCode = 404;
      } else if (error.message.includes("Permission denied")) {
        errorMessage = "Permission denied to share this run";
        statusCode = 403;
      }
    }
    
    return new NextResponse(
      JSON.stringify({ 
        error: errorMessage,
        details: error instanceof Error ? error.message : String(error)
      }),
      {
        status: statusCode,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
