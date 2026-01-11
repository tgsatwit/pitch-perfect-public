"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ClientResearchStatus } from "@/components/clients/client-research-status";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { doc, getDoc, updateDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Loader2,
  ArrowLeft,
  Search,
  CheckCircle,
  XCircle,
  Settings,
  PlusCircle,
  ChevronDown,
  RefreshCw,
  Beaker,
  Edit,
  CalendarPlus,
  UserCircle,
  DollarSign,
  FileText,
  FileSignature,
  Briefcase,
  BuildingIcon,
  GlobeIcon,
  MailIcon,
  PhoneIcon,
  ClockIcon,
  ChartPieIcon,
  Users,
  BarChart3,
  Target,
  FolderSearch,
  ChevronLeft,
  ExternalLink,
  Tag,
  Globe,
  Clock
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ResearchPromptGenerator } from "@/components/clients/research-prompt-generator";
import { ResearchPromptsList } from "@/components/clients/research-prompts-list";
import {
  query,
  where,
  addDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { ResearchPromptData } from "@/types/research";
import { seedTemplatePrompts } from "@/lib/seed-prompts";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow, format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useState as useReactState } from "react"; // Add this import if needed

// Add type for research topics configuration
interface ResearchTopicConfig {
  includeESG?: boolean;
  includeBenchmarking?: boolean;
  includeBankingRelationships?: boolean;
  includeDecisionMakers?: boolean;
  customTopics?: Array<{
    name: string;
    searchQuery: string;
    description: string;
  }>;
}

// Define a type for client
interface ClientData {
  id: string;
  name?: string;
  profileStatus?: string;
  research?: {
    summary?: string;
    swotAnalysis?: {
      strengths?: string[];
      weaknesses?: string[];
      opportunities?: string[];
      threats?: string[];
    };
    bankingOpportunities?: any[];
    recentDevelopments?: any[];
    marketPosition?: string;
    financialOverview?: any;
    decisionMakers?: any;
    keyDecisionMakers?: any[];
    [key: string]: any;
  };
  lastResearchResultId?: string;
  [key: string]: any; // Allow other properties
}

// Define research steps type
interface ResearchStep {
  id: string;
  name: string;
  status: "waiting" | "in-progress" | "completed" | "error";
  startTime?: Date;
  endTime?: Date;
}

