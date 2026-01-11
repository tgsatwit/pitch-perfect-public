// Types for configurable pitch settings

export interface PitchStage {
  id: string;
  name: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SlideStructure {
  id: string;
  pitchStageId: string;
  title: string;
  description: string;
  order: number;
  isRequired: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface KeyPrinciple {
  id: string;
  title: string;
  description: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Firestore document interfaces
export interface PitchStageDocument extends Omit<PitchStage, 'createdAt' | 'updatedAt'> {
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface SlideStructureDocument extends Omit<SlideStructure, 'createdAt' | 'updatedAt'> {
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

export interface KeyPrincipleDocument extends Omit<KeyPrinciple, 'createdAt' | 'updatedAt'> {
  createdAt: any; // Firestore Timestamp
  updatedAt: any; // Firestore Timestamp
}

// API interfaces for CRUD operations
export interface CreatePitchStageRequest {
  name: string;
  description?: string;
  order: number;
}

export interface UpdatePitchStageRequest extends Partial<CreatePitchStageRequest> {
  isActive?: boolean;
}

export interface CreateSlideStructureRequest {
  pitchStageId: string;
  title: string;
  description: string;
  order: number;
  isRequired?: boolean;
}

export interface UpdateSlideStructureRequest extends Partial<CreateSlideStructureRequest> {
  isActive?: boolean;
}

export interface CreateKeyPrincipleRequest {
  title: string;
  description: string;
  order: number;
}

export interface UpdateKeyPrincipleRequest extends Partial<CreateKeyPrincipleRequest> {
  isActive?: boolean;
}

// Settings configuration for the outline generator
export interface OutlineGeneratorSettings {
  pitchStages: PitchStage[];
  slideStructures: Record<string, SlideStructure[]>; // Keyed by pitchStageId
  keyPrinciples: KeyPrinciple[];
} 