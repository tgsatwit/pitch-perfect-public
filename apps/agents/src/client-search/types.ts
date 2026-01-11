// Input parameters for the client search
export interface ClientSearchInput {
  companyName: string;
  website?: string;
  clientType?: "existing" | "prospective";
  relationshipStartDate?: string;
  currentMFI?: string;
}

// Output from the client search
export interface ClientSearchResult {
  description?: string;
  industry?: string;
  founded?: string;
  headquarters?: string;
  keyProducts?: string[];
  recentNews?: string;
  financialData?: Record<string, any>;
  marketPosition?: string;
  competitors?: string[];
}

// Progress update structure
export interface ProgressUpdate {
  status: string;
  updates: string[];
  percentage: number;
} 