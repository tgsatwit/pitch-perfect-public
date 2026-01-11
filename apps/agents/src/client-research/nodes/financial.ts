import { ChatOpenAI } from "@langchain/openai";
import { ClientResearchAnnotation, type ClientResearchReturnType } from "../state";
import { GoogleCustomSearch } from "@langchain/community/tools/google_custom_search";

// TODO: Replace hardcoded API keys with environment variables or a secure config method
// API credentials
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // Ensure this is set in your .env file
const GOOGLE_CSE_ID = process.env.GOOGLE_CSE_ID; // Ensure this is set in your .env file
const OPENAI_API_KEY = process.env.OPENAI_API_KEY; // Ensure this is set in your .env file

/**
 * Financial Research Node
 * 
 * Researches the financial performance and metrics of the client
 */
export async function financialNode(
  state: typeof ClientResearchAnnotation.State
): Promise<ClientResearchReturnType> {
  console.log(`[financialNode] Starting financial research for ${state.input.companyName}`);
  
  try {
    const companyName = state.input.companyName;
    const industry = state.input.industry || "";
    
    // Initialize search tool
    const searchTool = new GoogleCustomSearch({
      apiKey: GOOGLE_API_KEY,
      googleCSEId: GOOGLE_CSE_ID,
    });
    
    // Enhanced search queries for comprehensive financial information
    const queries = [
      `${companyName} annual report financial results revenue profit`,
      `${companyName} debt structure senior subordinated debt maturity`,
      `${companyName} cash flow EBITDA operating free cash flow`,
      `${companyName} credit rating Moody's S&P Fitch`,
      `${companyName} dividend policy payout ratio dividend history`,
      `${companyName} working capital current ratio quick ratio`,
      `${companyName} balance sheet assets liabilities equity`,
      `${companyName} ${industry} financial performance metrics`,
      `${companyName} debt service coverage interest coverage ratio`,
      `${companyName} liquidity position cash management`
    ];
    
    // Combine search results
    let combinedResults = "";
    for (const query of queries) {
      try {
        console.log(`[financialNode] Searching for: "${query}"`);
        const result = await searchTool.call(query);
        console.log(`[financialNode] Received search result for: "${query}"`);
        combinedResults += `\n\nResults for query "${query}":\n${result}`;
      } catch (error) {
        console.error(`[financialNode] Error searching for "${query}":`, error);
      }
    }
    
    if (!combinedResults.trim()) {
      throw new Error("Unable to find financial information");
    }
    
    // Analyze the financial data with LLM
    const model = new ChatOpenAI({
      modelName: "gpt-4-turbo-preview",
      temperature: 0,
      openAIApiKey: OPENAI_API_KEY
    });
    
    // Enhanced Banking-Focused Financial Analysis system prompt
    const systemPrompt = `You are a senior commercial banking analyst specializing in comprehensive financial analysis for credit assessment, relationship banking, and capital structure optimization. 
Your analysis will inform critical banking decisions including lending, treasury services, and strategic banking partnerships.

Extract detailed financial information from the provided search results for ${companyName} and provide sophisticated banking-focused analysis.

Provide a JSON response with the following structure:

{
  "financialOverview": "Comprehensive overview of the company's financial health, performance trends, and key financial events",
  "keyMetrics": {
    // Basic Financial Metrics
    "revenue": "Latest annual revenue figure",
    "profitMargin": "Net profit margin percentage",
    "marketCap": "Market capitalization",
    "debtToEquityRatio": "Debt-to-equity ratio",
    "cashReserves": "Cash and cash equivalents",
    "annualGrowthRate": "Revenue growth rate",
    
    // Debt Structure Analysis
    "debtStructure": {
      "seniorDebt": {
        "amount": "Senior debt amount",
        "maturityProfile": "Maturity schedule for senior debt",
        "interestRate": "Interest rate on senior debt"
      },
      "subordinatedDebt": {
        "amount": "Subordinated debt amount",
        "maturityProfile": "Maturity schedule for subordinated debt",
        "interestRate": "Interest rate on subordinated debt"
      },
      "totalDebt": "Total debt outstanding",
      "debtMaturitySchedule": ["Debt maturity timeline"]
    },
    
    // Cash Flow Metrics
    "cashFlowMetrics": {
      "operatingCashFlow": "Operating cash flow",
      "freeCashFlow": "Free cash flow",
      "ebitda": "EBITDA figure",
      "ebit": "EBIT figure",
      "cashConversionCycle": "Cash conversion cycle in days"
    },
    
    // Credit Information
    "creditInformation": {
      "creditRating": {
        "moodys": "Moody's credit rating",
        "sp": "S&P credit rating",
        "fitch": "Fitch credit rating"
      },
      "outlookTrend": "Rating outlook trend",
      "ratingHistory": [
        {
          "date": "Date of rating change",
          "agency": "Rating agency",
          "rating": "Rating assigned",
          "action": "Rating action taken"
        }
      ]
    },
    
    // Dividend Policy
    "dividendPolicy": {
      "dividendYield": "Current dividend yield",
      "payoutRatio": "Dividend payout ratio",
      "dividendHistory": [
        {
          "year": "Year",
          "amount": "Dividend amount",
          "type": "Dividend type (ordinary, special, etc.)"
        }
      ],
      "dividendPolicy": "Dividend policy description"
    },
    
    // Working Capital Analysis
    "workingCapitalAnalysis": {
      "currentRatio": "Current ratio",
      "quickRatio": "Quick ratio (acid test)",
      "workingCapital": "Working capital amount",
      "workingCapitalTrend": "Working capital trend description",
      "daysInInventory": "Days in inventory",
      "daysInReceivables": "Days in receivables",
      "daysInPayables": "Days in payables"
    },
    
    // Banking-Focused Ratios
    "debtServiceCoverageRatio": "Debt service coverage ratio",
    "interestCoverageRatio": "Interest coverage ratio",
    "assetQualityMetrics": {
      "returnOnAssets": "Return on assets",
      "returnOnEquity": "Return on equity",
      "assetTurnover": "Asset turnover ratio"
    },
    "liquidityPosition": {
      "cashRatio": "Cash ratio",
      "operatingCashFlowRatio": "Operating cash flow ratio",
      "liquidityDescription": "Overall liquidity position description"
    },
    
    // Banking-Focused Analysis & Insights
    "bankingAnalysis": {
      "creditRiskAssessment": {
        "overallRiskLevel": "Low/Medium/High risk assessment",
        "keyRiskFactors": ["List of key risk factors"],
        "mitigatingFactors": ["List of risk mitigating factors"],
        "creditRecommendation": "Lending recommendation with rationale"
      },
      "debtCapacity": {
        "currentLeveragePosition": "Current leverage assessment",
        "additionalDebtCapacity": "Estimated additional debt capacity",
        "optimalCapitalStructure": "Recommendations for capital structure optimization",
        "debtRefinancingOpportunities": "Potential refinancing opportunities"
      },
      "cashFlowAnalysis": {
        "cashFlowStability": "Assessment of cash flow stability and predictability",
        "seasonalityFactors": "Seasonal cash flow patterns if applicable",
        "cashFlowCoverage": "Debt service coverage analysis",
        "workingCapitalNeeds": "Working capital financing requirements"
      },
      "liquidityAnalysis": {
        "liquidityStrength": "Overall liquidity position strength",
        "liquidityRisk": "Potential liquidity risks and concerns",
        "cashManagementNeeds": "Treasury and cash management service opportunities",
        "creditFacilityRecommendations": "Recommended credit facilities and limits"
      },
      "profitabilityTrends": {
        "profitabilityAssessment": "Multi-year profitability trend analysis",
        "marginAnalysis": "Margin trends and sustainability",
        "earningsQuality": "Assessment of earnings quality and sustainability",
        "industryComparison": "Profitability vs. industry benchmarks"
      }
    },
    
    // Capital Structure & Banking Opportunities
    "capitalStructureOptimization": {
      "currentCapitalStructure": "Analysis of current debt/equity mix",
      "optimalStructureRecommendations": "Recommendations for optimal capital structure",
      "costOfCapitalAnalysis": "Weighted average cost of capital insights",
      "capitalStructureRisks": "Risks associated with current capital structure",
      "refinancingOpportunities": [
        {
          "opportunity": "Type of refinancing opportunity",
          "rationale": "Why this opportunity exists",
          "estimatedBenefit": "Potential cost savings or benefits",
          "timing": "Recommended timing for implementation"
        }
      ]
    },
    
    // Banking Service Opportunities
    "bankingServiceNeeds": {
      "treasuryServices": "Treasury management service opportunities",
      "tradeFinance": "Trade finance and international banking needs",
      "cashManagement": "Cash management optimization opportunities",
      "riskManagement": "Hedging and risk management needs",
      "investmentServices": "Investment and wealth management opportunities"
    }
  }
}

IMPORTANT BANKING ANALYSIS INSTRUCTIONS:
1. BANKING FOCUS: Frame all analysis from a commercial banking perspective - consider lending risk, service opportunities, and relationship potential
2. RATIO INTERPRETATION: For key banking ratios, provide interpretation of what the ratio means for credit risk and banking services:
   - Debt Service Coverage Ratio: Values >1.25 generally indicate strong ability to service debt
   - Interest Coverage Ratio: Values >3.0 typically indicate low credit risk
   - Current Ratio: Values 1.2-2.0 generally indicate healthy liquidity
   - Quick Ratio: Values >1.0 indicate strong short-term liquidity
3. RISK ASSESSMENT: Always provide a clear risk assessment (Low/Medium/High) with specific rationale
4. CAPITAL STRUCTURE ANALYSIS: Evaluate optimal debt-to-equity ratios for the specific industry and company characteristics
5. CASH FLOW ANALYSIS: Assess cash flow stability, predictability, and adequacy for debt service
6. BANKING OPPORTUNITIES: Identify specific banking services the company likely needs based on financial profile
7. REFINANCING OPPORTUNITIES: Look for debt maturities, high interest rates, or suboptimal capital structure
8. FACTUAL BASIS: Only include analysis if supported by search results - never speculate or invent data
9. QUANTITATIVE FOCUS: Provide specific numerical values, ratios, and calculations where available
10. INDUSTRY CONTEXT: Consider industry-specific financial patterns and benchmarks in analysis

ANALYSIS DEPTH REQUIREMENTS:
- Provide detailed rationale for all risk assessments and recommendations
- Calculate and interpret key banking ratios where data is available
- Identify specific timing and amounts for refinancing opportunities
- Assess working capital cycles and seasonal financing needs
- Evaluate credit facility requirements and optimal structures`;

    // Process with the model
    console.log("[financialNode] Invoking LLM for analysis...");
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { 
        role: "user", 
        content: `Here are the search results about ${companyName}'s financial information:\n\n${combinedResults}`
      }
    ]);
    console.log("[financialNode] Received LLM response.");
    
    // Parse the response to JSON with enhanced error handling
    const responseText = response.content.toString();
    console.log("[financialNode] Raw LLM response length:", responseText.length);
    
    // Try multiple JSON extraction methods
    let jsonContent = "";
    let parsedResponse;
    
    // First try: Look for JSON code block
    const codeBlockMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (codeBlockMatch) {
      jsonContent = codeBlockMatch[1];
    } else {
      // Second try: Look for JSON object
      const jsonMatch = responseText.match(/{[\s\S]*}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      } else {
        console.error("[financialNode] No JSON found in LLM response:", responseText);
        throw new Error("Failed to extract JSON from LLM response");
      }
    }
    
    try {
      parsedResponse = JSON.parse(jsonContent);
      console.log("[financialNode] Successfully parsed JSON response");
    } catch (parseError) {
      console.error("[financialNode] JSON parsing error:", parseError);
      console.error("[financialNode] JSON content that failed to parse:", jsonContent);
      
      // Fallback: try to create a basic structure from the text
      parsedResponse = {
        financialOverview: responseText.includes('"financialOverview"') 
          ? responseText.substring(responseText.indexOf('"financialOverview"'), responseText.indexOf('"keyMetrics"'))
          : "Failed to parse detailed financial overview from search results",
        keyMetrics: {} // Empty metrics if parsing fails
      };
    }
    
    console.log("[financialNode] Financial research completed successfully. Returning enhanced data.");
    
    // Store the comprehensive financial data with enhanced structure
    const financialInfo = {
      overview: parsedResponse.financialOverview || "No financial overview available",
      metrics: parsedResponse.keyMetrics || {}
    };
    
    // Only update the financialData channel - the aggregator will combine everything
    return {
      // Store both the overview text and the enhanced metrics in a structured format
      // that can be extracted by the aggregator
      financialData: JSON.stringify(financialInfo)
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[financialNode] Error in financial research: ${errorMessage}`);
    return {
      error: `Financial research error: ${errorMessage}`
    };
  }
} 