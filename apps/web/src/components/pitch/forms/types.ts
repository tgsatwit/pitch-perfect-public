import type { WorkflowStepId, PitchDocumentData, FirebaseDoc } from '@/types/pitch';
import type { PitchStage } from "@/types/settings";

export interface PitchFramingFormProps {
  onPitchCreated: (firestoreId: string, langGraphThreadId: string) => void;
  createdPitchId?: string | null;
  setActiveStep: (stepId: WorkflowStepId) => void;
  loadedPitchData?: PitchDocumentData | null; // Add prop for pre-loaded data
  refreshPitchData: () => void;
  activeStepId?: WorkflowStepId; // Add activeStepId to props
  onThreadIdUpdate?: (threadId: string) => void; // Add callback for thread ID updates
  pitchStages?: PitchStage[]; // Add pitch stages prop
}

export interface DataSourcesState {
  dataSourcesSelected: Record<string, boolean>;
  subDataSourceChecks: Record<string, boolean>;
}

export interface CompetitorState {
  knownCompetitors: string[];
  selectedCompetitorsFromList: Record<string, boolean>;
  newCompetitor: string;
  competitors: FirebaseDoc[];
  competitorsLoading: boolean;
  competitorsError: string | null;
  competitorDetailedData: Record<string, any>;
}

export interface FormState {
  selectedClientId: string;
  selectedClientName: string;
  pitchStage: string;
  sentiment: number[];
  importantClientInfo: string;
  importantToClient: string;
  ourAdvantages: string;
  competitorStrengths: string;
  pitchFocus: string;
  relevantCaseStudies: string;
  keyMetrics: string;
  implementationTimeline: string;
  expectedROI: string;
  filesToUpload: FileList | null;
  clientDetailedData: any;
  ignoreSections: {
    clientInfo?: boolean;
    competitive?: boolean;
    focus?: boolean;
    advanced?: boolean;
  };
  isSaving: boolean;
  saveError: string | null;
}