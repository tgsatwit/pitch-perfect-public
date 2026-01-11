import type { SlideStructure } from "@/types/settings";
import type { AISlideContent } from '@/components/presentation/services/PresentationAIService';
import type { SlideOutlineData as AgentSlideOutlineData } from '../../../../../agents/src/slide-generation/types';

export interface PitchContextInput {
  clientId: string;
  clientName: string;
  pitchStage: string;
  competitorsSelected: Record<string, boolean>; // Existing structure
  importantClientInfo: string;
  importantToClient: string;
  clientSentiment: number;
  ourAdvantages: string;
  competitorStrengths: string;
  pitchFocus: string;
  dataSourcesSelected: Record<string, boolean>; // Categories selected
  subDataSourcesSelected: string[]; // Specific sources selected
  uploadedFileNames: string[]; // Just names for now, agent might lookup URLs if needed
  relevantCaseStudies?: string; // New field: Case studies or success stories that could be referenced
  keyMetrics?: string; // New field: Any metrics or benchmarks that could be used
  implementationTimeline?: string; // New field: Any specific timing constraints or timeline requirements
  expectedROI?: string; // New field: Financial expectations or ROI requirements
}

export interface PitchDocumentData { 
  clientId: string;
  clientName: string;
  pitchStage: string;
  competitorsSelected: Record<string, boolean>; 
  status: string;
  createdAt: any; // Firestore Timestamp
  lastUpdatedAt?: any; // Firestore Timestamp
  dataSourcesSelected: Record<string, boolean>; 
  subDataSourcesSelected?: string[];
  uploadedFiles: { name: string; url: string }[];
  additionalContext: {
    importantClientInfo?: string;
    importantToClient?: string;
    clientSentiment?: number;
    ourAdvantages?: string;
    competitorStrengths?: string;
    pitchFocus?: string;
    relevantCaseStudies?: string; // New field
    keyMetrics?: string; // New field
    implementationTimeline?: string; // New field
    expectedROI?: string; // New field
    ignoredSections?: string[]; // Track which sections were ignored
  };
  langGraphThreadId: string | null;
  researchData?: {
    clientDetails?: any;
    competitorDetails?: Record<string, any>;
  };
  useResearchData?: {
    clientResearch?: boolean;
    competitorResearch?: boolean;
  };
  initialOutline?: string; // Outline content from the generation
  outlineSummary?: string; // Summary of the outline
  outlineGenerated?: boolean; // Flag to indicate if outline has been generated (performance optimization)
  slides?: AISlideContent[]; // New field: Slide data
  slideOutlines?: AgentSlideOutlineData[]; // Parsed slide outlines for agent
  slideGenerationMetadata?: {
    totalSlides: number;
    successfulSlides: number;
    failedSlides: number;
    processingTime: number;
    contextSources: string[];
  };
  customSlideStructure?: SlideStructure[]; // Custom slide structure for this pitch
}

export interface FirebaseDoc {
  id: string;
  name: string;
}