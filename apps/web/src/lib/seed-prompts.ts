import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { ResearchPromptData } from "@/types/research";

// Template prompts for different research scenarios
export const templatePrompts: Omit<ResearchPromptData, "id" | "clientId" | "timestamp">[] = [
  {
    title: "Financial Health Assessment",
    category: "financial",
    prompt: `Provide a comprehensive analysis of [COMPANY]'s financial performance, key financial metrics, revenue streams, profitability, and investment outlook, using professional language and in well-structured paragraphs, focusing on recent developments (past 1-2 years).

Include a comparative analysis against key competitors in the industry.
Analyze relevant market trends and how they impact [COMPANY].`,
    parameters: {
      depth: "standard",
      tone: "formal",
      format: "paragraph",
      timeframe: "recent",
      includeCompetitors: true,
      includeMarketTrends: true,
      includeCaseStudies: false
    },
    tags: ["financial", "metrics", "competitors", "template"]
  },
  {
    title: "ESG Commitment Deep Dive",
    category: "esg",
    prompt: `Provide an in-depth investigation of [COMPANY]'s environmental initiatives, social responsibility programs, governance structure, and ESG ratings, using professional language and in well-structured paragraphs, including historical context and evolution.

Analyze relevant market trends and how they impact [COMPANY]'s ESG strategy.
Provide specific case studies or examples to illustrate key points.`,
    parameters: {
      depth: "deep",
      tone: "formal",
      format: "paragraph",
      timeframe: "historical",
      includeCompetitors: false,
      includeMarketTrends: true,
      includeCaseStudies: true
    },
    tags: ["esg", "sustainability", "governance", "case-studies", "template"]
  },
  {
    title: "Competitive Landscape Overview",
    category: "market",
    prompt: `Provide a high-level overview of [COMPANY]'s market position, market share, growth potential, and competitive landscape, in a conversational tone and in a bulleted list format, focusing on recent developments (past 1-2 years).

Include a comparative analysis against key competitors in the industry.
Analyze relevant market trends and how they impact [COMPANY].`,
    parameters: {
      depth: "basic",
      tone: "conversational",
      format: "bullet",
      timeframe: "recent",
      includeCompetitors: true,
      includeMarketTrends: true,
      includeCaseStudies: false
    },
    tags: ["market", "competitive", "trends", "template"]
  },
  {
    title: "Banking Needs Assessment",
    category: "financial",
    prompt: `Provide a standard analysis of [COMPANY]'s financial performance with specific focus on banking needs, credit facilities, treasury management, and international banking requirements. Present findings in a formal tone and in well-structured paragraphs, with forward-looking projections and predictions.

Include specific banking pain points and opportunities.
Analyze relevant financial trends and how they impact [COMPANY]'s banking needs.`,
    parameters: {
      depth: "standard",
      tone: "formal",
      format: "paragraph",
      timeframe: "future",
      includeCompetitors: false,
      includeMarketTrends: true,
      includeCaseStudies: false
    },
    tags: ["banking", "treasury", "financial-services", "template"]
  },
  {
    title: "Innovation Pipeline Evaluation",
    category: "innovation",
    prompt: `Provide an in-depth investigation of [COMPANY]'s technological innovation, R&D investments, patents, and digital transformation initiatives, with technical terminology and as a narrative report, focusing on recent developments (past 1-2 years) with forward-looking insights.

Include a comparative analysis against key competitors in the industry.
Provide specific case studies or examples to illustrate key points.`,
    parameters: {
      depth: "deep",
      tone: "technical",
      format: "narrative",
      timeframe: "recent",
      includeCompetitors: true,
      includeMarketTrends: false,
      includeCaseStudies: true
    },
    tags: ["innovation", "r&d", "technology", "patents", "template"]
  },
  {
    title: "Executive Leadership Assessment",
    category: "leadership",
    prompt: `Provide a comprehensive analysis of [COMPANY]'s leadership team, executive experience, management style, and decision-making processes, using professional language and in a bulleted list format, including historical context and recent changes.

Analyze relevant governance trends and how they impact [COMPANY]'s leadership approach.
Provide specific leadership backgrounds and notable achievements.`,
    parameters: {
      depth: "standard",
      tone: "formal",
      format: "bullet",
      timeframe: "historical",
      includeCompetitors: false,
      includeMarketTrends: true,
      includeCaseStudies: false
    },
    tags: ["leadership", "executives", "governance", "template"]
  },
  {
    title: "Regulatory Risk Profile",
    category: "risk",
    prompt: `Provide an in-depth investigation of [COMPANY]'s risk exposure, compliance status, regulatory challenges, and mitigation strategies, using technical terminology and in well-structured paragraphs, focusing on recent developments (past 1-2 years) and emerging regulatory trends.

Include a comparative analysis against key competitors in the industry.
Analyze relevant regulatory trends and how they impact [COMPANY].`,
    parameters: {
      depth: "deep",
      tone: "technical", 
      format: "paragraph",
      timeframe: "recent",
      includeCompetitors: true,
      includeMarketTrends: true,
      includeCaseStudies: false
    },
    tags: ["risk", "regulatory", "compliance", "template"]
  },
  {
    title: "M&A Target Analysis",
    category: "financial",
    prompt: `Provide a comprehensive analysis of [COMPANY]'s suitability as an M&A target or acquirer, including financial health, strategic fit, synergy potential, and valuation considerations, using professional language and in well-structured paragraphs, with forward-looking projections and predictions.

Include a comparative analysis against recent comparable transactions in the industry.
Analyze relevant market trends and how they impact M&A prospects.`,
    parameters: {
      depth: "standard",
      tone: "formal",
      format: "paragraph",
      timeframe: "future",
      includeCompetitors: true,
      includeMarketTrends: true,
      includeCaseStudies: false
    },
    tags: ["m&a", "acquisitions", "valuation", "strategy", "template"]
  },
  {
    title: "Supply Chain Resilience",
    category: "risk",
    prompt: `Provide a comprehensive analysis of [COMPANY]'s supply chain structure, vulnerabilities, resilience measures, and optimization opportunities, in a conversational tone and in a bulleted list format, focusing on recent developments (past 1-2 years) and future resilience planning.

Include a comparative analysis against key competitors in the industry.
Provide specific case studies or examples to illustrate key points.`,
    parameters: {
      depth: "standard",
      tone: "conversational",
      format: "bullet",
      timeframe: "recent",
      includeCompetitors: true,
      includeMarketTrends: false,
      includeCaseStudies: true
    },
    tags: ["supply-chain", "operations", "risk", "resilience", "template"]
  },
  {
    title: "Digital Transformation Roadmap",
    category: "innovation",
    prompt: `Provide an in-depth investigation of [COMPANY]'s digital transformation initiatives, technology adoption, digital capabilities, and innovation roadmap, using technical terminology and as a narrative report, with forward-looking projections and predictions.

Analyze relevant technology trends and how they impact [COMPANY]'s digital strategy.
Provide specific case studies or examples to illustrate key transformation initiatives.`,
    parameters: {
      depth: "deep",
      tone: "technical",
      format: "narrative",
      timeframe: "future",
      includeCompetitors: false,
      includeMarketTrends: true,
      includeCaseStudies: true
    },
    tags: ["digital", "transformation", "technology", "innovation", "template"]
  }
];

