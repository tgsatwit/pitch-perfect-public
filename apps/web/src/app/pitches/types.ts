import { Timestamp } from "firebase/firestore";

export interface Competitor {
  id: string;
  name: string;
}

export interface Pitch {
  id: string;
  clientId: string;
  clientName: string;
  competitorsSelected: Record<string, boolean>;
  pitchStage: string;
  langGraphThreadId: string;
  createdAt: Timestamp;
  problem: string;
  solution: string;
  market: string;
}

export interface PitchContext {
  companyName: string;
  industry: string;
  problem: string;
  solution: string;
  market: string;
  competitors: Competitor[];
  clientName: string;
  pitchStage: string;
}

export type SlideType = 'title' | 'content' | 'chart' | 'table' | 'closing';

export interface SlideContent {
  id: string;
  type: SlideType;
  content: {
    title?: string;
    subtitle?: string;
    body?: string;
    chartType?: 'bar' | 'line' | 'pie';
    data?: any;
    chartTitle?: string;
    headers?: string[];
    style?: string;
  };
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