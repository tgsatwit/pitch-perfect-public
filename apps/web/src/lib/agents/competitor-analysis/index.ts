import { ChatOpenAI } from "@langchain/openai";
import type { CompetitorAnalysisInput, CompetitorAnalysisOutput } from "./types";

// Define the competitor analysis function with a basic implementation
const competitorAnalysisAgent = async (input: CompetitorAnalysisInput): Promise<CompetitorAnalysisOutput> => {
  try {
    const model = new ChatOpenAI({
      modelName: "gpt-4-turbo",
      temperature: 0.2,
    });

    // Build the prompt for the competitor analysis
    const focusAreasText = input.focusAreas && input.focusAreas.length > 0 
      ? `Focus particularly on these areas: ${input.focusAreas.join(", ")}.` 
      : "Provide a comprehensive analysis covering company overview, products, financials if available, marketing strategy, and competitive position.";

    const customQueriesText = input.customQueries && input.customQueries.length > 0
      ? `Also answer these specific questions about the competitor: ${input.customQueries.join(" ")}` 
      : "";

    const pitchContextText = input.pitchContext 
      ? `This analysis will be used in the following context: ${input.pitchContext}. Make the analysis relevant to this context.` 
      : "";

    const websiteText = input.website 
      ? `The competitor's website is: ${input.website}.` 
      : "";

    const systemPrompt = `
      You are an expert competitive analyst. You provide detailed, structured information about competitors.
      Your output must be in JSON format with the following structure:
      {
        "summary": "A concise summary of the competitor analysis",
        "findings": {
          "company": {
            "name": "Company name",
            "description": "Brief description",
            "website": "Website URL if available",
            "foundedYear": "Year founded if available",
            "headquarters": "HQ location if available",
            "employees": "Employee count if available",
            "industry": "Industry if available"
          },
          "financials": {
            "revenue": "Revenue info if available",
            "funding": "Funding info if available",
            "valuation": "Valuation if available",
            "growth": "Growth metrics if available",
            "profitability": "Profitability info if available"
          },
          "products": {
            "mainProducts": ["List of main products"],
            "pricing": "Pricing information if available",
            "features": ["Key features"],
            "uniqueSellingPoints": ["USPs"]
          },
          "marketing": {
            "strategy": "Marketing strategy overview",
            "channels": ["Marketing channels used"],
            "messaging": "Key messaging themes",
            "audienceTargeting": "Target audience information"
          },
          "executives": {
            "key_people": [
              {
                "name": "Person name",
                "position": "Their position",
                "background": "Background info if available"
              }
            ]
          },
          "news": {
            "recentDevelopments": ["Recent news items"],
            "pressReleases": ["Recent press releases"]
          },
          "swot": {
            "strengths": ["Key strengths"],
            "weaknesses": ["Key weaknesses"],
            "opportunities": ["Key opportunities"],
            "threats": ["Key threats"]
          }
        },
        "competitiveAnalysis": "General competitive position analysis",
        "recommendations": ["Strategic recommendations"]
      }
      
      If you don't have specific information for a field, you can omit it.
      Use factual information where available, and make informed estimates when necessary.
    `;

    const userPrompt = `
      Perform a detailed competitive analysis on ${input.competitorName}.
      ${websiteText}
      ${focusAreasText}
      ${customQueriesText}
      ${pitchContextText}
      
      If you don't have specific information for a particular section, make informed estimates based on similar companies in the industry or indicate that the information is not available.
      
      Ensure the analysis is factual, objective, and provides actionable insights.
      Respond with ONLY the JSON output, no additional text or explanations.
    `;

    // Run the analysis and parse the response
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);
    
    // Extract JSON from the response
    let resultJson: CompetitorAnalysisOutput;
    try {
      // Strip any non-JSON content and parse
      const content = response.content.toString();
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      
      resultJson = JSON.parse(jsonMatch[0]) as CompetitorAnalysisOutput;
    } catch (parseError) {
      console.error("Error parsing response:", parseError);
      throw new Error("Failed to parse analysis results");
    }

    return {
      ...resultJson,
      error: undefined
    };
  } catch (error: any) {
    console.error("Error in competitor analysis agent:", error);
    
    return {
      summary: `Failed to complete analysis for ${input.competitorName}`,
      findings: {
        company: {
          name: input.competitorName,
          description: "Analysis failed to complete",
        }
      },
      error: error.message || "An unknown error occurred"
    };
  }
};

// Create a simple interface that matches the expected API
export const competitorAnalysis = {
  invoke: async (input: CompetitorAnalysisInput) => {
    const result = await competitorAnalysisAgent(input);
    return { output: result };
  }
}; 