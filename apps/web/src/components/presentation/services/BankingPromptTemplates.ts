/**
 * Banking-specific AI prompt templates for presentation generation
 * These templates are optimized for financial and banking content
 */

export const BankingPromptTemplates = {
  // C-suite focused language templates
  cSuiteLanguage: {
    executive: `You are writing content for an executive-level presentation to a C-suite audience at a financial institution. 
    Use concise, strategic language focused on business outcomes, ROI, and market positioning. 
    Avoid technical jargon unless necessary and focus on high-level business impact and value propositions.
    Include references to relevant KPIs, market trends, and competitive advantages.`,
    
    technical: `You are writing content for a technical presentation to financial executives who have strong domain knowledge.
    Balance strategic business language with necessary technical details about financial products and services.
    Focus on innovation, efficiency, risk management, and compliance considerations.
    Include specific metrics where appropriate and reference industry standards.`,
    
    boardOfDirectors: `You are writing content for a board presentation at a financial institution.
    Focus on governance, risk, strategic direction, and shareholder value.
    Use formal, precise language with clear recommendations and governance implications.
    Include references to regulatory considerations, market positioning, and long-term strategic impact.`
  },
  
  // Slide type specific prompts
  slideTypes: {
    title: `Create an impactful title slide for a banking presentation with the following components:
    - A compelling main title that addresses the client's primary needs
    - A concise subtitle that outlines the value proposition
    - A brief introduction statement that sets the context for the presentation`,
    
    executiveSummary: `Create an executive summary slide that highlights:
    - The core value proposition for the client
    - 3-4 key benefits or outcomes
    - Critical differentiators that position our solution uniquely
    - A strategic rationale for why this matters to the client now`,
    
    marketAnalysis: `Create market analysis content that includes:
    - Current market conditions affecting the financial sector
    - Key trends relevant to the client's situation
    - Competitive landscape analysis
    - Market opportunities and potential threats
    Use data-driven language and refer to market indicators where possible.`,
    
    competitiveAnalysis: `Create a competitive analysis slide that:
    - Outlines 3-4 key competitors in the client's market
    - Highlights our advantages versus the competition
    - Addresses competitor strengths honestly but positions our solution effectively
    - Uses objective comparison criteria relevant to the client's priorities`,
    
    financialProjections: `Create financial projection content that:
    - Outlines expected ROI or financial benefits
    - Includes timeframes for realization of benefits
    - Considers both quantitative and qualitative financial outcomes
    - Addresses risk mitigation and financial considerations
    Use precise financial terminology and conservative projection language.`,
    
    implementationTimeline: `Create an implementation timeline slide that:
    - Outlines key phases of implementation
    - Highlights critical milestones and dependencies
    - Sets realistic timeframes for each phase
    - Addresses resource requirements and client involvement
    Use project management terminology appropriate for financial implementations.`,
    
    nextSteps: `Create a "next steps" or closing slide that:
    - Summarizes 3-4 clear action items
    - Includes clear ownership and timeframes
    - Reinforces the value proposition
    - Provides a compelling call to action
    Use confident, action-oriented language that drives decision-making.`
  },
  
  // Element-specific prompts
  elementTypes: {
    bulletPoints: `Generate 4-5 concise, impactful bullet points that:
    - Begin with strong action verbs or clear nouns
    - Follow parallel structure throughout
    - Focus on client benefits rather than features
    - Build a logical narrative when read in sequence
    Each bullet should be 1-2 lines maximum and avoid unnecessary adjectives.`,
    
    chartData: `Generate relevant data for a {chartType} chart that demonstrates:
    - Clear trends or comparisons relevant to the banking sector
    - Realistic figures for {dataContext}
    - Data points that support the main value proposition
    - A clear narrative revealed through the data
    Include labels, suggested title, and brief interpretation of what the data shows.`,
    
    tableComparison: `Create a comparison table that:
    - Lists key {comparisonSubject} in the first column
    - Shows how our solution compares to alternatives across 2-3 other columns
    - Uses checkmarks, values, or brief descriptions in cells
    - Highlights areas where our solution has clear advantages
    Focus on factors most relevant to financial decision-makers.`,
    
    keyMetrics: `Generate 3-4 key financial or performance metrics that:
    - Are relevant to {clientContext} and their industry
    - Include both current state and target/improved state
    - Use precise financial terminology and appropriate units
    - Demonstrate meaningful impact through significant but realistic improvements
    Each metric should include a brief explanation of its relevance.`
  },
  
  // Financial data formatting
  financialFormatting: {
    currencyValues: `Format all currency values consistently:
    - Use appropriate currency symbol ($/€/£) based on client region
    - For values over 1 million, use 'M' notation (e.g., $1.2M)
    - For values over 1 billion, use 'B' notation (e.g., $1.2B)
    - Round to appropriate precision based on context
    - Use thousands separators for readability`,
    
    percentages: `Format all percentages consistently:
    - Include % symbol after the number with no space
    - For financial contexts, use 1 decimal place for precision
    - For significant comparisons, use 2 decimal places
    - For general trends, round to whole numbers
    - Use '+' prefix for positive changes when comparing`,
    
    timeframes: `Express timeframes consistently:
    - Use quarters and fiscal years relevant to client's business cycle
    - For implementation timelines, use specific months or quarters
    - For ROI projections, specify the timeframe clearly (e.g., "12-month ROI")
    - For historical data, use consistent period descriptions`
  },
  
  // Context-specific banking prompts
  bankingContexts: {
    retailBanking: `Generate content focused on retail banking priorities:
    - Customer experience and digital transformation
    - Branch strategy and omnichannel integration
    - Deposit growth and consumer lending
    - Fraud prevention and customer security
    Use language that balances customer-centricity with financial performance.`,
    
    commercialBanking: `Generate content focused on commercial banking priorities:
    - Treasury management and cash flow optimization
    - Commercial lending and credit solutions
    - Industry-specific banking solutions
    - Client relationship development and expansion
    Use language that emphasizes partnership, industry expertise, and business impact.`,
    
    wealthManagement: `Generate content focused on wealth management priorities:
    - Portfolio performance and investment strategy
    - Holistic wealth planning and advisory services
    - Intergenerational wealth transfer
    - Alternative investments and tax optimization
    Use sophisticated financial language appropriate for high-net-worth contexts.`,
    
    investmentBanking: `Generate content focused on investment banking priorities:
    - Capital markets and funding strategy
    - M&A and corporate advisory services
    - Market insights and timing considerations
    - Deal structuring and execution excellence
    Use precise financial terminology and emphasize execution capabilities.`
  }
};

