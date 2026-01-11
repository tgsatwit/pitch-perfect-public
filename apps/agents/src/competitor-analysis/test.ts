import { graph, competitor_analysis } from "./index";
import { CompetitorAnalysisInput } from "./types";

async function testCompetitorAnalysis() {
  console.log("Testing Competitor Analysis agent...");
  
  const input: CompetitorAnalysisInput = {
    competitorName: "Example Bank Corp",
    website: "https://www.examplebank.com",
    pitchContext: {
      industry: "Financial Services",
      service: "Corporate Banking"
    },
    focusAreas: {
      financial: true,
      news: true,
      executiveTeam: true,
      products: true,
      pricing: true,
      marketPosition: true,
      pitchApproach: true
    },
    newsTimeFrame: 6,
    customQueries: "Focus on their digital transformation initiatives"
  };
  
  try {
    console.log("Invoking agent with input:", JSON.stringify(input, null, 2));
    const result = await competitor_analysis.invoke(input);
    
    // Type check and safely access the result
    if ('error' in result && result.error) {
      console.error("Error in test:", result.error);
    } else {
      // Use type assertion since we know the structure
      const state = result as any;
      
      if (state.output) {
        console.log("Test result summary:", state.output.summary);
        console.log("Test completed successfully!");
      } else {
        console.log("Test completed, but no output was returned:", result);
      }
    }
  } catch (error) {
    console.error("Exception in test:", error);
  }
}

// Only run the test if this file is executed directly
if (require.main === module) {
  testCompetitorAnalysis().catch(console.error);
}

export { testCompetitorAnalysis }; 