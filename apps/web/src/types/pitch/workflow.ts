export type WorkflowStepId = 'setup' | 'context' | 'slideStructure' | 'outline' | 'prepare' | 'buildDeck' | 'reflect';

export type MiniStep = 'setup' | 'dataSources';

export interface WorkflowStep {
  id: WorkflowStepId;
  title: string;
  description: string;
  completed?: boolean;
  current?: boolean;
}