export interface ClientResearchInput {
  clientId?: string;
  companyName: string;
  website?: string;
  industry?: string;
  // Allow customization of research topics to include or exclude
  researchTopics?: ResearchTopicConfig;
  // Add callback for progress updates
  onProgress?: (message: string) => void;
}

export interface ResearchTopicConfig {
  includeESG?: boolean;
  includeBenchmarking?: boolean;
  includeBankingRelationships?: boolean;
  includeDecisionMakers?: boolean;
  // Allows adding custom topics beyond the predefined ones
  customTopics?: Array<{
    name: string;
    searchQuery: string;
    description: string;
  }>;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface DebtStructure {
  seniorDebt?: {
    amount?: string;
    maturityProfile?: string;
    interestRate?: string;
  };
  subordinatedDebt?: {
    amount?: string;
    maturityProfile?: string;
    interestRate?: string;
  };
  totalDebt?: string;
  debtMaturitySchedule?: string[];
}

export interface CashFlowMetrics {
  operatingCashFlow?: string;
  freeCashFlow?: string;
  ebitda?: string;
  ebit?: string;
  cashConversionCycle?: string;
}

export interface CreditInformation {
  creditRating?: {
    moodys?: string;
    sp?: string;
    fitch?: string;
  };
  outlookTrend?: string;
  ratingHistory?: Array<{
    date?: string;
    agency: string;
    rating: string;
    action: string;
  }>;
}

export interface DividendPolicy {
  dividendYield?: string;
  payoutRatio?: string;
  dividendHistory?: Array<{
    year: string;
    amount: string;
    type: string;
  }>;
  dividendPolicy?: string;
}

export interface WorkingCapitalAnalysis {
  currentRatio?: string;
  quickRatio?: string;
  workingCapital?: string;
  workingCapitalTrend?: string;
  daysInInventory?: string;
  daysInReceivables?: string;
  daysInPayables?: string;
}

export interface BankingAnalysis {
  creditRiskAssessment?: {
    overallRiskLevel?: string;
    keyRiskFactors?: string[];
    mitigatingFactors?: string[];
    creditRecommendation?: string;
  };
  debtCapacity?: {
    currentLeveragePosition?: string;
    additionalDebtCapacity?: string;
    optimalCapitalStructure?: string;
    debtRefinancingOpportunities?: string;
  };
  cashFlowAnalysis?: {
    cashFlowStability?: string;
    seasonalityFactors?: string;
    cashFlowCoverage?: string;
    workingCapitalNeeds?: string;
  };
  liquidityAnalysis?: {
    liquidityStrength?: string;
    liquidityRisk?: string;
    cashManagementNeeds?: string;
    creditFacilityRecommendations?: string;
  };
  profitabilityTrends?: {
    profitabilityAssessment?: string;
    marginAnalysis?: string;
    earningsQuality?: string;
    industryComparison?: string;
  };
}

export interface CapitalStructureOptimization {
  currentCapitalStructure?: string;
  optimalStructureRecommendations?: string;
  costOfCapitalAnalysis?: string;
  capitalStructureRisks?: string;
  refinancingOpportunities?: Array<{
    opportunity: string;
    rationale: string;
    estimatedBenefit: string;
    timing: string;
  }>;
}

export interface BankingServiceNeeds {
  treasuryServices?: string;
  tradeFinance?: string;
  cashManagement?: string;
  riskManagement?: string;
  investmentServices?: string;
}

export interface EnhancedFinancialMetrics {
  // Basic metrics (existing)
  revenue?: string;
  profitMargin?: string;
  marketCap?: string;
  debtToEquityRatio?: string;
  cashReserves?: string;
  annualGrowthRate?: string;
  
  // Enhanced metrics
  debtStructure?: DebtStructure;
  cashFlowMetrics?: CashFlowMetrics;
  creditInformation?: CreditInformation;
  dividendPolicy?: DividendPolicy;
  workingCapitalAnalysis?: WorkingCapitalAnalysis;
  
  // Banking-focused ratios
  debtServiceCoverageRatio?: string;
  interestCoverageRatio?: string;
  assetQualityMetrics?: {
    returnOnAssets?: string;
    returnOnEquity?: string;
    assetTurnover?: string;
  };
  liquidityPosition?: {
    cashRatio?: string;
    operatingCashFlowRatio?: string;
    liquidityDescription?: string;
  };
  
  // Banking-Focused Analysis & Insights
  bankingAnalysis?: BankingAnalysis;
  capitalStructureOptimization?: CapitalStructureOptimization;
  bankingServiceNeeds?: BankingServiceNeeds;
}

export interface RecentDevelopment {
  date?: string;
  title: string;
  description: string;
}

export interface BankingOpportunity {
  service: string;
  rationale: string;
  urgency: "high" | "medium" | "low";
  competitivePosition: string;
}

export interface ResearchTopic {
  title: string;
  key: string;
  data: any;
}

export interface PeerComparison {
  metrics?: Record<string, string>;
  insights?: string[];
  comparedCompanies?: string[];
}

export interface ESGProfile {
  commitments: string[];
  initiatives: string[];
  ratings?: Record<string, string>;
  focus?: string;
}

export interface BankingRelationship {
  knownBankingPartners?: string[];
  recentRFPs?: Array<{date?: string, description: string}>;
  bankingSwitchHistory?: string;
  painPoints?: string[];
}

// Enhanced Executive and Decision Maker Interfaces
export interface ExecutiveProfile {
  name: string;
  title: string;
  role: string;
  background?: string;
  responsibilities?: string;
  roleInFinancialDecisions?: string;
  insightsForEngagement?: string;
  
