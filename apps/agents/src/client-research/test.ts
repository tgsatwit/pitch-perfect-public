import { researchClient } from "./index";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if environment variables are loaded
console.log("Environment check:");
console.log("- GOOGLE_API_KEY available:", !!process.env.GOOGLE_API_KEY);
console.log("- GOOGLE_CSE_ID available:", !!process.env.GOOGLE_CSE_ID);
console.log("- OPENAI_API_KEY available:", !!process.env.OPENAI_API_KEY);

/**
 * Test the client research agent
 */
async function testClientResearch() {
  console.log("\nTesting client research agent...");
  
  const testInput = {
    companyName: "Myer",
    industry: "Retail",
    website: "myer.com.au",
    researchTopics: {
      includeESG: true,
      includeBenchmarking: true,
      includeBankingRelationships: true,
      includeDecisionMakers: true
    }
  };
  
  try {
    console.log("\nTesting with input:", testInput);
    console.log("\nRunning client research. This may take a few minutes...");
    
    const startTime = Date.now();
    const result = await researchClient(testInput);
    const endTime = Date.now();
    
    console.log(`\nResearch completed in ${((endTime - startTime) / 1000).toFixed(2)} seconds.`);
    
    // Analyze what we got back
    if (result) {
      console.log("\nSummary of research results:");
      console.log("--------------------------");
      
      // Check if it's an error result
      if ('error' in result && typeof result.error === 'string') {
        console.log("ERROR:", result.error);
        return;
      }
      
      // Get the result data from either result or result.output
      // Use proper type assertion instead of ts-ignore
      const data = ('output' in result) ? result.output : result as any;
      
      // Run safe checks on each property before using it
      console.log("Financial Overview:", data.financialOverview ? "✅ Available" : "❌ Missing");
      
      if (data.keyMetrics && typeof data.keyMetrics === 'object') {
        console.log(`Key Metrics: ✅ Available (${Object.keys(data.keyMetrics).length} metrics)`);
      } else {
        console.log("Key Metrics: ❌ Missing");
      }
      
      console.log("Market Analysis:", data.marketAnalysis ? "✅ Available" : "❌ Missing");
      
      if (data.swotAnalysis && 
          Array.isArray(data.swotAnalysis.strengths) &&
          Array.isArray(data.swotAnalysis.weaknesses) &&
          Array.isArray(data.swotAnalysis.opportunities) &&
          Array.isArray(data.swotAnalysis.threats)) {
        console.log("SWOT Analysis: ✅ Available");
        console.log(`  - Strengths: ${data.swotAnalysis.strengths.length} items`);
        console.log(`  - Weaknesses: ${data.swotAnalysis.weaknesses.length} items`);
        console.log(`  - Opportunities: ${data.swotAnalysis.opportunities.length} items`);
        console.log(`  - Threats: ${data.swotAnalysis.threats.length} items`);
      } else {
        console.log("SWOT Analysis: ❌ Missing");
      }
      
      console.log("Recent Developments:", Array.isArray(data.recentDevelopments) ? 
        `✅ Available (${data.recentDevelopments.length} items)` : "❌ Missing");
        
      console.log("Banking Opportunities:", Array.isArray(data.bankingOpportunities) ? 
        `✅ Available (${data.bankingOpportunities.length} items)` : "❌ Missing");
      
      // Check for the additional research topics
      console.log("ESG Profile:", data.esgProfile ? "✅ Available" : "❌ Missing");
      console.log("Peer Comparison:", data.peerComparison ? "✅ Available" : "❌ Missing");
      console.log("Banking Relationships:", data.bankingRelationships ? "✅ Available" : "❌ Missing");
      console.log("Decision Makers:", data.decisionMakers ? "✅ Available" : "❌ Missing");
    }
    
    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("\nError testing client research agent:", error);
  }
}

// Run the test
testClientResearch(); 