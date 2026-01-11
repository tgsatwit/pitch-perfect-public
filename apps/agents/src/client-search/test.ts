import { graph } from './index';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if environment variables are loaded
console.log("Environment check:");
console.log("- GOOGLE_API_KEY available:", !!process.env.GOOGLE_API_KEY);
console.log("- GOOGLE_CSE_ID available:", !!process.env.GOOGLE_CSE_ID);

async function testClientSearch() {
  console.log("\nTesting client_search graph...");
  
  const testInput = {
    companyName: "Myer",
    clientType: "prospective" as const,
    website: "myer.com.au"
  };
  
  try {
    // Test the StateGraph API directly
    console.log("\nTesting with input:", testInput);
    const graphResult = await graph.invoke({
      input: testInput
    });
    
    console.log("\nResult:", JSON.stringify(graphResult, null, 2));
    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("\nError testing client_search graph:", error);
  }
}

testClientSearch(); 