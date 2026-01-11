import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { RunnableConfig } from "@langchain/core/runnables";
import { ClientResearchAnnotation } from "../state";
import { 
  ClientResearchResult,
  SWOTAnalysis,
  RecentDevelopment,
  BankingOpportunity,
  ESGProfile,
  PeerComparison,
  BankingRelationship,
  DecisionMakers
} from "../types";

// Define the enhanced state type that includes searchResults and analysisText
type EnhancedState = typeof ClientResearchAnnotation.State & {
  searchResults?: string;
  analysisText?: string;
};

// Environment variables for API access
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure this is set in your .env file

/**
 * Helper function to determine ESG focus from text
 */
export const determineESGFocus = (esgText: string): string => {
  const focusMap: {[key: string]: number} = {
    environmental: 0,
    social: 0, 
    governance: 0
  };
  
  // Simple keyword counting
  const lowerText = esgText.toLowerCase();
  if (lowerText.match(/environment|climate|carbon|emission|sustainable|green|renewable/g)) {
    focusMap.environmental += 1;
  }
  
  if (lowerText.match(/social|community|diversity|inclusion|employee|people|health|safety/g)) {
    focusMap.social += 1;
  }
  
  if (lowerText.match(/governance|board|compliance|ethic|transparency|risk|accountability/g)) {
    focusMap.governance += 1;
  }
  
  // Find the highest focus area
  const sortedFocus = Object.entries(focusMap)
    .sort((a, b) => b[1] - a[1]);
  
  if (sortedFocus[0][1] === 0) return "Not clearly defined";
  
  return sortedFocus[0][0].charAt(0).toUpperCase() + sortedFocus[0][0].slice(1);
};

/**
 * Extract a section of text from the full analysis
 */
async function extractSection(sectionName: string, text: string, llm: ChatOpenAI): Promise<string> {
  const systemPrompt = `Extract the "${sectionName}" section from the following text. If the section doesn't exist explicitly, synthesize a brief summary of relevant information based on the full text. Keep your response to just the extracted or synthesized text without any additional commentary.`;
  
  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(text)
  ]);
  
  return response.content.toString();
}

/**
 * Parse SWOT analysis from text
 */
async function parseSWOT(text: string, llm: ChatOpenAI): Promise<SWOTAnalysis> {
  const systemPrompt = `Extract the SWOT analysis from the following text. Format your response as a JSON object with these keys: strengths, weaknesses, opportunities, threats. Each key should have an array of strings as its value. Include 3-5 points for each category.

Example format:
{
  "strengths": ["Strong market position", "Diversified product line", "High customer loyalty"],
  "weaknesses": ["High debt levels", "Declining margins", "Limited international presence"],
  "opportunities": ["Expansion into emerging markets", "New product development", "Strategic acquisitions"],
  "threats": ["Increasing competition", "Regulatory changes", "Economic downturn"]
}`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(text)
    ]);
    
    const swotText = response.content.toString();
    const parsedSWOT = JSON.parse(swotText);
    
    // Ensure all required properties exist
    return {
      strengths: parsedSWOT.strengths || [],
      weaknesses: parsedSWOT.weaknesses || [],
      opportunities: parsedSWOT.opportunities || [],
      threats: parsedSWOT.threats || []
    };
  } catch (error) {
    console.warn("Error parsing SWOT analysis:", error);
    // Return empty arrays as fallback
    return {
      strengths: [],
      weaknesses: [],
      opportunities: [],
      threats: []
    };
  }
}

/**
 * Parse key metrics from text
 */
async function parseKeyMetrics(text: string, llm: ChatOpenAI): Promise<Record<string, string>> {
  const systemPrompt = `Extract key financial metrics from the following text. Format your response as a JSON object where the keys are the metric names and the values are the metric values as strings.

Example format:
{
  "Revenue": "$1.2 billion (2023)",
  "Profit Margin": "8.5%",
  "Market Cap": "$2.8 billion",
  "Debt-to-Equity Ratio": "0.6",
  "Cash Reserves": "$350 million",
  "Annual Growth Rate": "4.2%"
}

Include any metrics related to financial performance that you can find in the text.`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(text)
    ]);
    
    const metricsText = response.content.toString();
    return JSON.parse(metricsText);
  } catch (error) {
    console.warn("Error parsing key metrics:", error);
    return {}; // Return empty object as fallback
  }
}

