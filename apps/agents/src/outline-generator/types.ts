// Use interface statements directly with explicit export
export interface PitchOutlineGeneratorInput {
  pitchId: string;
  clientId?: string;
  clientName: string;
  pitchStage: string;
  competitorsSelected: Record<string, boolean>;
  
  // Context from the pitch form
  importantClientInfo?: string;
  importantToClient?: string;
  clientSentiment?: number;
  ourAdvantages?: string;
  competitorStrengths?: string;
  pitchFocus?: string;
  
  // Additional context
  relevantCaseStudies?: string;
  keyMetrics?: string; 
  implementationTimeline?: string;
  expectedROI?: string;
  
  // Data sources
  dataSourcesSelected?: Record<string, boolean>;
  subDataSourcesSelected?: string[];
  uploadedFileNames?: string[];
  
  // Research data
  clientDetails?: any;
  competitorDetails?: Record<string, any>;
  
  // Thread management
  existingThreadId?: string | null;
  
  // Custom slide structure
  customSlideStructure?: any[];
}

export interface PitchOutlineGeneratorResult {
  initialOutline: string;
  summary?: string;
  error?: string;
  threadId?: string;
}

// Client and competitor details received from Firebase
export interface ClientDetails {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  size?: string;
  revenue?: string;
  description?: string;
  [key: string]: any; // Allow for additional fields
}

export interface CompetitorDetails {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  description?: string;
  [key: string]: any; // Allow for additional fields
}

// Add a namespace with the same name to ensure TypeScript correctly processes it as a module
export const Types = {
  version: '1.0.0'
};

// Add dummy export to ensure the file is treated as a module with exports
export default Types; 