  // Advanced Executive Research
  executiveCompensation?: {
    baseSalary?: string;
    totalCompensation?: string;
    equityComponents?: string;
    performanceIncentives?: string;
  };
  tenure?: {
    startDate?: string;
    yearsInRole?: string;
    previousRoles?: Array<{
      company: string;
      role: string;
      duration: string;
    }>;
  };
  education?: Array<{
    institution: string;
    degree: string;
    year?: string;
  }>;
  professionalAssociations?: string[];
  
  // Professional Network & External Connections
  boardMemberships?: Array<{
    company: string;
    role: string;
    industry: string;
    startDate?: string;
  }>;
  speakingEngagements?: Array<{
    event: string;
    topic: string;
    date?: string;
  }>;
  professionalNetwork?: {
    keyConnections?: string[];
    industryInfluence?: string;
    thoughtLeadership?: string;
  };
  
  // Executive Intelligence
  communicationStyle?: string;
  decisionMakingStyle?: string;
  strategicPriorities?: string[];
  socialMediaPresence?: {
    platforms?: string[];
    sentiment?: string;
    keyThemes?: string[];
  };
}

export interface OrganizationalStructure {
  reportingStructure?: Array<{
    level: number;
    role: string;
    reportsTo?: string;
    directReports?: string[];
  }>;
  treasuryTeam?: {
    structure: string;
    keyRoles: Array<{
      role: string;
      responsibilities: string;
      decisionAuthority: string;
    }>;
    reportingLines: string;
  };
  decisionMakingHierarchy?: {
    financialDecisions: Array<{
      decisionType: string;
      approvalLevel: string;
      keyStakeholders: string[];
    }>;
    strategicDecisions: Array<{
      decisionType: string;
      approvalLevel: string;
      keyStakeholders: string[];
    }>;
  };
  procurementStructure?: {
    vendorManagement: string;
    procurementAuthority: Array<{
      role: string;
      approvalLimit: string;
      serviceCategories: string[];
    }>;
  };
}

export interface BoardComposition {
  boardMembers?: Array<{
    name: string;
    role: string; // Chair, Director, etc.
    independence: string; // Independent, Executive, etc.
    background: string;
    tenure: string;
    committees: string[]; // Audit, Risk, Nomination, etc.
    expertise: string[];
  }>;
  boardStructure?: {
    totalMembers: number;
    independentMembers: number;
    executiveMembers: number;
    diversity: {
      gender?: string;
      age?: string;
      professional?: string;
    };
  };
  keyCommittees?: Array<{
    name: string;
    chair: string;
    members: string[];
    responsibilities: string;
  }>;
}

export interface EnhancedDecisionMakers {
  // Enhanced Executive Profiles
  executiveTeam?: ExecutiveProfile[];
  
  // Organizational Analysis
  organizationalStructure?: OrganizationalStructure;
  
  // Board Analysis
  boardComposition?: BoardComposition;
  
  // Decision-Making Process Analysis
  decisionMakingProcess?: {
    financialDecisions: string;
    strategicDecisions: string;
    bankingDecisions: string;
    procurementDecisions: string;
  };
  
  // Executive Turnover Analysis
  executiveTurnover?: {
    recentChanges: Array<{
      position: string;
      previous: string;
      current: string;
      changeDate: string;
      reason?: string;
    }>;
    turnoverRate: string;
    stabilityAssessment: string;
  };
  
  // Engagement Strategy
  engagementStrategy?: {
    primaryContacts: string[];
    communicationPreferences: string;
    meetingPreferences: string;
    decisionTimelines: string;
    influencers: string[];
  };
}

export interface DecisionMakers {
  keyPersonnel?: Array<{
    name: string;
    role: string;
    background?: string;
  }>;
  treasuryStructure?: string;
  decisionProcess?: string;
  
  // Enhanced decision makers data
  enhanced?: EnhancedDecisionMakers;
}

// This allows for dynamic inclusion of different research topics
export interface ClientResearchResult {
  summary?: string; // Overall research summary
  financialOverview?: string;
  keyMetrics?: EnhancedFinancialMetrics;
  marketAnalysis?: string;
  swotAnalysis?: SWOTAnalysis;
  strategicConsiderations?: string;
  recentDevelopments?: RecentDevelopment[];
  recentEvents?: RecentDevelopment[];
  bankingOpportunities?: BankingOpportunity[];
  
  // Extensible research topics
  peerComparison?: PeerComparison;
  esgProfile?: ESGProfile;
  corporateValues?: string[];
  bankingRelationships?: BankingRelationship;
  decisionMakers?: DecisionMakers;
  
  // Industry tab fields
  industryAnalysis?: string;
  marketPosition?: string;
  marketShare?: string;
  competitors?: string[];
  industryTrends?: string[];
  
  // Decision makers additional fields
  executiveLeadership?: Array<{name: string; role: string; background?: string}>;
  boardMembers?: Array<{name: string; role: string; background?: string}>;
  keyDecisionMakers?: Array<{name: string; role: string; background?: string}>;
  decisionMakingProcess?: string;
  
  // Additional research fields
  regulatoryConstraints?: string;
  growthOpportunities?: string[];
  customerSegments?: string;
  geographicPresence?: string;
  painPoints?: string[];
  technologyStack?: string;
  additionalNotes?: string;
  
  // Allow for custom research topics that weren't predefined
  customResearchTopics?: Record<string, any>;
} 