/**
 * Parse recent developments from text
 */
async function parseRecentDevelopments(text: string, llm: ChatOpenAI): Promise<RecentDevelopment[]> {
  const systemPrompt = `Extract recent developments or events from the following text. Format your response as a JSON array of objects, each with these properties: title (string), date (string, optional), description (string).

Example format:
[
  {
    "title": "Acquisition of XYZ Company",
    "date": "March 2023",
    "description": "Acquired XYZ Company for $50 million to expand product offerings."
  },
  {
    "title": "New CEO Appointment",
    "date": "January 2023",
    "description": "Jane Smith appointed as new CEO following retirement of John Doe."
  }
]

Include 3-5 significant recent events, preferably with dates if available.`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(text)
    ]);
    
    const developmentsText = response.content.toString();
    return JSON.parse(developmentsText);
  } catch (error) {
    console.warn("Error parsing recent developments:", error);
    return []; // Return empty array as fallback
  }
}

/**
 * Parse banking opportunities from text
 */
async function parseBankingOpportunities(text: string, llm: ChatOpenAI): Promise<BankingOpportunity[]> {
  const systemPrompt = `Extract banking opportunities from the following text. Format your response as a JSON array of objects, each with these properties:
- service (string): The banking service or product
- rationale (string): Detailed rationale based on the company's needs
- urgency (string): Must be "high", "medium", or "low"
- competitivePosition (string): Our competitive position for offering this service

Example format:
[
  {
    "service": "Debt Refinancing",
    "rationale": "High debt levels with upcoming maturities suggest refinancing needs",
    "urgency": "high",
    "competitivePosition": "Strong due to existing relationships in this sector"
  },
  {
    "service": "Working Capital Facility",
    "rationale": "Seasonal business with high inventory requirements",
    "urgency": "medium",
    "competitivePosition": "Competitive offering with tailored terms"
  }
]

Identify 3-5 specific banking services based on identifiable business needs from the text.`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(text)
    ]);
    
    const opportunitiesText = response.content.toString();
    const opportunities = JSON.parse(opportunitiesText);
    
    // Validate the urgency field
    return opportunities.map((opp: any) => ({
      ...opp,
      urgency: ["high", "medium", "low"].includes(opp.urgency?.toLowerCase())
        ? opp.urgency.toLowerCase()
        : "medium" // Default to medium if invalid
    }));
  } catch (error) {
    console.warn("Error parsing banking opportunities:", error);
    return []; // Return empty array as fallback
  }
}

/**
 * Parse ESG profile from text
 */
async function parseESG(text: string, llm: ChatOpenAI): Promise<ESGProfile> {
  const systemPrompt = `Extract ESG (Environmental, Social, Governance) profile information from the following text. Format your response as a JSON object with these properties:
- commitments (array of strings): Environmental, social, and governance commitments
- initiatives (array of strings): Specific ESG initiatives or programs
- ratings (object, optional): ESG ratings from rating agencies if mentioned
- focus (string): The primary ESG focus area (Environmental, Social, or Governance)

Example format:
{
  "commitments": ["Carbon neutral by 2030", "Increase board diversity to 40% women"],
  "initiatives": ["Solar panel installation program", "Community education fund"],
  "ratings": {
    "MSCI": "AA",
    "Sustainalytics": "Low Risk"
  },
  "focus": "Environmental"
}`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(text)
    ]);
    
    const esgText = response.content.toString();
    const esgData = JSON.parse(esgText);
    
    // Ensure required properties exist
    return {
      commitments: esgData.commitments || [],
      initiatives: esgData.initiatives || [],
      ratings: esgData.ratings || {},
      focus: esgData.focus || determineESGFocus(text)
    };
  } catch (error) {
    console.warn("Error parsing ESG profile:", error);
    return {
      commitments: [],
      initiatives: [],
      focus: "Not clearly defined"
    };
  }
}