/**
 * Seeds the Firestore database with template prompts for a specific client
 * @param clientId The ID of the client to seed prompts for
 * @returns Promise with the IDs of the created prompt documents
 */
export const seedTemplatePrompts = async (clientId: string): Promise<string[]> => {
  try {
    // First check if templates already exist for this client
    const existingQuery = query(
      collection(db, "researchPrompts"), 
      where("clientId", "==", clientId),
      where("tags", "array-contains", "template")
    );
    
    const existingDocs = await getDocs(existingQuery);
    
    // If templates already exist, don't add again
    if (!existingDocs.empty) {
      console.log(`Templates already exist for client ${clientId}, skipping seed`);
      return existingDocs.docs.map(doc => doc.id);
    }
    
    // Add the templates
    const createdIds: string[] = [];
    
    for (const template of templatePrompts) {
      // Replace placeholder with actual client name if available
      const clientName = "[COMPANY]"; // You can replace this with actual client name
      
      const promptData: Omit<ResearchPromptData, "id"> = {
        ...template,
        prompt: template.prompt.replace(/\[COMPANY\]/g, clientName),
        clientId,
        timestamp: new Date()
      };
      
      const docRef = await addDoc(collection(db, "researchPrompts"), promptData);
      createdIds.push(docRef.id);
    }
    
    console.log(`Added ${createdIds.length} template prompts for client ${clientId}`);
    return createdIds;
    
  } catch (error) {
    console.error("Error seeding template prompts:", error);
    throw error;
  }
}; 