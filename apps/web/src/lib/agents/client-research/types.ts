// Client research types for deployment
export interface ClientResearchInput {
  clientId?: string;
  companyName: string;
  website?: string;
  industry?: string;
  researchTopics?: any;
  onProgress?: (message: string) => void;
}

export interface ClientResearchOutput {
  output: {
    companyName: string;
    website?: string;
    industry?: string;
    summary: string;
    researchData: any;
  };
}