/**
 * Parse peer comparison from text
 */
async function parsePeerComparison(text: string, llm: ChatOpenAI): Promise<PeerComparison> {
  const systemPrompt = `Extract peer comparison information from the following text. Format your response as a JSON object with these properties:
- metrics (object, optional): Key metrics compared against peers
- insights (array of strings): Insights from the peer comparison
- comparedCompanies (array of strings): Names of companies compared

Example format:
{
  "metrics": {
    "Market Share": "15% vs. industry average of 12%",
    "Profit Margin": "8.5% vs. peer average of 7.2%"
  },
  "insights": [
    "Outperforming peers in domestic market but lagging in international expansion",
    "Higher R&D spending than industry average"
  ],
  "comparedCompanies": ["Competitor A", "Competitor B", "Competitor C"]
}`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(text)
    ]);
    
    const comparisonText = response.content.toString();
    const comparisonData = JSON.parse(comparisonText);
    
    return {
      metrics: comparisonData.metrics || {},
      insights: comparisonData.insights || [],
      comparedCompanies: comparisonData.comparedCompanies || []
    };
  } catch (error) {
    console.warn("Error parsing peer comparison:", error);
    return {
      insights: [],
      comparedCompanies: []
    };
  }
}

/**
 * Parse banking relationships from text
 */
async function parseBankingRelationships(text: string, llm: ChatOpenAI): Promise<BankingRelationship> {
  const systemPrompt = `Extract banking relationship information from the following text. Format your response as a JSON object with these properties:
- knownBankingPartners (array of strings): Known current banking partners
- recentRFPs (array of objects): Recent RFPs or banking mandate changes
- bankingSwitchHistory (string): Any history of switching banking partners
- painPoints (array of strings): Pain points in current banking relationships

Example format:
{
  "knownBankingPartners": ["Bank A", "Bank B"],
  "recentRFPs": [
    {
      "date": "Q2 2023",
      "description": "RFP for treasury management services"
    }
  ],
  "bankingSwitchHistory": "Switched from Bank C to Bank A in 2021 for primary transaction banking",
  "painPoints": ["Slow loan approval process", "Limited international capabilities"]
}`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(text)
    ]);
    
    const relationshipsText = response.content.toString();
    return JSON.parse(relationshipsText);
  } catch (error) {
    console.warn("Error parsing banking relationships:", error);
    return {
      knownBankingPartners: [],
      painPoints: []
    };
  }
}

/**
 * Parse decision makers from text
 */
async function parseDecisionMakers(text: string, llm: ChatOpenAI): Promise<DecisionMakers> {
  const systemPrompt = `Extract information about decision makers from the following text. Format your response as a JSON object with these properties:
- keyPersonnel (array of objects): Key decision makers with their roles
- treasuryStructure (string): Description of the treasury team structure
- decisionProcess (string): Information about the decision-making process

Example format:
{
  "keyPersonnel": [
    {
      "name": "Jane Smith",
      "role": "CFO",
      "background": "Former investment banker with 15 years experience"
    },
    {
      "name": "John Doe",
      "role": "Group Treasurer",
      "background": "20 years in corporate treasury"
    }
  ],
  "treasuryStructure": "Centralized treasury function with regional sub-treasurers",
  "decisionProcess": "Banking decisions require CFO and board approval for relationships over $10M"
}`;

  try {
    const response = await llm.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(text)
    ]);
    
    const decisionMakersText = response.content.toString();
    return JSON.parse(decisionMakersText);
  } catch (error) {
    console.warn("Error parsing decision makers:", error);
    return {
      keyPersonnel: []
    };
  }
}

/**
 * Node for extracting structured data from analysis text
 */