/**
 * Helper function to get the appropriate prompt based on slide type
 * @param slideType Type of slide being generated
 * @param audienceLevel Target audience level (executive, technical, board)
 * @returns Optimized prompt template for the context
 */
export function getSlidePrompt(
  slideType: string, 
  audienceLevel: 'executive' | 'technical' | 'boardOfDirectors' = 'executive'
): string {
  // Get the appropriate language style based on audience
  const languageStyle = BankingPromptTemplates.cSuiteLanguage[audienceLevel] || BankingPromptTemplates.cSuiteLanguage.executive;
  
  // Get the slide-specific prompt
  const slidePrompt = BankingPromptTemplates.slideTypes[slideType as keyof typeof BankingPromptTemplates.slideTypes] || 
                      BankingPromptTemplates.slideTypes.executiveSummary;
  
  // Combine the language style with the slide-specific prompt
  return `${languageStyle}\n\n${slidePrompt}`;
}

/**
 * Helper function to get prompt for specific element types
 * @param elementType Type of element (bulletPoints, chartData, etc.)
 * @param context Additional context for the generation
 * @returns Optimized prompt for the element
 */
export function getElementPrompt(
  elementType: string,
  context: Record<string, any> = {}
): string {
  // Get the base element prompt
  let prompt = BankingPromptTemplates.elementTypes[elementType as keyof typeof BankingPromptTemplates.elementTypes] || 
               BankingPromptTemplates.elementTypes.bulletPoints;
  
  // Replace any context variables in the prompt
  Object.keys(context).forEach(key => {
    prompt = prompt.replace(`{${key}}`, context[key]);
  });
  
  return prompt;
}

/**
 * Get a complete prompt for generating content in a banking presentation
 * @param slideType Type of slide being generated
 * @param elementType Specific element within the slide
 * @param audience Target audience level
 * @param bankingContext Specific banking sector context
 * @param additionalContext Any additional context variables
 * @returns Complete prompt optimized for banking presentation content
 */
export function getBankingPrompt(
  slideType: string,
  elementType: string,
  audience: 'executive' | 'technical' | 'boardOfDirectors' = 'executive',
  bankingContext: 'retailBanking' | 'commercialBanking' | 'wealthManagement' | 'investmentBanking' = 'commercialBanking',
  additionalContext: Record<string, any> = {}
): string {
  // Get the core components
  const audiencePrompt = BankingPromptTemplates.cSuiteLanguage[audience];
  const slidePrompt = BankingPromptTemplates.slideTypes[slideType as keyof typeof BankingPromptTemplates.slideTypes] || '';
  const elementPrompt = getElementPrompt(elementType, additionalContext);
  const contextPrompt = BankingPromptTemplates.bankingContexts[bankingContext] || '';
  
  // Build the complete prompt
  return `
${audiencePrompt}

${contextPrompt}

For a ${slideType} slide in a banking presentation:
${slidePrompt}

Specifically, generate the following content:
${elementPrompt}

Additional context:
${Object.entries(additionalContext).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Ensure all financial data follows these formatting guidelines:
${BankingPromptTemplates.financialFormatting.currencyValues}
${BankingPromptTemplates.financialFormatting.percentages}
  `;
} 