// Add comprehensive data accessor utilities
const getResearchData = {
  // Get summary data with multiple fallbacks
  getSummary: (research: any): string => {
    if (!research) return "";
    
    // Direct summary field
    if (research.summary && research.summary !== "No summary available") {
      return research.summary;
    }
    
    // Check output.summary
    if (research.output?.summary && research.output.summary !== "No summary available") {
      return research.output.summary;
    }
    
    // Check if summary is nested in another structure
    if (research.data?.summary) {
      return research.data.summary;
    }
    
    return "";
  },

  // Get SWOT analysis with multiple fallbacks
  getSWOTAnalysis: (research: any) => {
    if (!research) return null;
    
    console.log("Looking for SWOT analysis in research data...");
    
    // Check direct swotAnalysis first (from aggregated output)
    if (research.swotAnalysis) {
      console.log("Found SWOT analysis in research.swotAnalysis:", research.swotAnalysis);
      return research.swotAnalysis;
    }
    
    // Check output.swotAnalysis
    if (research.output?.swotAnalysis) {
      console.log("Found SWOT analysis in research.output.swotAnalysis:", research.output.swotAnalysis);
      return research.output.swotAnalysis;
    }
    
    // Direct marketPositionData.swotAnalysis
    if (research.marketPositionData?.swotAnalysis) {
      console.log("Found SWOT analysis in research.marketPositionData.swotAnalysis:", research.marketPositionData.swotAnalysis);
      return research.marketPositionData.swotAnalysis;
    }
    
    // Check output.marketPositionData
    if (research.output?.marketPositionData?.swotAnalysis) {
      console.log("Found SWOT analysis in research.output.marketPositionData.swotAnalysis:", research.output.marketPositionData.swotAnalysis);
      return research.output.marketPositionData.swotAnalysis;
    }
    
    console.log("No SWOT analysis found in research data");
    return null;
  },

  // Get banking opportunities with multiple fallbacks
  getBankingOpportunities: (research: any) => {
    if (!research) return [];
    
    // Direct bankingOpportunitiesData
    if (research.bankingOpportunitiesData && Array.isArray(research.bankingOpportunitiesData)) {
      return research.bankingOpportunitiesData;
    }
    
    // Check output.bankingOpportunitiesData
    if (research.output?.bankingOpportunitiesData && Array.isArray(research.output.bankingOpportunitiesData)) {
      return research.output.bankingOpportunitiesData;
    }
    
    // Check bankingOpportunities
    if (research.bankingOpportunities && Array.isArray(research.bankingOpportunities)) {
      return research.bankingOpportunities;
    }
    
    // Check output.bankingOpportunities
    if (research.output?.bankingOpportunities && Array.isArray(research.output.bankingOpportunities)) {
      return research.output.bankingOpportunities;
    }
    
    return [];
  },

  // Get recent developments with multiple fallbacks
  getRecentDevelopments: (research: any) => {
    if (!research) return [];
    
    const developments = [];
    
    // Collect from recentDevelopmentsData
    if (research.recentDevelopmentsData && Array.isArray(research.recentDevelopmentsData)) {
      developments.push(...research.recentDevelopmentsData);
    }
    
    // Collect from output.recentDevelopmentsData
    if (research.output?.recentDevelopmentsData && Array.isArray(research.output.recentDevelopmentsData)) {
      developments.push(...research.output.recentDevelopmentsData);
    }
    
    // Collect from newsData
    if (research.newsData && Array.isArray(research.newsData)) {
      developments.push(...research.newsData);
    }
    
    // Collect from output.newsData
    if (research.output?.newsData && Array.isArray(research.output.newsData)) {
      developments.push(...research.output.newsData);
    }
    
    // Collect from recentDevelopments
    if (research.recentDevelopments && Array.isArray(research.recentDevelopments)) {
      developments.push(...research.recentDevelopments);
    }
    
    // Collect from output.recentDevelopments
    if (research.output?.recentDevelopments && Array.isArray(research.output.recentDevelopments)) {
      developments.push(...research.output.recentDevelopments);
    }

    return developments;
  },

  // Get executive data with multiple fallbacks
  getExecutiveData: (research: any) => {
    if (!research) return [];
    
    // Direct executiveData
    if (research.executiveData && Array.isArray(research.executiveData)) {
      return research.executiveData;
    }
    
    // Check output.executiveData
    if (research.output?.executiveData && Array.isArray(research.output.executiveData)) {
      return research.output.executiveData;
    }
    
    // Check keyDecisionMakers
    if (research.keyDecisionMakers && Array.isArray(research.keyDecisionMakers)) {
      return research.keyDecisionMakers;
    }
    
    // Check output.keyDecisionMakers
    if (research.output?.keyDecisionMakers && Array.isArray(research.output.keyDecisionMakers)) {
      return research.output.keyDecisionMakers;
    }
    
    // Check decisionMakers.keyPersonnel
    if (research.decisionMakers?.keyPersonnel && Array.isArray(research.decisionMakers.keyPersonnel)) {
      return research.decisionMakers.keyPersonnel;
    }
    
    // Check output.decisionMakers.keyPersonnel
    if (research.output?.decisionMakers?.keyPersonnel && Array.isArray(research.output.decisionMakers.keyPersonnel)) {
      return research.output.decisionMakers.keyPersonnel;
    }
    
    return [];
  },

  // Get financial data with multiple fallbacks
  getFinancialData: (research: any) => {
    if (!research) return { overview: "", metrics: {} };
    
    let financialData = { overview: "", metrics: {} };
    
    // Try financialData field
    if (research.financialData) {
      try {
        if (typeof research.financialData === 'string') {
          financialData = JSON.parse(research.financialData);
        } else if (typeof research.financialData === 'object') {
          financialData = research.financialData;
        }
      } catch (e) {
        financialData = { overview: research.financialData, metrics: {} };
      }
    }
    
    // Try output.financialOverview
    if (!financialData.overview && research.output?.financialOverview) {
      try {
        if (typeof research.output.financialOverview === 'string') {
          const parsed = JSON.parse(research.output.financialOverview);
          if (parsed.overview) {
            financialData = parsed;
          } else {
            financialData = { overview: research.output.financialOverview, metrics: {} };
          }
        } else if (typeof research.output.financialOverview === 'object') {
          financialData = research.output.financialOverview;
        }
      } catch (e) {
        financialData = { overview: research.output.financialOverview, metrics: {} };
      }
    }
    
    // Try financialOverview directly
    if (!financialData.overview && research.financialOverview) {
      try {
        if (typeof research.financialOverview === 'string') {
          const parsed = JSON.parse(research.financialOverview);
          if (parsed.overview) {
            financialData = parsed;
          } else {
            financialData = { overview: research.financialOverview, metrics: {} };
          }
        } else if (typeof research.financialOverview === 'object') {
          financialData = research.financialOverview;
        }
      } catch (e) {
        financialData = { overview: research.financialOverview, metrics: {} };
      }
    }
    
    return financialData;
  },

  // Get strategic considerations with multiple fallbacks
  getStrategicConsiderations: (research: any): string => {
    if (!research) return "";
    
    // Direct strategicConsiderations
    if (research.strategicConsiderations && research.strategicConsiderations !== "No strategic considerations available") {
      return research.strategicConsiderations;
    }
    
    // Check output.strategicConsiderations
    if (research.output?.strategicConsiderations && research.output.strategicConsiderations !== "No strategic considerations available") {
      return research.output.strategicConsiderations;
    }
    
    // Check marketPositionData.strategicConsiderations 
    if (research.marketPositionData?.strategicConsiderations) {
      return research.marketPositionData.strategicConsiderations;
    }
    
    // Check output.marketPositionData.strategicConsiderations
    if (research.output?.marketPositionData?.strategicConsiderations) {
      return research.output.marketPositionData.strategicConsiderations;
    }
    
    // Try to extract from summary
    if (research.summary) {
      const summaryMatch = research.summary.match(/## Strategic Considerations\s*([\s\S]*?)(?=##|$)/);
      if (summaryMatch && summaryMatch[1]) {
        return summaryMatch[1].trim();
      }
    }
    
    // Try to extract from output.summary
    if (research.output?.summary) {
      const summaryMatch = research.output.summary.match(/## Strategic Considerations\s*([\s\S]*?)(?=##|$)/);
      if (summaryMatch && summaryMatch[1]) {
        return summaryMatch[1].trim();
      }
    }
    
    // Try to construct from SWOT analysis
    const swot = getResearchData.getSWOTAnalysis(research);
    if (swot && (swot.opportunities?.length || swot.threats?.length)) {
      const parts = [];
      
      if (swot.opportunities && swot.opportunities.length) {
        parts.push("<strong>Strategic Opportunities:</strong><br/>" + 
          swot.opportunities.map((o: string) => `• ${o}`).join("<br/>"));
      }
      
      if (swot.threats && swot.threats.length) {
        parts.push("<strong>Strategic Challenges:</strong><br/>" + 
          swot.threats.map((t: string) => `• ${t}`).join("<br/>"));
      }
      
      if (parts.length) {
        return parts.join("<br/><br/>");
      }
    }
    
    return "";
  },

  // Check if research data exists
  hasResearchData: (research: any): boolean => {
    if (!research) return false;
    
    console.log("Checking research data availability:", {
      summary: !!research.summary,
      outputSummary: !!research.output?.summary,
      swotAnalysis: !!research.swotAnalysis,
      outputSWOT: !!research.output?.swotAnalysis,
      marketPositionSWOT: !!research.marketPositionData?.swotAnalysis,
      strategicConsiderations: !!research.strategicConsiderations,
      outputStrategicConsiderations: !!research.output?.strategicConsiderations,
      marketPositionStrategicConsiderations: !!research.marketPositionData?.strategicConsiderations
    });
    
    // Check for any of the expected data structures
    return !!(
      research.summary || 
      research.output?.summary ||
      research.financialData || 
      research.output?.financialOverview ||
      research.marketPositionData || 
      research.output?.marketPositionData ||
      research.bankingOpportunitiesData || 
      research.output?.bankingOpportunitiesData ||
      research.executiveData || 
      research.output?.executiveData ||
      research.recentDevelopmentsData || 
      research.output?.recentDevelopmentsData ||
      research.newsData || 
      research.output?.newsData ||
      research.swotAnalysis ||
      research.output?.swotAnalysis ||
      research.strategicConsiderations ||
      research.output?.strategicConsiderations
    );
  }
};

// Add ResearchProgressModal component
interface ResearchProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: ResearchStep[];
  error?: string;
  onRetry?: () => void;
}

const ResearchProgressModal = ({ isOpen, steps, error, onRetry, onClose }: ResearchProgressModalProps) => {
  // Calculate simple progress as a percentage
  const completedSteps = steps.filter(step => step.status === "completed").length;
  const inProgressSteps = steps.filter(step => step.status === "in-progress").length;
  
  // Count in-progress as half complete for smoother progress
  const progress = steps.length > 0 
    ? ((completedSteps + (inProgressSteps * 0.5)) / steps.length) * 100 
    : 0;
  
  const isAllCompleted = steps.every(step => step.status === "completed");
  const hasError = steps.some(step => step.status === "error");
  
  // Simple timer to increment progress if it's stuck
  const [forcedProgress, setForcedProgress] = useState(0);
  
  useEffect(() => {
    if (!isAllCompleted && !hasError) {
      const timer = setInterval(() => {
        setForcedProgress(prev => {
          // Increment by tiny amount until we reach real progress
          if (prev < progress) {
            return progress;
          }
          // Increment slowly if we're not at 100% yet
          return Math.min(prev + 0.5, 99.5);
        });
      }, 500);
      
      return () => clearInterval(timer);
    }
  }, [progress, isAllCompleted, hasError]);
  
  // Use forced progress when actual progress is zero
  const displayProgress = progress > 0 ? progress : forcedProgress;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open && (isAllCompleted || hasError)) {
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isAllCompleted ? "Research Complete" : hasError ? "Research Error" : "Researching Client"}
          </DialogTitle>
          <DialogDescription>
            {isAllCompleted 
              ? "All research has been completed successfully." 
              : hasError 
                ? "There was an error during the research process." 
                : "Please wait while we research this client..."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {/* Progress indicator */}
          <div className="mb-6">
            <Progress value={displayProgress} className="h-2 w-full" />
            <p className="text-xs text-right mt-1 text-gray-500">{Math.round(displayProgress)}% complete</p>
          </div>
          
          {/* Simple loading indicator for in-progress */}
          {!isAllCompleted && !hasError && (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600 text-sm">Researching company data and generating insights...</p>
              </div>
            </div>
          )}
          
          {/* Success indicator */}
          {isAllCompleted && (
            <div className="flex items-center justify-center py-8">
              <div className="flex flex-col items-center">
                <CheckCircle className="h-8 w-8 text-green-500 mb-4" />
                <p className="text-gray-600 text-sm">Research complete! You can now view the results.</p>
              </div>
            </div>
          )}
          
          {/* Error display */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
              <p className="font-medium">Error:</p>
              <p className="mt-1">{error}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          {isAllCompleted ? (
            <Button onClick={onClose}>
              View Results
            </Button>
          ) : hasError && onRetry ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={onRetry}>
                Retry
              </Button>
            </div>
          ) : (
            <Button variant="outline" disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Researching...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Add the EditCardModal component before the ClientProfile component
interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: string;
  cardTitle: string;
  content: string;
  onSave: (cardId: string, newContent: string) => Promise<void>;
}

const EditCardModal = ({ isOpen, onClose, cardId, cardTitle, content, onSave }: EditCardModalProps) => {
  const [editedContent, setEditedContent] = useState(content);
  const [saving, setSaving] = useState(false);

  // Reset content when the modal opens with new content
  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(cardId, editedContent);
      onClose();
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit {cardTitle}</DialogTitle>
          <DialogDescription>
            Make changes to the content. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={10}
            className="w-full resize-none"
            placeholder="Enter content..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function ClientProfileContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const clientId = params?.id as string;

  const [client, setClient] = useState<ClientData>({ id: '' });
  const [loading, setLoading] = useState(true);
  const [researchLoading, setResearchLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showResearchConfig, setShowResearchConfig] = useState(false);
  const [showResearchConfirm, setShowResearchConfirm] = useState(false);

  // Research topic configuration state
  const [researchConfig, setResearchConfig] = useState<ResearchTopicConfig>({
    includeESG: true,
    includeBenchmarking: true,
    includeBankingRelationships: true,
    includeDecisionMakers: true,
    customTopics: [],
  });

  // Add state for research prompts
  const [researchPrompts, setResearchPrompts] = useState<ResearchPromptData[]>(
    []
  );
  const [promptsLoading, setPromptsLoading] = useState(false);

  // In the ClientProfile component, add state for the edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentEditCard, setCurrentEditCard] = useState({ id: "", title: "", content: "" });

  // Add ResearchProgressModal component
  const [researchSteps, setResearchSteps] = useState<ResearchStep[]>([
    { id: "financial", name: "Financial Research", status: "waiting" },
    { id: "news", name: "News Research", status: "waiting" },
    { id: "developments", name: "Recent Developments", status: "waiting" },
    { id: "market", name: "Market Position Analysis", status: "waiting" },
    { id: "decision-makers", name: "Decision Makers Research", status: "waiting" },
    { id: "banking", name: "Banking Opportunities", status: "waiting" },
    { id: "aggregation", name: "Data Aggregation", status: "waiting" },
    { id: "summary", name: "Summary Generation", status: "waiting" },
  ]);
  const [showResearchProgress, setShowResearchProgress] = useState(false);
  const [researchError, setResearchError] = useState<string | undefined>();

  // Get the tab from the URL query parameter
  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab && ["overview", "research", "prompts", "pitches"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchClient = async () => {
      setLoading(true);
      try {
        console.log("Fetching client with ID:", clientId);
        const clientDocRef = doc(db, "clients", clientId);
        console.log("Client document reference:", clientDocRef);

        const clientDoc = await getDoc(clientDocRef);
        console.log(
          "Client document snapshot received, exists:",
          clientDoc.exists()
        );

        if (clientDoc.exists()) {
          const clientData = clientDoc.data() as ClientData;
          clientData.id = clientDoc.id;
          console.log("Client data loaded successfully:", clientData);
          console.log("Research data in client:", clientData.research);
          // Log research data accessibility
          if (clientData.research) {
            console.log("Keys in research object:", Object.keys(clientData.research));
            console.log("Research data accessible via getResearchData:", {
              hasSummary: !!getResearchData.getSummary(clientData.research),
              hasFinancialData: !!getResearchData.getFinancialData(clientData.research).overview,
              hasSWOTAnalysis: !!getResearchData.getSWOTAnalysis(clientData.research),
              hasBankingOpportunities: getResearchData.getBankingOpportunities(clientData.research).length > 0,
              hasRecentDevelopments: getResearchData.getRecentDevelopments(clientData.research).length > 0,
              hasExecutiveData: getResearchData.getExecutiveData(clientData.research).length > 0
            });
          }
          setClient(clientData);
        } else {
          console.error("Client not found with ID:", clientId);
          alert(`Client with ID ${clientId} not found.`);
          router.push("/clients");
        }
      } catch (error) {
        console.error("Error fetching client:", error);
        alert(
          `Error loading client: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        router.push("/clients");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [clientId, router]);

  // Fetch research prompts
  useEffect(() => {
    const fetchPrompts = async () => {
      if (!clientId) return;
      setPromptsLoading(true);

      try {
        const promptsQuery = query(
          collection(db, "researchPrompts"),
          where("clientId", "==", clientId)
        );

        const promptsSnapshot = await getDocs(promptsQuery);
        const promptsList = promptsSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp?.toDate() || new Date(), // Handle missing timestamp
            lastProcessedAt: data.lastProcessedAt
              ? data.lastProcessedAt.toDate()
              : undefined,
          };
        }) as ResearchPromptData[];

        setResearchPrompts(promptsList);
      } catch (error) {
        console.error("Error fetching research prompts:", error);
      } finally {
        setPromptsLoading(false);
      }
    };

    fetchPrompts();
  }, [clientId]);

  // Add a useEffect to log client changes
  useEffect(() => {
    if (client && client.id) {
      console.log("Client state updated:", client);
      console.log("Client research data:", client.research);
      // Log types to understand data structure
      console.log("Client research type:", client.research ? typeof client.research : "undefined");
      console.log("Client research has summary:", client.research && 'summary' in client.research);
    }
  }, [client]);

  // Update startResearch function to use the modal and track progress
  const startResearch = async () => {
    if (!client) return;

    // Reset research steps statuses
    setResearchSteps(steps => steps.map(step => ({ ...step, status: "waiting" })));
    setResearchError(undefined);
    setShowResearchProgress(true);
    setResearchLoading(true);

    try {
      console.log("Starting research for client:", client.id);

      // Update the step for starting research
      setResearchSteps(steps => 
        steps.map(step => 
          step.id === "financial" ? { ...step, status: "in-progress", startTime: new Date() } : step
        )
      );

      // First update the client's profile status
      const clientRef = doc(db, "clients", clientId);
      console.log("Updating client status to 'researching'");

      try {
        await updateDoc(clientRef, {
          profileStatus: "researching",
          statusUpdatedAt: new Date(),
        });
        console.log("Client status updated successfully");
      } catch (updateError) {
        console.error("Error updating client status:", updateError);
        throw new Error(
          `Failed to update client status: ${updateError instanceof Error ? updateError.message : "Unknown error"}`
        );
      }

      // Update the local state
      setClient({
        ...client,
        profileStatus: "researching",
      });

      // Prepare the input for the client research
      const requestBody = {
        clientId,
        companyName: client.name,
        website: client.website,
        industry: client.info?.industry || "",
        researchTopics: researchConfig,
      };

      console.log("Request body:", requestBody);

      try {
        // Call the client-research agent API with absolute URL
        const apiUrl = `${window.location.origin}/api/agents/client-research`;
        console.log("Calling client research API at:", apiUrl);

        // Set up a response handler to process progress updates
        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error("API error response:", errorData);
          throw new Error(
            `Error from client-research agent: ${response.status} ${response.statusText}`
          );
        }

        // Process the response
        const responseText = await response.text();
        try {
          // Try to parse the response as JSON
          const data = JSON.parse(responseText);
          
          // Process step updates from logs if available
          if (data.logs && Array.isArray(data.logs)) {
            console.log("Research logs received:", data.logs);
            
            // Process each log message and update the UI accordingly
            data.logs.forEach((log: string) => {
              processLogMessage(log);
            });
          }
          
          // Explicitly mark all steps as complete in order
          console.log("Research complete! Marking all steps as completed...");
          
          // Create an array of step IDs in their correct order
          const stepOrder = [
            "financial", "news", "developments", "market", 
            "decision-makers", "banking", "aggregation", "summary"
          ];
          
          // Force completion of each step in sequence with slight delays
          // to ensure proper visual updates
          let delay = 0;
          stepOrder.forEach(stepId => {
            setTimeout(() => {
              updateStepStatus(stepId, "completed");
              console.log(`Marked ${stepId} as completed`);
            }, delay);
            delay += 100; // Stagger by 100ms each
          });
          
          // The API already updates the database with the results
          // So we just need to refresh the client data
          await refreshClientData();
          
          toast.success("Client research completed successfully");
        } catch (e) {
          console.error("Error processing response:", e);
          console.log("Raw response:", responseText);
          // If we couldn't parse the response, just mark all steps as complete
          setResearchSteps(steps => steps.map(step => ({ ...step, status: "completed", endTime: new Date() })));
          
          // Try to refresh the client data anyway
          await refreshClientData();
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setResearchError(errorMessage);
        
        // Mark the current step as error
        const currentStep = researchSteps.find(step => step.status === "in-progress");
        if (currentStep) {
          setResearchSteps(steps => 
            steps.map(step => 
              step.id === currentStep.id ? { ...step, status: "error", endTime: new Date() } : step
            )
          );
        }
        
        throw error;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Error during client research:", errorMessage, error);
      setResearchError(errorMessage);

      // Update to error state in Firestore
      console.log("Attempting to update Firestore status to 'error'...");
      try {
        await updateDoc(doc(db, "clients", clientId), {
          profileStatus: "error",
          lastError: errorMessage,
          errorTimestamp: new Date(),
        });
        console.log("Firestore status updated to 'error' successfully.");
      } catch (updateError) {
        const updateErrorMessage = updateError instanceof Error ? updateError.message : String(updateError);
        console.error("CRITICAL: Failed to update Firestore status to 'error':", updateErrorMessage, updateError);
        // Continue even if Firestore update fails, to update local state
      }

      // Update local state
      console.log("Updating local client state to 'error'...");
      setClient((prevClient: any) => ({
        ...prevClient,
        profileStatus: "error",
        lastError: errorMessage,
      }));
      console.log("Local client state updated to 'error'.");

      toast.error(`Research failed: ${errorMessage}`);
    } finally {
      console.log("Setting researchLoading to false.");
      setResearchLoading(false);
      
      // Don't close the progress modal on error - user needs to see the error
      if (!researchError) {
        // Delay hiding the modal to let user see completion, then refresh data
        setTimeout(async () => {
          setShowResearchProgress(false);
          
          // Refresh the client data to show updated research results
          await refreshClientData();
        }, 2000);
      }
    }
  };

  // Find the processLogMessage function and replace it with a much simpler version
  const processLogMessage = (log: string) => {
    console.log("Log message:", log);
    
    // Just increment progress by marking some step as completed
    // Don't worry about specific steps - just mark one complete
    // so the progress bar advances
    
    // Get the first waiting/in-progress step
    const nextStep = researchSteps.find(step => 
      step.status === "waiting" || step.status === "in-progress"
    );
    
    if (nextStep) {
      updateStepStatus(nextStep.id, "completed");
      
      // If there's another step after this one, mark it as in-progress
      const stepIndex = researchSteps.findIndex(s => s.id === nextStep.id);
      if (stepIndex >= 0 && stepIndex < researchSteps.length - 1) {
        updateStepStatus(researchSteps[stepIndex + 1].id, "in-progress");
      }
    }
  };

  // Helper function to update research step status
  const updateStepStatus = (stepId: string, status: ResearchStep["status"]) => {
    console.log(`Updating step ${stepId} to ${status}`);
    
    // Use a more direct approach with immediate state update
    setResearchSteps(prevSteps => 
      prevSteps.map(step => {
        // Only update the matching step
        if (step.id === stepId) {
          // Always update to ensure UI refreshes
          const now = new Date();
          return {
            ...step,
            status,
            ...(status === "in-progress" ? { startTime: now } : {}),
            ...(status === "completed" || status === "error" ? { endTime: now } : {})
          };
        }
        return step;
      })
    );
    
    // Force console log of current step for debugging
    console.log(`Step ${stepId} updated to ${status} at ${new Date().toISOString()}`);
  };

  // Add a function to refresh client data
  const refreshClientData = async () => {
    if (!clientId) return;
    
    try {
      const clientDocRef = doc(db, "clients", clientId);
      const clientDoc = await getDoc(clientDocRef);
      
      if (clientDoc.exists()) {
        const clientData = clientDoc.data() as ClientData;
        clientData.id = clientDoc.id;
        console.log("Refreshed client data:", clientData);
        console.log("Refreshed research data:", clientData.research);
        
        // Process research data structure - now handled by getResearchData accessors
        if (clientData.research) {
          console.log("Keys in research object:", Object.keys(clientData.research));
          console.log("Research data accessible via getResearchData:", {
            hasSummary: !!getResearchData.getSummary(clientData.research),
            hasFinancialData: !!getResearchData.getFinancialData(clientData.research).overview,
            hasSWOTAnalysis: !!getResearchData.getSWOTAnalysis(clientData.research),
            hasBankingOpportunities: getResearchData.getBankingOpportunities(clientData.research).length > 0,
            hasRecentDevelopments: getResearchData.getRecentDevelopments(clientData.research).length > 0,
            hasExecutiveData: getResearchData.getExecutiveData(clientData.research).length > 0
          });
        }
        
        setClient(clientData);
        console.log("Client state updated successfully after refresh");
        return clientData;
      }
    } catch (error) {
      console.error("Error refreshing client data:", error);
      toast.error("Failed to refresh client data");
    }
  };

  // Handle changes to research topic configuration
  const handleResearchConfigChange = (
    key: keyof ResearchTopicConfig,
    value: boolean
  ) => {
    setResearchConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getStatusBadge = () => {
    if (!client) return null;

    switch (client.profileStatus) {
      case "initial":
        return (
          <Badge variant="outline" className="ml-2">
            Initial Setup
          </Badge>
        );
      case "researching":
        return (
          <Badge variant="secondary" className="ml-2">
            Research In Progress
          </Badge>
        );
      case "complete":
        return (
          <Badge variant="success" className="ml-2 bg-green-100 text-green-800">
            Research Complete
          </Badge>
        );
      case "error":
        return (
          <Badge variant="destructive" className="ml-2">
            Research Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="ml-2">
            Initial Setup
          </Badge>
        );
    }
  };

  // Handle saving a new research prompt
  const handleSavePrompt = async (promptData: ResearchPromptData) => {
    try {
      // Add clientId to the prompt data and ensure tags are initialized
      const promptWithClientId = {
        ...promptData,
        clientId,
        tags: promptData.tags || [],
      };

      // Save to Firestore
      const docRef = await addDoc(
        collection(db, "researchPrompts"),
        promptWithClientId
      );

      // Update local state with the new prompt
      setResearchPrompts((prev) => [
        ...prev,
        { ...promptWithClientId, id: docRef.id },
      ]);
    } catch (error) {
      console.error("Error saving research prompt:", error);
      alert("Failed to save research prompt");
    }
  };

  // Handle deleting a research prompt
  const handleDeletePrompt = async (promptId: string) => {
    try {
      await deleteDoc(doc(db, "researchPrompts", promptId));

      // Update local state
      setResearchPrompts((prev) => prev.filter((p) => p.id !== promptId));
    } catch (error) {
      console.error("Error deleting research prompt:", error);
      alert("Failed to delete research prompt");
    }
  };

  // Add a function to import templates
  const importTemplatePrompts = async () => {
    try {
      if (!client?.id) return;

      setPromptsLoading(true);
      const createdIds = await seedTemplatePrompts(client.id);

      if (createdIds.length > 0) {
        // Refresh prompts
        const promptsQuery = query(
          collection(db, "researchPrompts"),
          where("clientId", "==", clientId)
        );

        const promptsSnapshot = await getDocs(promptsQuery);
        const promptsList = promptsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate(), // Convert Firestore timestamp to JS Date
        })) as ResearchPromptData[];

        setResearchPrompts(promptsList);

        alert(`Successfully added ${createdIds.length} template prompts.`);
      } else {
        alert("Templates are already imported for this client.");
      }
    } catch (error) {
      console.error("Error importing template prompts:", error);
      alert(
        `Error importing template prompts: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    } finally {
      setPromptsLoading(false);
    }
  };

  // Add a function to refresh prompts
  const refreshPrompts = async () => {
    if (!clientId) return;

    setPromptsLoading(true);
    try {
      const promptsQuery = query(
        collection(db, "researchPrompts"),
        where("clientId", "==", clientId)
      );

      const promptsSnapshot = await getDocs(promptsQuery);
      const promptsList = promptsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate(), // Convert Firestore timestamp to JS Date
        lastProcessedAt: doc.data().lastProcessedAt
          ? doc.data().lastProcessedAt.toDate()
          : undefined,
      })) as ResearchPromptData[];

      setResearchPrompts(promptsList);
    } catch (error) {
      console.error("Error refreshing prompts:", error);
    } finally {
      setPromptsLoading(false);
    }
  };

  // Format the date if it exists
  const formattedDate = client?.updatedAt 
    ? new Date(client.updatedAt).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'short', day: 'numeric' 
      }) 
    : 'Not available';

  // Add a helper function to debug and access nested research data
  const getNestedData = (obj: any, path: string) => {
    if (!obj) return undefined;
    console.log(`Accessing ${path} in:`, obj);
    return path.split('.').reduce((acc, part) => (acc && acc[part] ? acc[part] : undefined), obj);
  };

  // Add a helper function to check research data directly
  const checkResearchData = async (clientId: string) => {
    try {
      // First, check if the research data is in the client document
      const clientDocRef = doc(db, "clients", clientId);
      const clientDoc = await getDoc(clientDocRef);
      
      if (clientDoc.exists()) {
        const clientData = clientDoc.data();
        console.log("Client data from direct Firestore check:", clientData);
        console.log("Research data directly from Firestore:", clientData.research);

        // Check if there's a lastResearchResultId to find the separate research document
        if (clientData.lastResearchResultId) {
          console.log("Found lastResearchResultId:", clientData.lastResearchResultId);
          
          // Try to fetch the research result document
          const researchDocRef = doc(db, "researchResults", clientData.lastResearchResultId);
          const researchDoc = await getDoc(researchDocRef);
          
          if (researchDoc.exists()) {
            console.log("Found separate research document:", researchDoc.data());
            // Try to manually update the client state with this data
            setClient(prevClient => ({
              ...prevClient,
              research: researchDoc.data()
            }));
            return true;
          } else {
            console.error("Research document referenced but not found");
          }
        }
      }
      return false;
    } catch (error) {
      console.error("Error checking research data:", error);
      return false;
    }
  };

  // Use the checkResearchData function in a useEffect hook
  useEffect(() => {
    if (client && client.id && client.profileStatus === "complete" && !client.research) {
      console.log("Client status is complete but no research data found, checking Firestore directly");
      checkResearchData(client.id);
    }
  }, [client]);

  // Improve the parseSummaryIntoSections function to remove duplicates and handle Conclusion
  const parseSummaryIntoSections = (summary: string) => {
    if (!summary) return [];
    
    // Split the content by section headers (## )
    const sections = summary.split(/(?=## )/);
    
    // Track what sections we've already processed to avoid duplicates
    const processedSections = new Set<string>();
    const result = [];
    
    // First pass - find Company Overview and Conclusion to merge them
    let overviewSection = sections.find(s => s.startsWith('## Company Overview'));
    const conclusionSection = sections.find(s => s.startsWith('## Conclusion'));
    
    // Process each section
    for (const section of sections) {
      // Extract the heading and content
      const headingMatch = section.match(/^## ([^\n]+)/);
      let heading = headingMatch ? headingMatch[1].trim() : 'Overview';
      
      // Skip if we've already processed this section type
      if (processedSections.has(heading)) continue;
      
      // Skip Executive Summary and Conclusion sections
      if (heading === 'Executive Summary' || heading === 'Conclusion') continue;
      
      // Skip sections that will be rendered as specialized cards
      if (heading === 'SWOT Analysis' || 
          heading === 'Banking Opportunities' || 
          heading === 'Recent Developments') continue;
      
      // Remove the heading from the content
      let content = section.replace(/^## [^\n]+\n/, '').trim();
      
      // Merge conclusion into company overview if it exists but without the subheading
      if (heading === 'Company Overview' && conclusionSection) {
        const conclusionContent = conclusionSection.replace(/^## [^\n]+\n/, '').trim();
        content += '<br/><br/>' + conclusionContent;
      }
      
      // Simple markdown to HTML conversion for basic formatting
      content = content
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/- ([^\n]+)/g, '• $1<br/>') // List items
        .replace(/\n\n/g, '<br/><br/>') // Paragraphs
        .replace(/\n/g, '<br/>'); // Line breaks
      
      processedSections.add(heading);
      result.push({ heading, content });
    }
    
    return result;
  };

  // First let's create a reusable card header component 
  const CardHeaderWithActions = ({ 
    icon, 
    title, 
    cardId, 
    onEdit, 
    onRefresh 
  }: { 
    icon: React.ReactNode, 
    title: string, 
    cardId: string, 
    onEdit: (id: string) => void,
    onRefresh: (id: string) => void 
  }) => {
    return (
      <CardHeader className="pb-3 bg-gray-50 dark:bg-gray-800/50 flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle>{title}</CardTitle>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
            onClick={() => onEdit(cardId)}
            title="Edit"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50"
            onClick={() => onRefresh(cardId)}
            title="Refresh"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
    );
  };

  // Update the handleCardEdit function to open the modal with the right content
  const handleCardEdit = (cardId: string) => {
    // Find the content based on the card ID
    let title = "";
    let content = "";
    
    // Determine which content to edit based on cardId
    switch (cardId) {
      case "company-overview":
        title = "Company Overview";
        content = client.research?.summary || "";
        break;
      case "financial-market-analysis":
        title = "Financial and Market Analysis";
        content = client.research?.financialMarketAnalysis || "";
        break;
      case "strategic-considerations":
        title = "Strategic Considerations";
        content = client.research?.strategicConsiderations || "";
        break;
      case "swot-analysis":
        title = "SWOT Analysis";
        content = JSON.stringify(client.research?.marketPositionData?.swotAnalysis || {}, null, 2);
        break;
      case "banking-opportunities":
        title = "Banking Opportunities";
        content = JSON.stringify(client.research?.bankingOpportunitiesData || [], null, 2);
        break;
      case "recent-developments":
        title = "Recent Developments";
        content = JSON.stringify(client.research?.recentDevelopmentsData || [], null, 2);
        break;
      // Add other cases as needed
      default:
        content = "No content available for editing";
    }
    
    // Set the current card being edited and open the modal
    setCurrentEditCard({ id: cardId, title, content });
    setEditModalOpen(true);
  };

  // Add a function to save the edited content to Firebase
  const saveCardContent = async (cardId: string, newContent: string) => {
    if (!client || !clientId) return;
    
    // Create a copy of the current research data
    const updatedResearch = { ...client.research };
    
    // Update the appropriate section based on cardId
    switch (cardId) {
      case "company-overview":
        updatedResearch.summary = newContent;
        break;
      case "financial-market-analysis":
        updatedResearch.financialMarketAnalysis = newContent;
        break;
      case "strategic-considerations":
        updatedResearch.strategicConsiderations = newContent;
        break;
      case "swot-analysis":
        try {
          updatedResearch.marketPositionData = {
            ...updatedResearch.marketPositionData,
            swotAnalysis: JSON.parse(newContent)
          };
        } catch (e) {
          throw new Error("Invalid JSON format for SWOT Analysis");
        }
        break;
      case "banking-opportunities":
        try {
          updatedResearch.bankingOpportunitiesData = JSON.parse(newContent);
        } catch (e) {
          throw new Error("Invalid JSON format for Banking Opportunities");
        }
        break;
      case "recent-developments":
        try {
          updatedResearch.recentDevelopmentsData = JSON.parse(newContent);
        } catch (e) {
          throw new Error("Invalid JSON format for Recent Developments");
        }
        break;
      // Add other cases as needed
      default:
        throw new Error("Unknown card type");
    }
    
    // Update Firebase
    const clientRef = doc(db, "clients", clientId);
    await updateDoc(clientRef, {
      research: updatedResearch,
      updatedAt: new Date().toISOString()
    });
    
    // Update the local state to reflect changes
    setClient({
      ...client,
      research: updatedResearch,
      updatedAt: new Date().toISOString()
    });
    
    toast.success(`Updated ${currentEditCard.title} successfully`);
  };

  // Add the handleCardRefresh function after the saveCardContent function
  const handleCardRefresh = (cardId: string) => {
    // This is a placeholder that will eventually re-run research for a specific section
    toast.info(`Refresh research functionality will be implemented for card: ${cardId}`);
    
    // In a full implementation, this would trigger a targeted refresh of just this section
    // For now we just show a toast message
  };

  if (loading) {
    return (
      <div className="relative min-h-screen">
        {/* Gradient header background */}
        <div className="absolute top-0 w-full h-64 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-b-3xl" />
        
        <div className="container mx-auto px-6 pt-10 relative">
          <div className="animate-pulse space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-xl" />
                    <div>
                      <Skeleton className="h-8 w-64 mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                  <Skeleton className="h-10 w-32 mt-4 md:mt-0" />
                </div>
              </CardHeader>
            </Card>
            <Skeleton className="h-64 w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="relative min-h-screen">
        {/* Gradient header background */}
        <div className="absolute top-0 w-full h-64 bg-gradient-to-r from-red-600 to-red-700 rounded-b-3xl" />
        
        <div className="container mx-auto px-6 pt-10 relative">
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-8">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Error</h2>
                <p className="mt-2 text-[#4b5563] dark:text-[#9ca3af]">Client not found</p>
                <Button 
                  className="mt-6" 
                  variant="outline"
                  onClick={() => router.push("/clients")}
                >
                  Back to Clients
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Gradient header background */}
      <div className="absolute top-0 w-full h-64 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-10" />
      
      <div className="w-full px-6 py-8 relative">
        {/* Back button */}
        <div className="mb-4">
          <Link 
            href="/clients" 
            className="inline-flex items-center text-indigo-600 hover:text-indigo-500"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Return to Clients List
          </Link>
        </div>
        
        {/* Client Profile Card - Light mode styling */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-md overflow-hidden mb-8">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
              <div className="flex items-center gap-4">
                {/* Client avatar/initial */}
                <div className="w-16 h-16 rounded-md bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">
                  {client?.name?.charAt(0) || "?"}
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{client?.name || "Client Not Found"}</h1>
                  <div className="flex items-center text-slate-600 mt-1">
                    <Tag className="h-4 w-4 mr-1" />
                    <span>{client?.industry || client?.sector || "Industry not specified"}</span>
                  </div>
                  {client?.website && (
                    <a 
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-indigo-600 hover:text-indigo-500 mt-1"
                    >
                      <Globe className="h-4 w-4 mr-1" />
                      {client.website.replace(/^https?:\/\/(www\.)?/, "")}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  )}
                  {client?.clientType === "existing" && (
                    <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Existing Client
                    </div>
                  )}
                  {client?.clientType === "prospective" && (
                    <div className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      Prospective Client
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => router.push(`/clients/${clientId}/edit`)}
                    className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    onClick={startResearch}
                    disabled={researchLoading}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
                  >
                    {researchLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Run Research
                      </>
                    )}
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                    onClick={() => router.push(`/pitches/new?clientId=${clientId}`)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Pitch
                  </Button>
                </div>
                <div className="text-sm text-slate-500 text-right">
                  <Clock className="h-3 w-3 inline-block mr-1" />
                  Updated {client?.updatedAt 
                    ? (() => {
                        try {
                          // Validate if the date is valid before passing to formatDistanceToNow
                          const date = new Date(client.updatedAt);
                          if (isNaN(date.getTime())) {
                            return "recently"; // Fallback for invalid dates
                          }
                          return formatDistanceToNow(date, { addSuffix: true });
                        } catch (e) {
                          console.error("Date formatting error:", e);
                          return "recently"; // Fallback if any error occurs
                        }
                      })()
                    : 'never'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            {/* Tabs */}
            <Tabs value={activeTab} className="space-y-8">
              <TabsList className="inline-flex h-auto p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <TabsTrigger 
                  value="overview" 
                  onClick={() => {
                    setActiveTab("overview");
                    router.push(`/clients/${clientId}?tab=overview`);
                  }}
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-md py-2 px-4 flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Summary</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="details" 
                  onClick={() => {
                    setActiveTab("details");
                    router.push(`/clients/${clientId}?tab=details`);
                  }}
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-md py-2 px-4 flex items-center gap-2"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Details</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="financial" 
                  onClick={() => {
                    setActiveTab("financial");
                    router.push(`/clients/${clientId}?tab=financial`);
                  }}
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-md py-2 px-4 flex items-center gap-2"
                >
                  <DollarSign className="h-4 w-4" />
                  <span>Financials</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="executives" 
                  onClick={() => {
                    setActiveTab("executives");
                    router.push(`/clients/${clientId}?tab=executives`);
                  }}
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 rounded-md py-2 px-4 flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  <span>Executives</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                {client.research && getResearchData.hasResearchData(client.research) ? (
                  <>
                    {/* Create a space-y-6 container for all the card rows */}
                    <div className="space-y-6">
                      {/* Row 1: Company Overview (full width) */}
                      {(() => {
                        const summary = getResearchData.getSummary(client.research);
                        return summary ? (
                          parseSummaryIntoSections(summary)
                            .filter(section => section.heading === "Company Overview")
                            .map((section, index) => (
                          <Card 
                            key={`company-overview-${index}`} 
                            className="overflow-hidden transition-all duration-200 hover:shadow-sm w-full"
                          >
                            <CardHeaderWithActions
                              icon={<Briefcase className="h-5 w-5 text-indigo-600" />}
                              title="Company Overview"
                              cardId="company-overview"
                              onEdit={handleCardEdit}
                              onRefresh={handleCardRefresh}
                            />
                            <CardContent className="pt-5">
                              <div dangerouslySetInnerHTML={{ __html: section.content }} />
                            </CardContent>
                          </Card>
                        ))
                        ) : (
                        // Fallback when no proper summary available - show a basic company overview card
                        <Card className="overflow-hidden transition-all duration-200 hover:shadow-sm w-full">
                          <CardHeaderWithActions
                            icon={<Briefcase className="h-5 w-5 text-indigo-600" />}
                            title="Company Overview"
                            cardId="company-overview"
                            onEdit={handleCardEdit}
                            onRefresh={handleCardRefresh}
                          />
                          <CardContent className="pt-5">
                            <div>
                              <p><strong>Company:</strong> {client.name}</p>
                              {client.info?.industry && <p><strong>Industry:</strong> {client.info.industry}</p>}
                              {client.website && <p><strong>Website:</strong> {client.website}</p>}
                              <p className="mt-4">Research data is available but summary is being processed. Check the individual sections below for detailed information.</p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                      })()}
                      
                      {/* Row 2: Financial and Market Analysis + Strategic Considerations (two equal columns) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card 
                          key="financial-market-analysis" 
                          className="overflow-hidden transition-all duration-200 hover:shadow-sm"
                        >
                          <CardHeaderWithActions
                            icon={<BarChart3 className="h-5 w-5 text-indigo-600" />}
                            title="Financial and Market Analysis"
                            cardId="financial-market-analysis"
                            onEdit={handleCardEdit}
                            onRefresh={handleCardRefresh}
                          />
                          <CardContent className="pt-5">
                            {(() => {
                              const financialData = getResearchData.getFinancialData(client.research);
                              
                              if (financialData.overview) {
                                // Simple formatting for the content
                                const formattedContent = financialData.overview.replace(/\n/g, '<br/>');
                                
                                return (
                                  <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
                                );
                              }
                              
                              return <p className="text-gray-500">No financial and market analysis available</p>;
                            })()}
                          </CardContent>
                        </Card>

                        <Card 
                          key="strategic-considerations" 
                          className="overflow-hidden transition-all duration-200 hover:shadow-sm"
                        >
                          <CardHeaderWithActions
                            icon={<FolderSearch className="h-5 w-5 text-indigo-600" />}
                            title="Strategic Considerations"
                            cardId="strategic-considerations"
                            onEdit={handleCardEdit}
                            onRefresh={handleCardRefresh}
                          />
                          <CardContent className="pt-5">
                            {(() => {
                              const strategicContent = getResearchData.getStrategicConsiderations(client.research);

                              if (strategicContent) {
                                // Simple formatting for the content
                                const formattedContent = strategicContent.replace(/\n/g, '<br/>');
                                
                                return (
                                  <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
                                );
                              }
                              
                              return <p className="text-gray-500">No strategic considerations available</p>;
                            })()}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Row 3: SWOT Analysis + Banking Opportunities + Recent Developments (three equal columns) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(() => {
                          const swotAnalysis = getResearchData.getSWOTAnalysis(client.research);
                          return swotAnalysis && (
                          <Card className="overflow-hidden transition-all duration-200 hover:shadow-sm">
                            <CardHeaderWithActions
                              icon={<Target className="h-5 w-5 text-indigo-600" />}
                              title="SWOT Analysis"
                              cardId="swot-analysis"
                              onEdit={handleCardEdit}
                              onRefresh={handleCardRefresh}
                            />
                            <CardContent className="pt-5 pb-2">
                              <div className="space-y-4">
                                {swotAnalysis.strengths && swotAnalysis.strengths.length > 0 && (
                                  <div>
                                    <h3 className="text-sm font-semibold text-green-600 dark:text-green-400 mb-1">Strengths</h3>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                      {swotAnalysis.strengths.map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {swotAnalysis.weaknesses && swotAnalysis.weaknesses.length > 0 && (
                                  <div>
                                    <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Weaknesses</h3>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                      {swotAnalysis.weaknesses.map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {swotAnalysis.opportunities && swotAnalysis.opportunities.length > 0 && (
                                  <div>
                                    <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-1">Opportunities</h3>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                      {swotAnalysis.opportunities.map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                {swotAnalysis.threats && swotAnalysis.threats.length > 0 && (
                                  <div>
                                    <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400 mb-1">Threats</h3>
                                    <ul className="list-disc pl-5 text-sm space-y-1">
                                      {swotAnalysis.threats.map((item: string, i: number) => (
                                        <li key={i}>{item}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                        })()}
                        
                        {(() => {
                          const bankingOpportunities = getResearchData.getBankingOpportunities(client.research);
                          return bankingOpportunities.length > 0 && (
                          <Card className="overflow-hidden transition-all duration-200 hover:shadow-sm">
                            <CardHeaderWithActions
                              icon={<DollarSign className="h-5 w-5 text-indigo-600" />}
                              title="Banking Opportunities"
                              cardId="banking-opportunities"
                              onEdit={handleCardEdit}
                              onRefresh={handleCardRefresh}
                            />
                            <CardContent className="pt-5">
                              <ul className="space-y-3">
                                {bankingOpportunities.map((opportunity: any, i: number) => (
                                  <li key={i} className="pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                                    <div className="font-medium text-indigo-600">{opportunity.service}</div>
                                    <div className="text-sm mt-1">
                                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium 
                                        ${opportunity.urgency === 'high' ? 'bg-red-100 text-red-800' : 
                                          opportunity.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                          'bg-green-100 text-green-800'}`}>
                                        {opportunity.urgency.charAt(0).toUpperCase() + opportunity.urgency.slice(1)} priority
                                      </span>
                                    </div>
                                    <div className="text-sm mt-1">{opportunity.rationale}</div>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        );
                        })()}
                        
                        {(() => {
                          const recentDevelopments = getResearchData.getRecentDevelopments(client.research);
                          return recentDevelopments.length > 0 && (
                          <Card 
                            key="recent-developments"
                            className="overflow-hidden transition-all duration-200 hover:shadow-sm flex flex-col h-full"
                          >
                            <CardHeaderWithActions
                              icon={<Clock className="h-5 w-5 text-indigo-600" />}
                              title="Recent Developments"
                              cardId="recent-developments"
                              onEdit={handleCardEdit}
                              onRefresh={handleCardRefresh}
                            />
                            <CardContent className="pt-5 overflow-hidden flex-grow">
                              <div className="h-full overflow-y-auto pr-2 pb-4">
                                {recentDevelopments
                                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                  .slice(0, 5)
                                  .map((dev: any, i: number) => (
                                  <div key={i} className="border-l-2 border-indigo-500 pl-3 py-1 mb-3">
                                    <p className="text-sm text-gray-400">{dev.date || "Recent"}</p>
                                    <p className="font-medium">{dev.title}</p>
                                    <p className="text-sm mt-1">{dev.description}</p>
                                    {dev.url && (
                                      <a 
                                        href={dev.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs mt-1 text-indigo-600 hover:text-indigo-500 flex items-center"
                                      >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        Read source
                                      </a>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        );
                        })()}
                      </div>
                    </div>
                  </>
                ) : (
                  null
                )}
              </TabsContent>
              
              <TabsContent value="details">
                <div className="space-y-6">
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-3">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-indigo-600" />
                        <CardTitle>Company Details</CardTitle>
                      </div>
                      <CardDescription>Key information and profile</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {client.info ? (
                        <div className="space-y-6">
                          {/* Company Description */}
                          {client.info.description && (
                            <div>
                              <h3 className="font-medium mb-2">About</h3>
                              <p className="text-gray-700 dark:text-gray-300">{client.info.description}</p>
                            </div>
                          )}
                          
                          {/* Company Facts */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Industry */}
                            {client.info.industry && (
                              <div className="flex flex-col border border-gray-100 rounded-md p-3 hover:border-indigo-200 transition-colors">
                                <span className="text-xs text-gray-500">Industry</span>
                                <span className="font-medium text-gray-800">{client.info.industry}</span>
                              </div>
                            )}
                            
                            {/* Founded */}
                            {client.info.founded && (
                              <div className="flex flex-col border border-gray-100 rounded-md p-3 hover:border-indigo-200 transition-colors">
                                <span className="text-xs text-gray-500">Founded</span>
                                <span className="font-medium text-gray-800">{client.info.founded}</span>
                              </div>
                            )}
                            
                            {/* Headquarters */}
                            {client.info.headquarters && (
                              <div className="flex flex-col border border-gray-100 rounded-md p-3 hover:border-indigo-200 transition-colors">
                                <span className="text-xs text-gray-500">Headquarters</span>
                                <span className="font-medium text-gray-800">{client.info.headquarters}</span>
                              </div>
                            )}
                            
                            {/* Website */}
                            {client.website && (
                              <div className="flex flex-col border border-gray-100 rounded-md p-3 hover:border-indigo-200 transition-colors">
                                <span className="text-xs text-gray-500">Website</span>
                                <a 
                                  href={client.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                                >
                                  {client.website.replace(/^https?:\/\/(www\.)?/, "")}
                                  <ExternalLink className="ml-1 h-3 w-3" />
                                </a>
                              </div>
                            )}
                          </div>
                          
                          {/* Key Products & Services */}
                          {client.info.keyProducts && client.info.keyProducts.length > 0 && (
                            <div>
                              <h3 className="font-medium mb-2">Key Products & Services</h3>
                              <div className="flex flex-wrap gap-2">
                                {client.info.keyProducts.map((product: string, index: number) => (
                                  <Badge key={index} variant="outline" className="bg-gray-50">{product}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Competitors */}
                          {client.info.competitors && client.info.competitors.length > 0 && (
                            <div>
                              <h3 className="font-medium mb-2">Competitors</h3>
                              <div className="flex flex-wrap gap-2">
                                {client.info.competitors.map((competitor: string, index: number) => (
                                  <Badge key={index} variant="outline" className="bg-gray-50">{competitor}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Market Position */}
                          {client.info.marketPosition && (
                            <div>
                              <h3 className="font-medium mb-2">Market Position</h3>
                              <p className="text-gray-700 dark:text-gray-300">{client.info.marketPosition}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500 dark:text-gray-400">
                            No company details available. Edit client to add details.
                          </p>
                          <Button 
                            className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 text-white"
                            onClick={() => router.push(`/clients/${clientId}/edit`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Client Details
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="financial">
                <div className="space-y-6">
                  {client.research && getResearchData.hasResearchData(client.research) ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Financial Overview Card */}
                        <Card className="overflow-hidden md:col-span-2 transition-all duration-200 hover:shadow-sm">
                          <CardHeaderWithActions
                            icon={<DollarSign className="h-5 w-5 text-indigo-600" />}
                            title="Financial Overview"
                            cardId="financial-overview"
                            onEdit={handleCardEdit}
                            onRefresh={handleCardRefresh}
                          />
                          <CardContent className="pt-6">
                            {(() => {
                              const financialData = getResearchData.getFinancialData(client.research);
                              
                              return (
                                <>
                                  <div>
                                    <p className="text-gray-700 dark:text-gray-300">{financialData.overview || "No financial overview available"}</p>
                                  </div>
                                </>
                              );
                            })()}
                          </CardContent>
                        </Card>

                        {/* Key Financial Metrics Card */}
                        <Card className="overflow-hidden transition-all duration-200 hover:shadow-sm">
                          <CardHeaderWithActions
                            icon={<ChartPieIcon className="h-5 w-5 text-indigo-600" />}
                            title="Key Metrics"
                            cardId="key-metrics"
                            onEdit={handleCardEdit}
                            onRefresh={handleCardRefresh}
                          />
                          <CardContent className="pt-5">
                            {(() => {
                              const financialData = getResearchData.getFinancialData(client.research);
                              const metrics = financialData.metrics || {};
                              
                              return Object.keys(metrics).length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                  {Object.entries(metrics).map(([key, value], index) => (
                                    <div key={index} className="flex flex-col border border-gray-100 rounded-md p-3 hover:border-indigo-200 transition-colors">
                                      <span className="text-xs text-gray-500">{key}</span>
                                      <span className="font-medium text-gray-800">{value as string}</span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-gray-500">No financial metrics available</p>
                              );
                            })()}
                          </CardContent>
                        </Card>
                        
                        {/* Financial Developments Card */}
                        {(() => {
                          const recentDevelopments = getResearchData.getRecentDevelopments(client.research);
                          const financialDevelopments = recentDevelopments.filter((dev: any) => 
                            dev.title?.toLowerCase().includes("financial") || 
                            dev.title?.toLowerCase().includes("earnings") ||
                            dev.title?.toLowerCase().includes("revenue") ||
                            dev.title?.toLowerCase().includes("profit") ||
                            dev.description?.toLowerCase().includes("financial") || 
                            dev.description?.toLowerCase().includes("earnings") ||
                            dev.description?.toLowerCase().includes("revenue") ||
                            dev.description?.toLowerCase().includes("profit")
                          );
                          
                          return financialDevelopments.length > 0 && (
                          <Card className="overflow-hidden transition-all duration-200 hover:shadow-sm">
                            <CardHeaderWithActions
                              icon={<Clock className="h-5 w-5 text-indigo-600" />}
                              title="Financial Developments"
                              cardId="financial-developments"
                              onEdit={handleCardEdit}
                              onRefresh={handleCardRefresh}
                            />
                            <CardContent className="pt-5">
                              <div className="space-y-3 max-h-72 overflow-y-auto pr-2">
                                {financialDevelopments
                                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                  .map((dev: any, index: number) => (
                                    <div key={index} className="border-l-2 border-indigo-500 pl-3 py-1 hover:bg-gray-50 transition-colors">
                                      <p className="text-sm text-gray-400">{dev.date || "Recent"}</p>
                                      <p className="font-medium">{dev.title}</p>
                                      <p className="text-sm mt-1">{dev.description}</p>
                                    </div>
                                  ))}
                              </div>
                            </CardContent>
                          </Card>
                        );
                        })()}
                      </div>
                    </>
                  ) : (
                    <Card className="overflow-hidden">
                      <CardHeaderWithActions
                        icon={<DollarSign className="h-5 w-5 text-indigo-600" />}
                        title="Financial Information"
                        cardId="financial-information"
                        onEdit={handleCardEdit}
                        onRefresh={handleCardRefresh}
                      />
                      <CardContent className="pt-6">
                        <div className="text-center py-6">
                          <p className="text-gray-500 dark:text-gray-400">
                            Run research to see financial information
                          </p>
                          <Button 
                            className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 text-white"
                            onClick={startResearch}
                            disabled={researchLoading}
                          >
                            {researchLoading ? "Research in Progress..." : "Run Research"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="executives">
                {client.research && getResearchData.hasResearchData(client.research) ? (
                  (() => {
                    const executiveData = getResearchData.getExecutiveData(client.research);
                    return executiveData.length > 0 ? (
                  <div className="space-y-6">
                    <Card className="overflow-hidden mb-6">
                      <CardHeaderWithActions
                        icon={<Users className="h-5 w-5 text-indigo-600" />}
                        title="Executive Team"
                        cardId="executive-team"
                        onEdit={handleCardEdit}
                        onRefresh={handleCardRefresh}
                      />
                    </Card>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {executiveData.map((person: any, index: number) => (
                        <Card key={index} className="border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-200 hover:shadow-sm">
                          <CardHeader className="p-4 pb-3 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-base">{person.name}</h3>
                                <p className="text-sm text-blue-600 dark:text-blue-400">{person.title || person.role}</p>
                              </div>
                              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                <UserCircle className="h-6 w-6 text-indigo-600" />
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="p-4 pt-3 space-y-2 text-sm">
                            {person.background && person.background !== "Unknown" && (
                              <div>
                                <strong className="text-xs text-gray-500">Background:</strong>
                                <p className="text-gray-700 dark:text-gray-300">{person.background}</p>
                              </div>
                            )}
                            {person.responsibilities && (
                              <div>
                                <strong className="text-xs text-gray-500">Responsibilities:</strong>
                                <p className="text-gray-700 dark:text-gray-300">{person.responsibilities}</p>
                              </div>
                            )}
                            {person.roleInFinancialDecisions && (
                              <div>
                                <strong className="text-xs text-gray-500">Role in Financial Decisions:</strong>
                                <p className="text-gray-700 dark:text-gray-300">{person.roleInFinancialDecisions}</p>
                              </div>
                            )}
                            {person.insightsForEngagement && person.insightsForEngagement !== "Unknown" && (
                              <div>
                                <strong className="text-xs text-gray-500">Engagement Insights:</strong>
                                <p className="text-gray-700 dark:text-gray-300">{person.insightsForEngagement}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                    ) : (
                      <Card className="overflow-hidden">
                        <CardHeaderWithActions
                          icon={<Users className="h-5 w-5 text-indigo-600" />}
                          title="Key Decision Makers"
                          cardId="key-decision-makers"
                          onEdit={handleCardEdit}
                          onRefresh={handleCardRefresh}
                        />
                        <CardContent className="pt-6">
                          <div className="text-center py-6">
                            <p className="text-gray-500 dark:text-gray-400">
                              Run research to see executive information
                            </p>
                            <Button 
                              className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 text-white"
                              onClick={startResearch}
                              disabled={researchLoading}
                            >
                              {researchLoading ? "Research in Progress..." : "Run Research"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })()
                ) : (
                  <Card className="overflow-hidden">
                    <CardHeaderWithActions
                      icon={<Users className="h-5 w-5 text-indigo-600" />}
                      title="Key Decision Makers"
                      cardId="key-decision-makers"
                      onEdit={handleCardEdit}
                      onRefresh={handleCardRefresh}
                    />
                    <CardContent className="pt-6">
                      <div className="text-center py-6">
                        <p className="text-gray-500 dark:text-gray-400">
                          Run research to see executive information
                        </p>
                        <Button 
                          className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 text-white"
                          onClick={startResearch}
                          disabled={researchLoading}
                        >
                          {researchLoading ? "Research in Progress..." : "Run Research"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="executives">
                <div className="space-y-6">
                  {client.research && getResearchData.hasResearchData(client.research) ? (
                    <>
                      {/* Executive Team Overview */}
                      <Card className="overflow-hidden">
                        <CardHeaderWithActions
                          icon={<Users className="h-5 w-5 text-indigo-600" />}
                          title="Executive Team"
                          cardId="executive-team"
                          onEdit={handleCardEdit}
                          onRefresh={handleCardRefresh}
                        />
                        <CardContent className="pt-6">
                          {(() => {
                            const executiveData = client.research?.executiveData || [];
                            const enhancedData = client.research?.enhancedExecutiveData || null;
                            
                            if (enhancedData?.executiveTeam && enhancedData.executiveTeam.length > 0) {
                              return (
                                <div className="space-y-6">
                                  {enhancedData.executiveTeam.map((exec: any, index: number) => (
                                    <div key={index} className="border border-gray-100 rounded-lg p-4 hover:border-indigo-200 transition-colors">
                                      <div className="flex items-start justify-between mb-3">
                                        <div>
                                          <h3 className="font-semibold text-lg text-gray-900">{exec.name}</h3>
                                          <p className="text-indigo-600 font-medium">{exec.title}</p>
                                          {exec.tenure?.yearsInRole && (
                                            <p className="text-sm text-gray-500">
                                              {exec.tenure.yearsInRole} years in role
                                            </p>
                                          )}
                                        </div>
                                        {exec.executiveCompensation?.totalCompensation && (
                                          <div className="text-right">
                                            <p className="text-sm text-gray-500">Total Compensation</p>
                                            <p className="font-semibold">{exec.executiveCompensation.totalCompensation}</p>
                                          </div>
                                        )}
                                      </div>
                                      
                                      {exec.background && (
                                        <p className="text-gray-700 mb-3">{exec.background}</p>
                                      )}
                                      
                                      {exec.roleInFinancialDecisions && (
                                        <div className="mb-3">
                                          <h4 className="font-medium text-sm text-gray-900 mb-1">Role in Financial Decisions</h4>
                                          <p className="text-sm text-gray-600">{exec.roleInFinancialDecisions}</p>
                                        </div>
                                      )}
                                      
                                      {exec.insightsForEngagement && (
                                        <div className="mb-3">
                                          <h4 className="font-medium text-sm text-gray-900 mb-1">Engagement Insights</h4>
                                          <p className="text-sm text-gray-600">{exec.insightsForEngagement}</p>
                                        </div>
                                      )}
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        {/* Education */}
                                        {exec.education && exec.education.length > 0 && (
                                          <div>
                                            <h4 className="font-medium text-sm text-gray-900 mb-2">Education</h4>
                                            <div className="space-y-1">
                                              {exec.education.map((edu: any, eduIndex: number) => (
                                                <p key={eduIndex} className="text-sm text-gray-600">
                                                  {edu.degree} - {edu.institution} {edu.year && `(${edu.year})`}
                                                </p>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Previous Roles */}
                                        {exec.tenure?.previousRoles && exec.tenure.previousRoles.length > 0 && (
                                          <div>
                                            <h4 className="font-medium text-sm text-gray-900 mb-2">Previous Experience</h4>
                                            <div className="space-y-1">
                                              {exec.tenure.previousRoles.slice(0, 3).map((role: any, roleIndex: number) => (
                                                <p key={roleIndex} className="text-sm text-gray-600">
                                                  {role.role} at {role.company} ({role.duration})
                                                </p>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Board Memberships */}
                                        {exec.boardMemberships && exec.boardMemberships.length > 0 && (
                                          <div>
                                            <h4 className="font-medium text-sm text-gray-900 mb-2">Board Memberships</h4>
                                            <div className="space-y-1">
                                              {exec.boardMemberships.slice(0, 3).map((board: any, boardIndex: number) => (
                                                <p key={boardIndex} className="text-sm text-gray-600">
                                                  {board.role} at {board.company}
                                                </p>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        {/* Strategic Priorities */}
                                        {exec.strategicPriorities && exec.strategicPriorities.length > 0 && (
                                          <div>
                                            <h4 className="font-medium text-sm text-gray-900 mb-2">Strategic Priorities</h4>
                                            <div className="flex flex-wrap gap-1">
                                              {exec.strategicPriorities.slice(0, 4).map((priority: string, priIndex: number) => (
                                                <Badge key={priIndex} variant="outline" className="text-xs">
                                                  {priority}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            } else if (executiveData && executiveData.length > 0) {
                              // Fallback to basic executive data
                              return (
                                <div className="space-y-4">
                                  {executiveData.map((exec: any, index: number) => (
                                    <div key={index} className="border border-gray-100 rounded-lg p-4">
                                      <h3 className="font-semibold text-lg text-gray-900">{exec.name}</h3>
                                      <p className="text-indigo-600 font-medium">{exec.title || exec.role}</p>
                                      {exec.background && <p className="text-gray-700 mt-2">{exec.background}</p>}
                                    </div>
                                  ))}
                                </div>
                              );
                            } else {
                              return (
                                <div className="text-center py-6">
                                  <p className="text-gray-500">No executive data available</p>
                                </div>
                              );
                            }
                          })()}
                        </CardContent>
                      </Card>
                      
                      {/* Board Composition */}
                      {(() => {
                        const enhancedData = client.research?.enhancedExecutiveData;
                        const boardComposition = enhancedData?.boardComposition;
                        
                        return boardComposition && (boardComposition.boardMembers?.length > 0 || boardComposition.boardStructure) && (
                          <Card className="overflow-hidden">
                            <CardHeaderWithActions
                              icon={<Target className="h-5 w-5 text-indigo-600" />}
                              title="Board of Directors"
                              cardId="board-composition"
                              onEdit={handleCardEdit}
                              onRefresh={handleCardRefresh}
                            />
                            <CardContent className="pt-6">
                              {boardComposition.boardStructure && (
                                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-indigo-600">{boardComposition.boardStructure.totalMembers || 'N/A'}</p>
                                    <p className="text-sm text-gray-600">Total Members</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-green-600">{boardComposition.boardStructure.independentMembers || 'N/A'}</p>
                                    <p className="text-sm text-gray-600">Independent</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-2xl font-bold text-blue-600">{boardComposition.boardStructure.executiveMembers || 'N/A'}</p>
                                    <p className="text-sm text-gray-600">Executive</p>
                                  </div>
                                </div>
                              )}
                              
                              {boardComposition.boardMembers && boardComposition.boardMembers.length > 0 && (
                                <div className="space-y-4">
                                  <h4 className="font-medium text-gray-900">Board Members</h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {boardComposition.boardMembers.map((member: any, index: number) => (
                                      <div key={index} className="border border-gray-100 rounded-lg p-3">
                                        <div className="flex justify-between items-start mb-2">
                                          <div>
                                            <h5 className="font-semibold">{member.name}</h5>
                                            <p className="text-sm text-indigo-600">{member.role}</p>
                                          </div>
                                          <Badge 
                                            variant={member.independence === 'Independent' ? 'default' : 'secondary'}
                                            className="text-xs"
                                          >
                                            {member.independence}
                                          </Badge>
                                        </div>
                                        {member.background && (
                                          <p className="text-sm text-gray-600 mb-2">{member.background}</p>
                                        )}
                                        {member.committees && member.committees.length > 0 && (
                                          <div>
                                            <p className="text-xs text-gray-500 mb-1">Committees:</p>
                                            <div className="flex flex-wrap gap-1">
                                              {member.committees.map((committee: string, comIndex: number) => (
                                                <Badge key={comIndex} variant="outline" className="text-xs">
                                                  {committee}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })()}
                      
                      {/* Organizational Structure */}
                      {(() => {
                        const enhancedData = client.research?.enhancedExecutiveData;
                        const orgStructure = enhancedData?.organizationalStructure;
                        
                        return orgStructure && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Treasury Team */}
                            {orgStructure.treasuryTeam && (
                              <Card className="overflow-hidden">
                                <CardHeaderWithActions
                                  icon={<DollarSign className="h-5 w-5 text-indigo-600" />}
                                  title="Treasury Team"
                                  cardId="treasury-team"
                                  onEdit={handleCardEdit}
                                  onRefresh={handleCardRefresh}
                                />
                                <CardContent className="pt-5">
                                  {orgStructure.treasuryTeam.structure && (
                                    <p className="text-gray-700 mb-4">{orgStructure.treasuryTeam.structure}</p>
                                  )}
                                  
                                  {orgStructure.treasuryTeam.keyRoles && orgStructure.treasuryTeam.keyRoles.length > 0 && (
                                    <div className="space-y-3">
                                      <h4 className="font-medium text-sm text-gray-900">Key Roles</h4>
                                      {orgStructure.treasuryTeam.keyRoles.map((role: any, index: number) => (
                                        <div key={index} className="border-l-2 border-indigo-500 pl-3">
                                          <p className="font-medium text-sm">{role.role}</p>
                                          <p className="text-xs text-gray-600">{role.responsibilities}</p>
                                          {role.decisionAuthority && (
                                            <p className="text-xs text-indigo-600 font-medium">
                                              Authority: {role.decisionAuthority}
                                            </p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                            
                            {/* Decision Making Process */}
                            {(enhancedData?.decisionMakingProcess || client.research?.decisionMakingProcess) && (
                              <Card className="overflow-hidden">
                                <CardHeaderWithActions
                                  icon={<Target className="h-5 w-5 text-indigo-600" />}
                                  title="Decision Making Process"
                                  cardId="decision-making-process"
                                  onEdit={handleCardEdit}
                                  onRefresh={handleCardRefresh}
                                />
                                <CardContent className="pt-5">
                                  {enhancedData?.decisionMakingProcess ? (
                                    <div className="space-y-4">
                                      {enhancedData.decisionMakingProcess.financialDecisions && (
                                        <div>
                                          <h4 className="font-medium text-sm text-gray-900 mb-1">Financial Decisions</h4>
                                          <p className="text-sm text-gray-600">{enhancedData.decisionMakingProcess.financialDecisions}</p>
                                        </div>
                                      )}
                                      {enhancedData.decisionMakingProcess.bankingDecisions && (
                                        <div>
                                          <h4 className="font-medium text-sm text-gray-900 mb-1">Banking Decisions</h4>
                                          <p className="text-sm text-gray-600">{enhancedData.decisionMakingProcess.bankingDecisions}</p>
                                        </div>
                                      )}
                                      {enhancedData.decisionMakingProcess.strategicDecisions && (
                                        <div>
                                          <h4 className="font-medium text-sm text-gray-900 mb-1">Strategic Decisions</h4>
                                          <p className="text-sm text-gray-600">{enhancedData.decisionMakingProcess.strategicDecisions}</p>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-gray-700">{client.research?.decisionMakingProcess}</p>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        );
                      })()}
                      
                      {/* Engagement Strategy */}
                      {(() => {
                        const enhancedData = client.research?.enhancedExecutiveData;
                        const engagementStrategy = enhancedData?.engagementStrategy;
                        
                        return engagementStrategy && (
                          <Card className="overflow-hidden">
                            <CardHeaderWithActions
                              icon={<Users className="h-5 w-5 text-indigo-600" />}
                              title="Engagement Strategy"
                              cardId="engagement-strategy"
                              onEdit={handleCardEdit}
                              onRefresh={handleCardRefresh}
                            />
                            <CardContent className="pt-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {engagementStrategy.primaryContacts && engagementStrategy.primaryContacts.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-900 mb-2">Primary Contacts</h4>
                                    <div className="space-y-1">
                                      {engagementStrategy.primaryContacts.map((contact: string, index: number) => (
                                        <p key={index} className="text-sm text-gray-600">• {contact}</p>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {engagementStrategy.communicationPreferences && (
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-900 mb-2">Communication Style</h4>
                                    <p className="text-sm text-gray-600">{engagementStrategy.communicationPreferences}</p>
                                  </div>
                                )}
                                
                                {engagementStrategy.decisionTimelines && (
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-900 mb-2">Decision Timelines</h4>
                                    <p className="text-sm text-gray-600">{engagementStrategy.decisionTimelines}</p>
                                  </div>
                                )}
                                
                                {engagementStrategy.influencers && engagementStrategy.influencers.length > 0 && (
                                  <div>
                                    <h4 className="font-medium text-sm text-gray-900 mb-2">Key Influencers</h4>
                                    <div className="space-y-1">
                                      {engagementStrategy.influencers.map((influencer: string, index: number) => (
                                        <p key={index} className="text-sm text-gray-600">• {influencer}</p>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })()}
                    </>
                  ) : (
                    <Card className="overflow-hidden">
                      <CardHeaderWithActions
                        icon={<Users className="h-5 w-5 text-indigo-600" />}
                        title="Executive Information"
                        cardId="executive-information"
                        onEdit={handleCardEdit}
                        onRefresh={handleCardRefresh}
                      />
                      <CardContent className="pt-6">
                        <div className="text-center py-6">
                          <p className="text-gray-500 dark:text-gray-400">
                            Run research to see comprehensive executive and organizational information
                          </p>
                          <Button 
                            className="mt-4 bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 text-white"
                            onClick={startResearch}
                            disabled={researchLoading}
                          >
                            {researchLoading ? "Research in Progress..." : "Run Research"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Action sidebar - minimal elegant style */}
          <div className="xl:col-span-1">
            {/* Add research status card at the top of the sidebar */}
            {client.profileStatus && (
              <Card className="bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md shadow-sm border border-[#e0e0e5]/50 dark:border-[#222222] rounded-md overflow-hidden sticky top-24 mb-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Research Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`absolute top-0 left-0 h-full rounded-full ${
                        client?.profileStatus === "complete" 
                          ? "bg-green-500" 
                          : client?.profileStatus === "error"
                          ? "bg-red-500"
                          : client?.profileStatus === "researching"
                          ? "bg-amber-500" 
                          : "bg-slate-400"
                      }`}
                      style={{ 
                        width: client?.profileStatus === "complete" 
                          ? "100%" 
                          : client?.profileStatus === "researching" 
                          ? "60%" 
                          : "10%" 
                      }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <div className="font-medium">
                      {client?.profileStatus === "complete" && (
                        <span className="text-green-600 flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </span>
                      )}
                      {client?.profileStatus === "researching" && (
                        <span className="text-amber-600 flex items-center">
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          In Progress
                        </span>
                      )}
                      {client?.profileStatus === "error" && (
                        <span className="text-red-600 flex items-center">
                          <XCircle className="h-3 w-3 mr-1" />
                          Error
                        </span>
                      )}
                      {(!client?.profileStatus || client?.profileStatus === "initial") && (
                        <span className="text-slate-600 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Not Started
                        </span>
                      )}
                    </div>
                    {client?.lastResearchCompleteTime && (
                      <span className="text-slate-500">
                        {(() => {
                          try {
                            // Check if it's a Firestore timestamp object
                            if (client.lastResearchCompleteTime && 
                                typeof client.lastResearchCompleteTime === 'object' && 
                                'toDate' in client.lastResearchCompleteTime) {
                              return format(client.lastResearchCompleteTime.toDate(), "MMM d, yyyy");
                            }
                            // If it's a date string or timestamp number
                            const date = new Date(client.lastResearchCompleteTime);
                            if (!isNaN(date.getTime())) {
                              return format(date, "MMM d, yyyy");
                            }
                            return "recently";
                          } catch (e) {
                            console.error("Date formatting error:", e);
                            return "recently";
                          }
                        })()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white/95 dark:bg-[#161616]/95 backdrop-blur-md shadow-sm border border-[#e0e0e5]/50 dark:border-[#222222] rounded-md overflow-hidden sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-medium">Actions</CardTitle>
                <CardDescription>Manage this client</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={() => setShowResearchConfirm(true)}
                  >
                    <Beaker className="h-4 w-4 mr-2" />
                    Generate Research
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Client Details
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <CalendarPlus className="h-4 w-4 mr-2" />
                    Schedule Meeting
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <UserCircle className="h-4 w-4 mr-2" />
                    Assign Relationship Manager
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <DollarSign className="h-4 w-4 mr-2" />
                    View Opportunities
                  </Button>
                </div>

                <div className="pt-4 border-t border-[#e0e0e5]/70 dark:border-[#222222]">
                  <h3 className="text-sm font-medium mb-3">Quick Access</h3>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="#"
                        className="text-sm flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      >
                        <FileText className="h-4 w-4 mr-2 text-slate-400" />
                        Latest Financial Report
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-sm flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      >
                        <FileSignature className="h-4 w-4 mr-2 text-slate-400" />
                        Meeting Notes
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="text-sm flex items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                      >
                        <Briefcase className="h-4 w-4 mr-2 text-slate-400" />
                        Portfolio Overview
                      </a>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Add the ResearchProgressModal */}
      <ResearchProgressModal
        isOpen={showResearchProgress}
        steps={researchSteps}
        error={researchError}
        onClose={() => !researchLoading && setShowResearchProgress(false)}
        onRetry={() => {
          setResearchError(undefined);
          startResearch();
        }}
      />
      
      {/* Add the EditCardModal */}
      <EditCardModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        cardId={currentEditCard.id}
        cardTitle={currentEditCard.title}
        content={currentEditCard.content}
        onSave={saveCardContent}
      />
    </div>
  );
}

export default function ClientProfile() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientProfileContent />
    </Suspense>
  );
}