export const extractStructuredDataNode = async (
  state: EnhancedState,
  _config: RunnableConfig
): Promise<Partial<EnhancedState>> => {
  try {
    // Extract the analysis text
    const analysisText = state.analysisText;
    
    if (!analysisText) {
      throw new Error("No analysis text available for extraction");
    }
    
    console.log("Extracting structured data from analysis...");
    
    // Initialize the LLM
    const llm = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: 0.1,
      apiKey: OPENAI_API_KEY,
    });
    
    // Extract financial overview
    const financialOverview = await extractSection("Financial Overview", analysisText, llm);
    
    // Extract market analysis
    const marketAnalysis = await extractSection("Market Analysis", analysisText, llm);
    
    // Extract SWOT analysis as structured data
    const swotAnalysis = await parseSWOT(analysisText, llm);
    
    // Extract key metrics as a record
    const keyMetrics = await parseKeyMetrics(analysisText, llm);
    
    // Extract recent developments
    const recentDevelopments = await parseRecentDevelopments(analysisText, llm);
    
    // Extract banking opportunities
    const bankingOpportunities = await parseBankingOpportunities(analysisText, llm);
    
    // Extract optional sections based on the research topics that were included
    const input = state.input;
    let esgProfile, peerComparison, bankingRelationships, decisionMakers;
    
    // Default to including all research topics if none specified
    const includeESG = input?.researchTopics?.includeESG ?? true;
    const includeBenchmarking = input?.researchTopics?.includeBenchmarking ?? true;
    const includeBankingRelationships = input?.researchTopics?.includeBankingRelationships ?? true;
    const includeDecisionMakers = input?.researchTopics?.includeDecisionMakers ?? true;
    
    if (includeESG) {
      esgProfile = await parseESG(analysisText, llm);
    }
    
    if (includeBenchmarking) {
      peerComparison = await parsePeerComparison(analysisText, llm);
    }
    
    if (includeBankingRelationships) {
      bankingRelationships = await parseBankingRelationships(analysisText, llm);
    }
    
    if (includeDecisionMakers) {
      decisionMakers = await parseDecisionMakers(analysisText, llm);
    }
    
    // Extract details for industry tab
    const industryAnalysis = marketAnalysis;
    const marketPosition = await extractSection("Market Position", analysisText, llm);
    const marketShare = await extractSection("Market Share", analysisText, llm);
    
    // Compose the industry trends from market analysis and SWOT
    const industryTrends = [
      ...(swotAnalysis?.opportunities || []).filter(o => o.includes("industry") || o.includes("market")),
      ...(swotAnalysis?.threats || []).filter(t => t.includes("industry") || t.includes("market"))
    ];
    
    // Extract competitors from peer comparison or market analysis
    let competitors: string[] = [];
    if (peerComparison?.comparedCompanies) {
      competitors = peerComparison.comparedCompanies;
    } else {
      // Try to extract competitors from the market analysis text
      const competitorsText = await extractSection("Competitors", analysisText, llm);
      if (competitorsText) {
        competitors = competitorsText.split(/,|\n/).map(c => c.trim()).filter(Boolean);
      }
    }
    
    // Compile the research result
    const result: ClientResearchResult = {
      financialOverview,
      keyMetrics,
      marketAnalysis,
      swotAnalysis,
      recentDevelopments,
      bankingOpportunities,
      
      // Add optional sections if they were included
      ...(esgProfile && { esgProfile }),
      ...(peerComparison && { peerComparison }),
      ...(bankingRelationships && { bankingRelationships }),
      ...(decisionMakers && { decisionMakers }),
      
      // Add industry tab fields
      industryAnalysis,
      marketPosition,
      marketShare,
      competitors,
      industryTrends,
      
      // Additional fields
      corporateValues: esgProfile?.commitments || [],
      growthOpportunities: swotAnalysis?.opportunities || [],
    };
    
    console.log("Structured data extraction completed successfully");
    
    // Return the structured result
    return {
      output: result
    };
  } catch (error) {
    console.error("Error in data extraction node:", error);
    return {
      error: `Data extraction error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

export default extractStructuredDataNode; 