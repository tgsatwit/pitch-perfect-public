export interface SlideGenerationInput {
  pitchId: string;
  clientName: string;
  clientId?: string;
  pitchStage: string;
  slideOutlines: SlideOutlineData[];
  pitchContext: PitchContextData;
  onProgress?: (message: string) => void;
}

export interface SlideOutlineData {
  id: string;
  number: number;
  title: string;
  slideType: SlideType;
  rawContent?: string; // Full raw content of the slide section
  purpose?: string;
  keyContent?: string[];
  supportingEvidence?: string[];
  keyTakeaway?: string;
  strategicFraming?: string;
  visualRecommendation?: string;
  customSections?: Record<string, string>; // For any custom sections not matching standard patterns
  [key: string]: any; // Allow additional fields for flexibility
}

export interface PitchContextData {
  clientDetails?: any;
  competitorDetails?: Record<string, any>;
  additionalContext?: {
    importantClientInfo?: string;
    importantToClient?: string;
    clientSentiment?: number;
    ourAdvantages?: string;
    competitorStrengths?: string;
    pitchFocus?: string;
    relevantCaseStudies?: string;
    keyMetrics?: string;
    implementationTimeline?: string;
    expectedROI?: string;
  };
  uploadedFiles?: { name: string; url: string }[];
  dataSourcesSelected?: Record<string, boolean>;
}

export type SlideType = 'title' | 'content' | 'chart' | 'table' | 'closing';

export interface SlideContentBlock {
  type: 'text' | 'bullet' | 'heading';
  content: string;
  level: number;
}

export interface GeneratedSlideContent {
  id: string;
  type: SlideType;
  content: {
    title: string;
    subtitle?: string;
    body: string;
    blocks: SlideContentBlock[];
  };
  metadata?: {
    generatedAt: string;
    outline: SlideOutlineData;
    contextUsed: string[];
    revised?: boolean;
    revisionReason?: string;
    enhancedTitle?: string;
  };
}

export interface SlideGenerationResult {
  slides: GeneratedSlideContent[];
  summary: string;
  generationMetadata: {
    totalSlides: number;
    successfulSlides: number;
    failedSlides: number;
    processingTime: number;
    contextSources: string[];
  };
}

export interface SlideEnhancementInput {
  slideId: string;
  currentContent: GeneratedSlideContent;
  enhancementRequest: string;
  pitchContext: PitchContextData;
}

export interface SlideEnhancementResult {
  enhancedSlide: GeneratedSlideContent;
  changes: string[];
  reasoning: string;
} 