import { ChatOpenAI } from "@langchain/openai";
import { ClientResearchAnnotation, type ClientResearchReturnType } from "../state";
import { GoogleCustomSearch } from "@langchain/community/tools/google_custom_search";
import type { EnhancedDecisionMakers, ExecutiveProfile } from "../types";

// API credentials
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // Ensure this is set in your .env file
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID; // Ensure this is set in your .env file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure this is set in your .env file

// Legacy decision maker interface (maintained for backwards compatibility)
interface DecisionMakerPerson {
  name: string;
  title: string;
  background: string;
  responsibilities: string;
  roleInFinancialDecisions: string;
  insightsForEngagement: string;
}

/**
 * Enhanced Decision Makers Research Node
 * 
 * Comprehensive executive research including:
 * - Advanced Executive Research 
 * - Organizational Structure Analysis with reporting hierarchies
 * - Executive Intelligence with professional networks and communication styles
 * - Board Composition Analysis with independence assessment
 */
export async function decisionMakersNode(
  state: typeof ClientResearchAnnotation.State
): Promise<ClientResearchReturnType> {
  console.log(`Starting enhanced decision makers research for ${state.input.companyName}`);
  
  try {
    const companyName = state.input.companyName;
    const industry = state.input.industry || "Business";
    
    // Initialize search tool
    const searchTool = new GoogleCustomSearch({
      apiKey: GOOGLE_API_KEY,
      googleCSEId: GOOGLE_CSE_ID,
    });
    
    // Enhanced search queries for comprehensive executive research
    const queries = [
      // Core executive information
      `${companyName} executive team CEO CFO leadership profiles`,
      `${companyName} board of directors independent members composition`,
      `${companyName} annual report executive compensation management`,
      `${companyName} organizational chart reporting structure hierarchy`,
      
      // Treasury and financial structure
      `${companyName} treasury team finance procurement structure`,
      `${companyName} chief financial officer treasurer financial decisions`,
      `${companyName} decision making process financial approval authority`,
      
      // Executive intelligence and networks
      `${companyName} executives LinkedIn profiles professional background`,
      `${companyName} board memberships other companies directors`,
      `${companyName} executive speaking engagements conferences events`,
      `${companyName} management team educational background MBA qualifications`,
      
      // Executive changes and stability
      `${companyName} executive appointments resignations turnover changes`,
      `${companyName} executive tenure length service company stability`,
      `${companyName} succession planning leadership development`,
      
      // Professional associations and networks
      `${companyName} executives professional associations ${industry}`,
      `${companyName} executive social media presence thought leadership`,
      `${companyName} procurement vendor management structure authority limits`
    ];
    
    // Combine search results with enhanced data collection
    let combinedResults = "";
    for (const query of queries) {
      try {
        const result = await searchTool.call(query);
        combinedResults += `\n\n--- Results for query "${query}" ---\n${result}`;
      } catch (error) {
        console.error(`Error searching for "${query}":`, error);
      }
    }
    
    // Analyze the data with enhanced LLM
    const model = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: 0,
      openAIApiKey: OPENAI_API_KEY
    });
    
    // Enhanced system prompt for comprehensive executive analysis
    const systemPrompt = `You are a senior executive research analyst specializing in comprehensive organizational structure analysis and executive intelligence for commercial banking relationship management.

Your analysis will inform critical banking decisions including executive relationship development, organizational risk assessment, and strategic partnership opportunities.

Based on the provided search results for ${companyName}, conduct a comprehensive analysis covering:

1. ADVANCED EXECUTIVE RESEARCH
   - Detailed executive profiles with compensation analysis
   - Educational backgrounds and professional qualifications
   - Career progression and tenure analysis
   - Previous company experience and expertise

2. ORGANIZATIONAL STRUCTURE ANALYSIS
   - Reporting hierarchies and organizational chart
   - Treasury team structure and financial decision authority
   - Procurement and vendor management structure
   - Decision-making processes for different types of decisions

3. EXECUTIVE INTELLIGENCE
   - Professional networks and board memberships
   - Speaking engagements and thought leadership
   - Communication styles and strategic priorities
   - Social media presence and public statements

4. BOARD COMPOSITION ANALYSIS
   - Board member profiles and independence assessment
   - Committee structures and responsibilities
   - Diversity metrics and governance practices

Format your response as a comprehensive JSON object with the following structure:
{
  "keyDecisionMakers": [
    {
      "name": "Full Name",
      "title": "Executive Title",
      "background": "Brief professional background",
      "responsibilities": "Areas of responsibility", 
      "roleInFinancialDecisions": "Their role in financial/banking decisions",
      "insightsForEngagement": "Relevant personal insights for engagement"
    }
  ],
  "decisionMakingProcess": "Brief description of how financial decisions are made",
  
  "enhanced": {
    "executiveTeam": [
      {
        "name": "Executive Name",
        "title": "Official Title", 
        "role": "Functional Role",
        "background": "Professional background summary",
        "responsibilities": "Key areas of responsibility",
        "roleInFinancialDecisions": "Role in financial decision making",
        "insightsForEngagement": "Key insights for banking relationship development",
        
        "executiveCompensation": {
          "baseSalary": "Base salary if mentioned",
          "totalCompensation": "Total compensation package", 
          "equityComponents": "Stock options/equity details",
          "performanceIncentives": "Performance-based compensation"
        },
        "tenure": {
          "startDate": "Start date in current role",
          "yearsInRole": "Years in current position",
          "previousRoles": [
            {
              "company": "Previous company",
              "role": "Previous role", 
              "duration": "Duration in role"
            }
          ]
        },
        "education": [
          {
            "institution": "Educational institution",
            "degree": "Degree obtained",
            "year": "Graduation year if available"
          }
        ],
        "professionalAssociations": ["List of professional associations"],
        
        "boardMemberships": [
          {
            "company": "Company name",
            "role": "Board role",
            "industry": "Industry",
            "startDate": "Start date if available"
          }
        ],
        "speakingEngagements": [
          {
            "event": "Event name",
            "topic": "Speaking topic", 
            "date": "Date if available"
          }
        ],
        "professionalNetwork": {
          "keyConnections": ["Notable professional connections"],
          "industryInfluence": "Level of industry influence", 
          "thoughtLeadership": "Thought leadership activities"
        },
        
        "communicationStyle": "Communication style and preferences",
        "decisionMakingStyle": "Decision making approach",
        "strategicPriorities": ["Key strategic priorities mentioned"],
        "socialMediaPresence": {
          "platforms": ["Social media platforms"],
          "sentiment": "Overall sentiment analysis",
          "keyThemes": ["Key themes in communications"]
        }
      }
    ],
    
    "organizationalStructure": {
      "reportingStructure": [
        {
          "level": 1,
          "role": "Role title",
          "reportsTo": "Reports to whom",
          "directReports": ["List of direct reports"]
        }
      ],
      "treasuryTeam": {
        "structure": "Treasury team structure description",
        "keyRoles": [
          {
            "role": "Role title",
            "responsibilities": "Key responsibilities",
            "decisionAuthority": "Decision making authority"
          }
        ],
        "reportingLines": "Treasury reporting structure"
      },
      "decisionMakingHierarchy": {
        "financialDecisions": [
          {
            "decisionType": "Type of financial decision",
            "approvalLevel": "Required approval level",
            "keyStakeholders": ["Key stakeholders involved"]
          }
        ],
        "strategicDecisions": [
          {
            "decisionType": "Type of strategic decision",
            "approvalLevel": "Required approval level",
            "keyStakeholders": ["Key stakeholders involved"] 
          }
        ]
      },
      "procurementStructure": {
        "vendorManagement": "Vendor management approach",
        "procurementAuthority": [
          {
            "role": "Role with procurement authority",
            "approvalLimit": "Financial approval limit",
            "serviceCategories": ["Categories of services they can approve"]
          }
        ]
      }
    },
    
    "boardComposition": {
      "boardMembers": [
        {
          "name": "Director name",
          "role": "Board role (Chair, Director, etc.)",
          "independence": "Independent/Executive status", 
          "background": "Professional background",
          "tenure": "Time served on board",
          "committees": ["Board committees served on"],
          "expertise": ["Areas of expertise"]
        }
      ],
      "boardStructure": {
        "totalMembers": 0,
        "independentMembers": 0,
        "executiveMembers": 0,
        "diversity": {
          "gender": "Gender diversity information",
          "age": "Age diversity information", 
          "professional": "Professional diversity information"
        }
      },
      "keyCommittees": [
        {
          "name": "Committee name",
          "chair": "Committee chair",
          "members": ["Committee members"],
          "responsibilities": "Committee responsibilities"
        }
      ]
    },
    
    "decisionMakingProcess": {
      "financialDecisions": "Financial decision process description",
      "strategicDecisions": "Strategic decision process description",
      "bankingDecisions": "Banking service decision process", 
      "procurementDecisions": "Procurement decision process"
    },
    
    "executiveTurnover": {
      "recentChanges": [
        {
          "position": "Position that changed",
          "previous": "Previous person in role",
          "current": "Current person in role",
          "changeDate": "Date of change",
          "reason": "Reason for change if known"
        }
      ],
      "turnoverRate": "Assessment of executive turnover rate",
      "stabilityAssessment": "Overall leadership stability assessment"
    },
    
    "engagementStrategy": {
      "primaryContacts": ["Key contacts for banking relationships"],
      "communicationPreferences": "Preferred communication methods",
      "meetingPreferences": "Meeting preferences and styles",
      "decisionTimelines": "Typical decision making timeframes",
      "influencers": ["Key influencers in decision making"]
    }
  }
}

CRITICAL ANALYSIS REQUIREMENTS:
1. BANKING RELATIONSHIP FOCUS: Frame all analysis from a commercial banking relationship development perspective
2. EXECUTIVE INTELLIGENCE DEPTH: Extract detailed professional profiles, networks, and communication styles  
3. ORGANIZATIONAL RISK ASSESSMENT: Evaluate leadership stability, turnover patterns, and succession planning
4. DECISION AUTHORITY MAPPING: Clearly identify who has authority for different types of banking decisions
5. ENGAGEMENT INSIGHTS: Provide actionable insights for relationship managers and business development
6. BOARD GOVERNANCE ANALYSIS: Assess board composition for relationship and business development opportunities
7. COMPENSATION CONTEXT: Extract executive compensation details for relationship context understanding
8. PROFESSIONAL NETWORKS: Map external board memberships and professional connections for networking opportunities
9. STRATEGIC PRIORITIES: Identify executive strategic priorities that align with banking services
10. COMMUNICATION INTELLIGENCE: Analyze communication styles and social media presence for engagement strategy

Data Quality Standards:
- Only include information explicitly found in search results
- Use "Not available" for missing critical information rather than omitting fields
- Provide specific dates, figures, and names when available
- Extract exact quotes for strategic priorities and communication styles
- Validate all numerical data (board composition, compensation figures)
- Cross-reference executive information across multiple sources when possible
- Focus on actionable insights for banking relationship development`;

         // Process with the enhanced model
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: `Here is the comprehensive search data about ${companyName}'s leadership team, organizational structure, and executive intelligence:\n\n${combinedResults}`
      }
    ]);
    
    // Parse the response to JSON
    const responseText = response.content.toString();
    const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || 
                      responseText.match(/{[\s\S]*}/);
                      
    if (!jsonMatch) {
      throw new Error("Failed to parse enhanced decision makers data from LLM response");
    }
    
    const jsonContent = jsonMatch[0].startsWith("{") ? jsonMatch[0] : jsonMatch[1];
    const parsedResponse = JSON.parse(jsonContent);
    
    console.log("Enhanced decision makers research completed successfully");
    
    // Return both legacy format and enhanced data for backwards compatibility
    return {
      executiveData: parsedResponse.keyDecisionMakers,
      enhancedExecutiveData: parsedResponse.enhanced,
      decisionMakingProcess: parsedResponse.decisionMakingProcess
    };
  } catch (error) {
    console.error("Error in enhanced decision makers research:", error);
    return {
      error: `Enhanced decision makers research error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 