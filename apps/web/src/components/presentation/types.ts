import { PitchContext } from '../../app/pitches/types';

// Slide types - matching the definition in app/pitches/types.ts
export type SlideType = 'title' | 'content' | 'chart' | 'table' | 'closing';

// Content section types
export type ContentSectionType = 'text' | 'bullet-list' | 'table' | 'chart' | 'image' | 'heading' | 'columns';

// Interface for content sections
export interface ContentSection {
  id: string;
  type: ContentSectionType;
  content: any;
  // Optional layout properties to enable canvas-style editing
  position?: {
    x: number;
    y: number;
  };
  size?: {
    width: number;
    height: number;
  };
  // Optional styling information (font, colours, etc.)
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    [key: string]: any; // Allow arbitrary additional style props
  };
}

// Slide content interface
export interface SlideContent {
  title?: string;
  subtitle?: string;
  body?: string;
  chartType?: 'bar' | 'line' | 'pie';
  data?: any;
  chartTitle?: string;
  headers?: string[];
  style?: string;
  sections?: ContentSection[];
  clientName?: string;
  bankName?: string;
  [key: string]: any; // Allow for additional properties
}

// Add theme-related types
export interface Theme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  headingFont: string;
  bodyFont: string;
}

export interface SlideTheme {
  themeId: string;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };
  customFonts?: {
    heading?: string;
    body?: string;
  };
}

// Update SlideData to include theme
export interface SlideData {
  id: string;
  type: SlideType;
  content: {
    title?: string;
    subtitle?: string;
    body?: string;
    sections?: ContentSection[];
    chartType?: string;
    data?: any;
    headers?: string[];
    clientName?: string;
    bankName?: string;
  };
  theme?: SlideTheme;
  notes?: string;
  research?: {
    clientData?: any;
    competitorData?: any;
    marketData?: any;
  };
  aiSuggestions?: {
    content?: string[];
    visuals?: string[];
    talking_points?: string[];
  };
}

// Add SlideOutlineData interface
export interface SlideOutlineData {
  id: string;
  number: number;
  title: string;
  purpose: string;
  keyContent: string[];
  supportingEvidence: string[];
  keyTakeaway: string;
  strategicFraming: string;
  visualRecommendation: string;
  slideType: 'title' | 'content' | 'chart' | 'table' | 'closing';
  companyName: string;
}

// Props for the SlideEditor component
export interface SlideEditorProps {
  slide: SlideData;
  onChange: (slideData: SlideData) => void;
  className?: string;
  slideOutlineData?: SlideOutlineData;
  onPreviousSlide?: () => void;
  onNextSlide?: () => void;
}

// Props for the PresentationWorkflow component
export interface PresentationWorkflowProps {
  pitchContext: PitchContext;
  initialOutline?: string;
  initialSlides?: any[];
  onComplete?: (slides: SlideData[]) => void;
}

// Workflow steps
export type WorkflowStep = 'setup' | 'generating' | 'editing' | 'review' | 'exporting';

// Content generation options
export interface ContentGenerationOptions {
  useOutline?: boolean;
  useSupportingEvidence?: boolean;
  useResearch?: boolean;
  additionalContext?: string;
}

// Slide generation request
export interface SlideGenerationRequest {
  slideType: SlideType;
  slideOutline: SlideOutlineData;
  sectionType?: ContentSectionType;
  sectionId?: string;
  options?: ContentGenerationOptions;
} 