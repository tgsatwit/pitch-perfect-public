"use client";

import React, { useState, useEffect, ChangeEvent, useRef, useCallback, Suspense } from 'react';
import dynamicImport from "next/dynamic";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  PlusCircle, 
  Loader2, 
  AlertCircle, 
  Globe, 
  FileUp,
  Target,
  User,
  Clock,
  Save,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  DollarSign,
  Users,
  RefreshCw,
  Info,
  Plus,
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Check,
  Wand2,
  X,
  Pencil,
  Bold,
  Italic,
  List,
  Heading2,
  Eye,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight
} from "lucide-react";
import { addDoc, collection, getDocs, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore";
import { db, app } from "@/lib/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Canvas } from "@/components/canvas";
import { useGraphContext } from "@/contexts/GraphContext";
import { useThreadContext } from "@/contexts/ThreadProvider";
import { useQueryState } from "nuqs";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useUserContext } from "@/contexts/UserContext";
import { generateOutlineServerAction, generateSlidesServerAction } from "./actions";
import { AIMessage } from "@langchain/core/messages";
import { ArtifactMarkdownV3 } from "@opencanvas/shared/types";
import { pitchStagesService, slideStructuresService } from "@/services/settingsService";
import type { PitchStage, SlideStructure } from "@/types/settings";
import type { SlideGenerationInput, PitchContextData } from '../../../../../agents/src/slide-generation/types';
import { AISlideContent } from '@/components/presentation/services/PresentationAIService';
import { getFirestore } from "firebase/firestore";
import { SlideType } from '@/components/presentation/types';

// Import extracted utilities and types
import type { WorkflowStepId, PitchDocumentData, FirebaseDoc } from '@/types/pitch';
import { sanitizeForServer, parseOutlineToSlideOutlines } from '@/lib/pitch';
import { DataSourceCard } from '@/components/pitch/data-sources';

// Initialize Firebase Storage
const storage = getStorage(app);


// --- Pitch Framing Form Component ---
interface PitchFramingFormProps {
  onPitchCreated: (firestoreId: string, langGraphThreadId: string) => void;
  createdPitchId?: string | null;
  setActiveStep: (stepId: WorkflowStepId) => void;
  loadedPitchData?: PitchDocumentData | null;
  refreshPitchData: () => void;
  activeStepId?: WorkflowStepId;
  onThreadIdUpdate?: (threadId: string) => void;
  pitchStages?: PitchStage[];
}

const PitchFramingForm = ({
  onPitchCreated,
  createdPitchId,
  setActiveStep,
  loadedPitchData,
  refreshPitchData,
  activeStepId,
  onThreadIdUpdate,
  pitchStages = []
}: PitchFramingFormProps) => {
  const threadData = useThreadContext();
  const [clients, setClients] = useState<FirebaseDoc[]>([]);
  const [competitors, setCompetitors] = useState<FirebaseDoc[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [competitorsLoading, setCompetitorsLoading] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);
  const [competitorsError, setCompetitorsError] = useState<string | null>(null);

  // Remove the derivedMiniStep state as we'll use the main workflow steps instead
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedClientName, setSelectedClientName] = useState<string>("");
  const [pitchStage, setPitchStage] = useState<string>("");
  const [knownCompetitors, setKnownCompetitors] = useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = useState("");
  const [selectedCompetitorsFromList, setSelectedCompetitorsFromList] = useState<Record<string, boolean>>({});
  const [sentiment, setSentiment] = useState([50]);
  const [importantClientInfo, setImportantClientInfo] = useState("");
  const [importantToClient, setImportantToClient] = useState("");
  const [ourAdvantages, setOurAdvantages] = useState("");
  const [competitorStrengths, setCompetitorStrengths] = useState("");
  const [pitchFocus, setPitchFocus] = useState("");
  const [relevantCaseStudies, setRelevantCaseStudies] = useState("");
  const [keyMetrics, setKeyMetrics] = useState("");
  const [implementationTimeline, setImplementationTimeline] = useState("");
  const [expectedROI, setExpectedROI] = useState("");
  const [filesToUpload, setFilesToUpload] = useState<FileList | null>(null);
  const [clientDetailedData, setClientDetailedData] = useState<any>(null);
  const [competitorDetailedData, setCompetitorDetailedData] = useState<Record<string, any>>({});
  const [ignoreSections, setIgnoreSections] = useState<{
    clientInfo?: boolean;
    competitive?: boolean;
    focus?: boolean;
    advanced?: boolean;
  }>({
    clientInfo: true,
    competitive: true,
    focus: true,
    advanced: true,
  });
  const [dataSourcesSelected, setDataSourcesSelected] = useState<Record<string, boolean>>({
    'external-client-data': true,
    'internal-client-data': true,
    'competitor-data': true,
    'market-analysis': true,
    'additional-documents': false,
  });
  const [subDataSourceChecks, setSubDataSourceChecks] = useState<Record<string, boolean>>({
      'ds-ext-news': true,
      'ds-ext-filings': true,
      'ds-ext-website': true,
      'ds-int-rm-notes': true,
      'ds-int-past-deals': true,
      'ds-int-risk': true,
      'ds-comp-profiles': true,
      'ds-comp-analysis': true,
      'ds-market-reports': true,
      'ds-market-trends': true,
  });
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // --- Effect to initialize form state from loaded data --- 
  useEffect(() => {
    if (loadedPitchData) {
      console.log("PitchFramingForm: Loading data into form state", loadedPitchData);
      setSelectedClientId(loadedPitchData.clientId || "");
      setSelectedClientName(loadedPitchData.clientName || "");
      setPitchStage(loadedPitchData.pitchStage || "");
      
      // Separate manually added competitors from list selections
      const listComps: Record<string, boolean> = {};
      const manualComps: string[] = [];
      Object.entries(loadedPitchData.competitorsSelected || {}).forEach(([key, value]) => {
        if (value) { // Only consider selected competitors
          if (key.startsWith('manual-')) {
            manualComps.push(key.substring(7));
          } else {
            listComps[key] = true;
          }
        }
      });
      setSelectedCompetitorsFromList(listComps);
      setKnownCompetitors(manualComps);

      // Load additional context fields
      const ctx = loadedPitchData.additionalContext || {};
      setImportantClientInfo(ctx.importantClientInfo || "");
      setImportantToClient(ctx.importantToClient || "");
      setSentiment([ctx.clientSentiment ?? 50]);
      setOurAdvantages(ctx.ourAdvantages || "");
      setCompetitorStrengths(ctx.competitorStrengths || "");
      setPitchFocus(ctx.pitchFocus || "");
      setRelevantCaseStudies(ctx.relevantCaseStudies || "");
      setKeyMetrics(ctx.keyMetrics || "");
      setImplementationTimeline(ctx.implementationTimeline || "");
      setExpectedROI(ctx.expectedROI || "");
      
      // Load ignored sections if available
      if (ctx.ignoredSections && Array.isArray(ctx.ignoredSections)) {
        const ignoredSectionsObj: Record<string, boolean> = {};
        ctx.ignoredSections.forEach((section: string) => {
          ignoredSectionsObj[section] = true;
        });
        setIgnoreSections(ignoredSectionsObj);
      }
      
      // Load research data if available
      if (loadedPitchData.researchData) {
        setClientDetailedData(loadedPitchData.researchData.clientDetails || null);
        setCompetitorDetailedData(loadedPitchData.researchData.competitorDetails || {});
      }

      // Load data source selections (if they exist in the loaded data)
      if (loadedPitchData.dataSourcesSelected && Object.keys(loadedPitchData.dataSourcesSelected).length > 0) {
        setDataSourcesSelected(loadedPitchData.dataSourcesSelected);
      }
      if (loadedPitchData.subDataSourcesSelected && loadedPitchData.subDataSourcesSelected.length > 0) {
        const initialSubChecks: Record<string, boolean> = {};
        // Initialize all known sub-sources to false first
        Object.keys(subDataSourceChecks).forEach(key => { initialSubChecks[key] = false; });
        // Then set the ones from loaded data to true
        loadedPitchData.subDataSourcesSelected.forEach(key => { initialSubChecks[key] = true; });
        setSubDataSourceChecks(initialSubChecks);
      }
      
      // Note: We don't typically reload the filesToUpload state from loaded data
      // as it represents files selected *in the current browser session* for upload.
      // Displaying previously uploaded files might be a separate UI feature.
    }
  }, [loadedPitchData]); // Run when loadedPitchData changes

  useEffect(() => {
    const fetchClients = async () => {
      setClientsLoading(true);
      setClientsError(null);
      try {
        const clientsCollection = collection(db, "clients");
        const clientsSnapshot = await getDocs(clientsCollection);
        const clientsList = clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || `Unnamed Client ${doc.id.substring(0, 4)}`,
        }));
        setClients(clientsList);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setClientsError("Failed to load clients.");
      } finally {
        setClientsLoading(false);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchCompetitors = async () => {
      setCompetitorsLoading(true);
      setCompetitorsError(null);
      try {
        const competitorsCollection = collection(db, "competitors");
        const competitorsSnapshot = await getDocs(competitorsCollection);
        const competitorsList = competitorsSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || `Unnamed Competitor ${doc.id.substring(0, 4)}`,
        }));
        setCompetitors(competitorsList);
      } catch (error) {
        console.error("Error fetching competitors:", error);
        setCompetitorsError("Failed to load competitors.");
      } finally {
        setCompetitorsLoading(false);
      }
    };
    fetchCompetitors();
  }, []);



  const handleAddCompetitor = () => {
    if (newCompetitor.trim() && !knownCompetitors.includes(newCompetitor.trim())) {
      setKnownCompetitors([...knownCompetitors, newCompetitor.trim()]);
      setNewCompetitor("");
    }
  };
  
  const handleCompetitorCheckboxChange = async (competitorId: string, checked: boolean) => {
    setSelectedCompetitorsFromList(prev => ({ ...prev, [competitorId]: checked }));
    
    // If selected, fetch detailed competitor information
    if (checked) {
      try {
        const competitorDocRef = doc(db, "competitors", competitorId);
        const competitorDocSnap = await getDoc(competitorDocRef);
        if (competitorDocSnap.exists()) {
          const competitorData = competitorDocSnap.data();
          console.log("Fetched detailed competitor data:", competitorData);
          // Store the detailed competitor data
          setCompetitorDetailedData(prev => ({
            ...prev,
            [competitorId]: competitorData
          }));
        }
      } catch (error) {
        console.error("Error fetching detailed competitor data:", error);
      }
    } else {
      // Remove from detailed data if unselected
      setCompetitorDetailedData(prev => {
        const newData = { ...prev };
        delete newData[competitorId];
        return newData;
      });
    }
  };

  const handleClientChange = async (value: string) => {
    setSelectedClientId(value);
    const client = clients.find(c => c.id === value);
    setSelectedClientName(client?.name || "UnknownClient");
    
    // Fetch detailed client information
    if (value) {
      try {
        const clientDocRef = doc(db, "clients", value);
        const clientDocSnap = await getDoc(clientDocRef);
        if (clientDocSnap.exists()) {
          const clientData = clientDocSnap.data();
          console.log("Fetched detailed client data:", clientData);
          // Store the detailed client data
          setClientDetailedData(clientData);
        }
      } catch (error) {
        console.error("Error fetching detailed client data:", error);
      }
    }
  };
  
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFilesToUpload(event.target.files);
    }
  };

  const handleDataSourceCategoryToggle = (categoryId: string, isChecked: boolean) => {
    setDataSourcesSelected(prev => ({ ...prev, [categoryId]: isChecked }));
    
    // Open modal when additional-documents is selected
    if (categoryId === 'additional-documents' && isChecked) {
      setUploadModalOpen(true);
    }
  };

  const handleSubDataSourceCheckChange = (subSourceId: string, checked: boolean) => {
      setSubDataSourceChecks(prev => ({ ...prev, [subSourceId]: checked }));
  };

  const getSentimentLabel = (value: number) => {
    if (value <= 20) return "Cynic";
    if (value <= 40) return "Skeptic";
    if (value <= 60) return "Neutral";
    if (value <= 80) return "Optimist";
    return "Advocate";
  };

  const handleCreatePitch = async () => {
    if (!selectedClientId || !pitchStage) {
      setSaveError("Please select a client and pitch stage.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const combinedCompetitors = {
        ...selectedCompetitorsFromList,
        ...Object.fromEntries(knownCompetitors.map(name => [`manual-${name}`, true]))
    };

    const pitchData = {
      clientId: selectedClientId,
      clientName: selectedClientName,
      pitchStage: pitchStage,
      competitorsSelected: combinedCompetitors,
      status: 'framing',
      createdAt: serverTimestamp(),
      dataSourcesSelected: {},
      uploadedFiles: [],
      additionalContext: {},
      langGraphThreadId: null,
      // Add detailed client and competitor data
      researchData: {
        clientDetails: clientDetailedData,
        competitorDetails: competitorDetailedData
      }
    };

    let firestoreDocId: string | null = null;
    let newLangGraphThreadId: string | null = null;

    try {
      const pitchesCollection = collection(db, "pitches");
      const docRef = await addDoc(pitchesCollection, pitchData);
      firestoreDocId = docRef.id;
      console.log("Pitch document created in Firestore with ID:", firestoreDocId);

      // Add debugging for thread creation
      console.log("Attempting to create LangGraph thread...");
      console.log("Thread data available:", !!threadData);
      console.log("CreateThread function available:", typeof threadData.createThread);
      
      try {
        const newThread = await threadData.createThread();
        console.log("Thread creation result:", newThread);
        
        if (newThread && newThread.thread_id) {
          newLangGraphThreadId = newThread.thread_id;
          console.log("LangGraph thread created with ID:", newLangGraphThreadId);

          await updateDoc(docRef, { langGraphThreadId: newLangGraphThreadId });
          console.log("Firestore pitch document updated with LangGraph thread ID.");
        } else {
          console.log("Thread creation returned undefined or no thread_id - continuing without thread");
        }

        onPitchCreated(firestoreDocId, newLangGraphThreadId || "");
        
        // Move to the context step after pitch creation
        setActiveStep('context');
        
        if (firestoreDocId) {
          await refreshPitchData();
        }
      } catch (threadError) {
        console.error("Thread creation failed:", threadError);
        
        // Continue without thread ID - we can create it later if needed
        console.log("Continuing without LangGraph thread - will create later if needed");
        
        // Still call onPitchCreated but with null thread ID
        onPitchCreated(firestoreDocId, "");
        
        // Move to the context step after pitch creation
        setActiveStep('context');
        
        if (firestoreDocId) {
          await refreshPitchData();
        }
        
        // Show a warning but don't fail completely
        toast({
          title: "Pitch Created",
          description: "Pitch created successfully. Outline generation will work through server-side processing.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error("Error during pitch creation process:", error);
      setSaveError(`Failed to create pitch: ${error.message || 'Please try again.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreProcessData = async () => {
    if (!createdPitchId || !selectedClientName) { 
      setSaveError("Pitch ID or Client Name is missing. Cannot save data sources.");
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    const uploadedFileRefs: { name: string; url: string }[] = [];

    if (filesToUpload && filesToUpload.length > 0) {
      const uploadPromises = Array.from(filesToUpload).map(async (file) => {
        const filePath = `clients/${selectedClientName}/pitches/${createdPitchId}/context/${file.name}`;
        const fileRef = ref(storage, filePath);
        try {
          const snapshot = await uploadBytes(fileRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);
          uploadedFileRefs.push({ name: file.name, url: downloadURL });
          console.log('Uploaded', file.name, 'to', downloadURL);
        } catch (uploadError) {
          console.error(`Error uploading ${file.name}:`, uploadError);
          throw new Error(`Failed to upload ${file.name}`);
        }
      });

      try {
        await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Error during file uploads:", error);
        setSaveError("Failed to upload one or more files. Please try again.");
        setIsSaving(false);
        return;
      }
    }
    
    // Map the new data source categories
    const dataSourceCategories = {
      'client-profile': dataSourcesSelected['client-profile'] !== false,
      'competitor-analysis': dataSourcesSelected['competitor-analysis'] !== false,
      'market-data': dataSourcesSelected['market-data'] !== false,
      'financial-information': dataSourcesSelected['financial-information'] !== false,
      'executive-insights': dataSourcesSelected['executive-insights'] !== false,
    };

    // Use research data if available
    const useResearchData = {
      ...(dataSourcesSelected['client-research'] !== false ? { clientResearch: true } : {}),
      ...(dataSourcesSelected['competitor-research'] !== false && Object.keys(competitorDetailedData).length > 0 ? { competitorResearch: true } : {})
    };

    const updateData = {
      dataSourcesSelected: dataSourceCategories,
      uploadedFiles: uploadedFileRefs,
      status: 'context-complete',
      lastUpdatedAt: serverTimestamp(),
      useResearchData: useResearchData,
      // Include contextual data in this step
      additionalContext: {
        importantClientInfo,
        importantToClient,
        clientSentiment: sentiment[0],
        ourAdvantages,
        competitorStrengths,
        pitchFocus,
        relevantCaseStudies,
        keyMetrics,
        implementationTimeline,
        expectedROI,
        ignoredSections: Object.keys(ignoreSections).filter(key => ignoreSections[key as keyof typeof ignoreSections]),
      },
      // If we don't already have research data in the pitch document, add it
      ...(!loadedPitchData?.researchData ? {
        researchData: {
          clientDetails: clientDetailedData,
          competitorDetails: competitorDetailedData
        }
      } : {})
    };

    try {
      const pitchDocRef = doc(db, "pitches", createdPitchId!);
      await updateDoc(pitchDocRef, updateData);
      
      console.log("Context data saved successfully");
      
      toast({
        title: "Context Saved",
        description: "Context data has been saved. Now customize your slide structure.",
        variant: "default"
      });
      
      await refreshPitchData();
      
      // Move to the slide structure step
      setActiveStep('slideStructure');
    } catch (error) {
      console.error("Error saving data sources:", error);
      setSaveError("Failed to save data sources. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveContext = async () => {
    if (!createdPitchId) { 
      setSaveError("Pitch ID is missing. Cannot save context.");
      return;
    }
    setIsSaving(true);
    setSaveError(null);

    // Only include fields that aren't ignored
    const additionalContextData = {
        ...(ignoreSections?.clientInfo ? {} : {
          importantClientInfo,
          importantToClient,
          clientSentiment: sentiment[0],
        }),
        ...(ignoreSections?.competitive ? {} : {
          ourAdvantages,
          competitorStrengths,
        }),
        ...(ignoreSections?.focus ? {} : {
          pitchFocus,
        }),
        ...(ignoreSections?.advanced ? {} : {
          relevantCaseStudies,
          keyMetrics,
          implementationTimeline,
          expectedROI,
        }),
        // Track which sections were ignored
        ignoredSections: Object.keys(ignoreSections).filter(key => ignoreSections[key as keyof typeof ignoreSections]),
    };

    const updateData = {
        additionalContext: additionalContextData,
        status: 'ready-for-outline',
        lastUpdatedAt: serverTimestamp(),
    };

    try {
        const pitchDocRef = doc(db, "pitches", createdPitchId);
        await updateDoc(pitchDocRef, updateData);
        console.log("Additional context saved for pitch:", createdPitchId);

        setActiveStep('outline');

    } catch (error) {
        console.error("Error saving additional context:", error);
        setSaveError("Failed to save additional context. Please try again.");
    } finally {
        setIsSaving(false);
    }
  };

  const renderSetupStep = () => (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold text-slate-800">Initial Setup</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="client" className="text-sm font-medium">Client</Label>
          {clientsLoading && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading clients...</div>}
          {clientsError && <div className="flex items-center text-sm text-red-600"><AlertCircle className="h-4 w-4 mr-2" />{clientsError}</div>}
          {!clientsLoading && !clientsError && (
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-indigo-600" />
              <div className="flex-1">
                <Select name="clientId" required value={selectedClientId} onValueChange={handleClientChange}>
                  <SelectTrigger id="client" className="bg-white">
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="pitch-stage" className="text-sm font-medium">Pitch Stage / Type</Label>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-indigo-600" />
            <div className="flex-1">
              <Select name="pitchStage" required value={pitchStage} onValueChange={setPitchStage}>
                <SelectTrigger id="pitch-stage" className="bg-white">
                  <SelectValue placeholder="Select pitch stage" />
                </SelectTrigger>
                <SelectContent>
                  {pitchStages.filter(stage => stage.isActive).map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Known Competitors</Label>
        {competitorsLoading && <div className="flex items-center text-sm text-muted-foreground"><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading competitors...</div>}
        {competitorsError && <div className="flex items-center text-sm text-red-600"><AlertCircle className="h-4 w-4 mr-2" />{competitorsError}</div>}
        {!competitorsLoading && !competitorsError && (
          <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-white">
            {competitors.map((comp) => (
              <div key={comp.id} className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded-md border">
                <Checkbox 
                  id={`comp-${comp.id}`} 
                  onCheckedChange={(checked) => handleCompetitorCheckboxChange(comp.id, !!checked)}
                  checked={selectedCompetitorsFromList[comp.id] || false}
                  className="h-3 w-3"
                />
                <Label htmlFor={`comp-${comp.id}`} className="font-normal text-sm whitespace-nowrap">{comp.name}</Label>
              </div>
            ))}
            {knownCompetitors.map((compName, index) => (
              <div key={`known-${index}`} className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded-md border">
                <Checkbox id={`known-${index}`} checked disabled className="h-3 w-3" />
                <Label htmlFor={`known-${index}`} className="font-normal text-sm whitespace-nowrap">{compName}</Label>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center space-x-2 pt-1">
          <Input
            id="new-competitor"
            placeholder="Add another competitor..."
            value={newCompetitor}
            onChange={(e) => setNewCompetitor(e.target.value)}
            className="bg-white"
          />
          <Button type="button" size="sm" variant="outline" onClick={handleAddCompetitor} title="Add competitor">
            <PlusCircle className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDataSourcesStep = () => (
    <div className="">
      <div>
        <h3 className="text-2xl font-bold text-slate-800">Data Sources</h3>
        <p className="text-sm text-slate-600 mb-4">
          Select which information to use in your pitch. We'll automatically pull relevant data for your selected client and competitors.
        </p>
        
        {/* Data source categories in a grid */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
          <DataSourceCard 
            title="Client Profile" 
            icon={<User className="h-5 w-5" />}
            categoryId="client-profile"
            onCategoryToggle={handleDataSourceCategoryToggle}
            initialCheckedState={dataSourcesSelected['client-profile'] !== false}
            description="Company overview, industry positioning, and key information"
          />
          
          <DataSourceCard 
            title="Competitor Analysis" 
            icon={<Target className="h-5 w-5" />}
            categoryId="competitor-analysis"
            onCategoryToggle={handleDataSourceCategoryToggle}
            initialCheckedState={dataSourcesSelected['competitor-analysis'] !== false}
            description="SWOT analysis and competitive positioning"
          />
          
          <DataSourceCard 
            title="Market Data" 
            icon={<Globe className="h-5 w-5" />}
            categoryId="market-data"
            onCategoryToggle={handleDataSourceCategoryToggle}
            initialCheckedState={false}
            description="Industry trends and market analysis (Coming Soon)"
            disabled={true}
          />
          
          <DataSourceCard 
            title="Financial Information" 
            icon={<DollarSign className="h-5 w-5" />}
            categoryId="financial-information"
            onCategoryToggle={handleDataSourceCategoryToggle}
            initialCheckedState={false}
            description="Revenue, performance, and financial metrics"
            disabled={true}
          />
          
          <DataSourceCard 
            title="Internal Insights" 
            icon={<Users className="h-5 w-5" />}
            categoryId="internal-insights"
            onCategoryToggle={handleDataSourceCategoryToggle}
            initialCheckedState={false}
            description="Team knowledge and insights (Coming Soon)"
            disabled={true}
          />

          <DataSourceCard 
            title="Additional Documents" 
            icon={<FileUp className="h-5 w-5" />}
            categoryId="additional-documents"
            onCategoryToggle={handleDataSourceCategoryToggle}
            initialCheckedState={dataSourcesSelected['additional-documents'] !== false}
            description="Supporting documents and supplementary materials"
          />
        </div>
        
        {/* Display file list if any files are selected */}
        {filesToUpload && filesToUpload.length > 0 && (
          <div className="p-4 border rounded-md bg-white relative mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <FileUp className="h-5 w-5 text-indigo-600" />
                <h4 className="font-medium text-sm">Selected Documents</h4>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="text-sm"
                onClick={() => setUploadModalOpen(true)}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add More
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from(filesToUpload).map((file, idx) => (
                <div key={idx} className="flex items-center space-x-2 p-1.5 bg-slate-50 rounded-md border border-slate-200 text-sm">
                  <span className="text-xs text-slate-600">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* ----- ADDITIONAL CONTEXT SECTION ----- */}
      <div>
        <h3 className="mt-16 text-2xl font-bold text-slate-800">Additional Context</h3>
        <p className="text-sm text-slate-600 mb-4">
          Provide nuanced details to guide the pitch strategy. Toggle the switches to include or exclude sections.
        </p>

        {/* Stack context boxes vertically for easier scanning */}
        <div className="grid grid-cols-1 gap-8">
          {/* Main client information section */}
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <div className="bg-slate-50 px-4 py-4 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-md font-medium text-slate-700">Do you want to add any additional information on the client or their sentiment?</h4>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">Include</span>
                <Switch 
                  id="include-client-info" 
                  checked={!ignoreSections?.clientInfo} 
                  onCheckedChange={(checked) => setIgnoreSections(prev => ({...prev, clientInfo: !checked}))}
                />
              </div>
            </div>
            
            { !ignoreSections?.clientInfo && (
            <div className="p-4 grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="important-client-info" className="text-sm font-medium">Important Information About Client</Label>
                <Textarea 
                  id="important-client-info" 
                  name="importantClientInfo" 
                  placeholder="Key background, recent events, strategic priorities..." 
                  rows={3} 
                  className="bg-white resize-none" 
                  value={importantClientInfo} 
                  onChange={(e) => setImportantClientInfo(e.target.value)}
                  disabled={ignoreSections?.clientInfo} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="important-to-client" className="text-sm font-medium">What's Important to the Client?</Label>
                <Textarea 
                  id="important-to-client" 
                  name="importantToClient" 
                  placeholder="Their main goals, pain points, values, decision criteria..." 
                  rows={3} 
                  className="bg-white resize-none"
                  value={importantToClient} 
                  onChange={(e) => setImportantToClient(e.target.value)}
                  disabled={ignoreSections?.clientInfo} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client-sentiment" className="text-sm font-medium">Client's Current Sentiment Towards Us</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    id="client-sentiment"
                    name="clientSentiment"
                    min={0}
                    max={100}
                    step={1}
                    value={sentiment}
                    onValueChange={setSentiment}
                    className="flex-1"
                    disabled={ignoreSections?.clientInfo}
                  />
                  <span className="text-sm font-medium text-indigo-600 w-20 text-center">{getSentimentLabel(sentiment[0])}</span>
                </div>
                <p className="text-xs text-slate-500">Slide from Cynic (0) to Advocate (100).</p>
              </div>
            </div>) }
          </div>
          
          {/* Competitive information section */}
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <div className="bg-slate-50 px-4 py-4 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-md font-medium text-slate-700">Any additional information on the competitive position you'd like to include?</h4>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">Include</span>
                <Switch 
                  id="include-competitive" 
                  checked={!ignoreSections?.competitive} 
                  onCheckedChange={(checked) => setIgnoreSections(prev => ({...prev, competitive: !checked}))}
                />
              </div>
            </div>
            
            { !ignoreSections?.competitive && (
            <div className="p-4 grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="our-advantages" className="text-sm font-medium">Our Known Areas of Advantage</Label>
                <Textarea 
                  id="our-advantages" 
                  name="ourAdvantages" 
                  placeholder="Where do we excel compared to competitors for this client?" 
                  rows={3} 
                  className="bg-white resize-none" 
                  value={ourAdvantages} 
                  onChange={(e) => setOurAdvantages(e.target.value)}
                  disabled={ignoreSections?.competitive}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="competitor-strengths" className="text-sm font-medium">Where Competitors Are Stronger</Label>
                <Textarea 
                  id="competitor-strengths" 
                  name="competitorStrengths" 
                  placeholder="Known areas where competitors might have an edge?" 
                  rows={3} 
                  className="bg-white resize-none" 
                  value={competitorStrengths} 
                  onChange={(e) => setCompetitorStrengths(e.target.value)}
                  disabled={ignoreSections?.competitive}
                />
              </div>
            </div>) }
          </div>
          
          {/* Pitch focus section */}
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <div className="bg-slate-50 px-4 py-4 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-md font-medium text-slate-700">Would you like to specify key areas to focus the pitch on?</h4>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">Include</span>
                <Switch 
                  id="include-focus" 
                  checked={!ignoreSections?.focus} 
                  onCheckedChange={(checked) => setIgnoreSections(prev => ({...prev, focus: !checked}))}
                />
              </div>
            </div>
            
            { !ignoreSections?.focus && (
            <div className="p-4">
              <div className="space-y-2">
                <Label htmlFor="pitch-focus" className="text-sm font-medium">Key Areas to Focus Pitch On</Label>
                <Textarea 
                  id="pitch-focus" 
                  name="pitchFocus" 
                  placeholder="Specific services, value propositions, or themes to emphasize?" 
                  rows={4} 
                  className="bg-white resize-none" 
                  value={pitchFocus} 
                  onChange={(e) => setPitchFocus(e.target.value)}
                  disabled={ignoreSections?.focus}
                />
              </div>
            </div>) }
          </div>
          
          {/* Advanced Pitch Elements */}
          <div className="border border-slate-200 rounded-md overflow-hidden">
            <div className="bg-slate-50 px-4 py-4 border-b border-slate-200 flex justify-between items-center">
              <h4 className="text-md font-medium text-slate-700">Do you have advanced pitch elements like case studies, benchmarks, timeline, or ROI to include?</h4>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500">Include</span>
                <Switch 
                  id="include-advanced" 
                  checked={!ignoreSections?.advanced} 
                  onCheckedChange={(checked) => setIgnoreSections(prev => ({...prev, advanced: !checked}))}
                />
              </div>
            </div>
            
            { !ignoreSections?.advanced && (
            <div className="p-4 grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relevant-case-studies" className="text-sm font-medium">Relevant Case Studies / Success Stories</Label>
                <Textarea 
                  id="relevant-case-studies" 
                  name="relevantCaseStudies" 
                  placeholder="Any similar clients or projects we've successfully worked with..." 
                  rows={2} 
                  className="bg-white resize-none" 
                  value={relevantCaseStudies} 
                  onChange={(e) => setRelevantCaseStudies(e.target.value)}
                  disabled={ignoreSections?.advanced}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="key-metrics" className="text-sm font-medium">Key Metrics / Benchmarks</Label>
                <Textarea 
                  id="key-metrics" 
                  name="keyMetrics" 
                  placeholder="Specific KPIs, benchmarks, or performance metrics relevant to this pitch..." 
                  rows={2} 
                  className="bg-white resize-none" 
                  value={keyMetrics} 
                  onChange={(e) => setKeyMetrics(e.target.value)}
                  disabled={ignoreSections?.advanced}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="implementation-timeline" className="text-sm font-medium">Implementation Timeline</Label>
                <Textarea 
                  id="implementation-timeline" 
                  name="implementationTimeline" 
                  placeholder="Any timing constraints or milestones to consider..." 
                  rows={2} 
                  className="bg-white resize-none" 
                  value={implementationTimeline} 
                  onChange={(e) => setImplementationTimeline(e.target.value)}
                  disabled={ignoreSections?.advanced}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expected-roi" className="text-sm font-medium">Expected ROI / Financial Expectations</Label>
                <Textarea 
                  id="expected-roi" 
                  name="expectedROI" 
                  placeholder="Return on investment targets or other financial goals..." 
                  rows={2} 
                  className="bg-white resize-none" 
                  value={expectedROI} 
                  onChange={(e) => setExpectedROI(e.target.value)}
                  disabled={ignoreSections?.advanced}
                />
              </div>
            </div>) }
          </div>
        </div>
      </div>
    </div>
  );

  // Determine which form to render based on activeStepId or createdPitchId
  const formType = activeStepId || (createdPitchId ? 'context' : 'setup');

  return (
    <div className="relative">
      {saveError && (
        <div className="mb-6 mx-12 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{saveError}</span>
        </div>
      )}

      {formType === 'setup' && (
        <div className="space-y-6">
          {renderSetupStep()}
          <div className="flex justify-end mt-8 px-12">
            <Button 
              type="button" 
              onClick={handleCreatePitch}
              disabled={isSaving || !selectedClientId || !pitchStage}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Create Pitch & Proceed
              {!isSaving && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>
      )}
      
      {formType === 'context' && (
        <div className="space-y-6">
          {renderDataSourcesStep()}
          <div className="flex justify-end mt-8 px-12">
            <Button 
              type="button" 
              onClick={handlePreProcessData}
              disabled={isSaving}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Context & Continue
              {!isSaving && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 

// --- Utility Functions ---


// --- Outline Canvas Component (Moved Before workflowSteps) ---
interface OutlineCanvasProps {
  createdPitchId: string | null;
  langGraphThreadId: string | null;
  loadedPitchData?: PitchDocumentData | null;
  setActiveStep: (step: WorkflowStepId) => void;
  refreshPitchData: (pitchId: string | null) => Promise<void>;
  user?: any;
}

// Function to properly format the outline markdown for better rendering
const formatOutlineMarkdown = (outline: string): string => {
  if (!outline) return '';
  
  // 1. Remove markdown code fences if present
  let formatted = outline.replace(/^```markdown\s*\n?/i, '').replace(/\n?```\s*$/i, '');
  
  // 2. Normalize indentation spacing
  formatted = formatted.replace(/^[ ]{2}/gm, '  ');
  
  // 3. Ensure each slide header starts on its own line
  formatted = formatted.replace(/##\s+Slide/g, '\n## Slide');
  
  // 4. Add a blank line before each section label so they render as separate paragraphs
  const sectionLabels = [
    'Key Takeaway',
    'Key Points',
    'Value Framing',
    'Supporting Evidence',
    'Visual Recommendation',
    'Relationship Building Opportunity',
    'Purpose',
    'Key Content',
    'Strategic Framing',
  ];
  
  sectionLabels.forEach(label => {
    const regex = new RegExp(`\\*\\*${label}:\\*\\*`, 'g');
    formatted = formatted.replace(regex, `\n\n**${label}:**`);
  });
  
  // 5. Ensure the bullet list that follows **Key Points:** is on separate lines
  //    Convert any inline " - " bullet separators into newline bullets
  formatted = formatted.replace(/\*\*Key Points:\*\*[\s\S]*?(?=(\*\*|$))/g, (match) => {
    return match.replace(/\s-\s/g, '\n- ');
  });
  
  // 6. Guarantee each dash list item starts with "- " preceded by a newline
  formatted = formatted.replace(/([^\n])\s-\s/g, '$1\n- ');
  
  // 7. Add extra newline before any markdown heading to improve spacing
  formatted = formatted.replace(/\n(#{1,6}\s)/g, '\n\n$1');
  
  // 8. Collapse triple newlines to double to avoid excessive spacing
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  // 9. Trim any leading/trailing whitespace
  formatted = formatted.trim();
  
  return formatted;
};

const OutlineCanvas = ({
  createdPitchId,
  langGraphThreadId,
  loadedPitchData,
  setActiveStep,
  refreshPitchData,
  user,
}: OutlineCanvasProps) => {
  const { graphData } = useGraphContext();
  const { streamMessage, setMessages, clearState } = graphData;
  const { setThreadId } = useThreadContext();
  const isSendingInitialContext = useRef(false);
  const promptSentForThreadRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<string>('Initializing...');
  const [initialCallAttempted, setInitialCallAttempted] = useState(false);
  const [showBlankCanvas, setShowBlankCanvas] = useState(true); // Controls showing selection screen
  const [useBlankCanvasMode, setUseBlankCanvasMode] = useState(false); // Controls using blank canvas mode
  const [outlineImported, setOutlineImported] = useState(false); // Track if outline has been imported
  const maxRetries = 3;
  const retryDelayMs = 2000;

  // Add a function to create and add the notification message to the chat
  const addOutlineLoadedMessage = useCallback(() => {
    // Only add message if outline hasn't been imported yet
    if (outlineImported) {
      console.log("[OutlineCanvas] Outline already imported, skipping message addition");
      return;
    }
    
    // Check if message already exists to prevent duplicates
    const messageExists = graphData.messages.some(msg => 
      msg.id && msg.id.includes('outline-loaded-notification')
    );
    
    if (messageExists) {
      console.log("[OutlineCanvas] Outline loaded message already exists, skipping");
      return;
    }
    
    // Create a new AI message to notify the user
    const outlineLoadedMessage = new AIMessage({
      content: "**Pitch outline has been automatically loaded.** You can now refine and enhance it through our conversation. What would you like to adjust about the outline?",
      id: `outline-loaded-notification-${Date.now()}`,
    });
    
    // Add the message to the chat
    setMessages(prev => [...prev, outlineLoadedMessage]);
    
    // Start the chat if it hasn't been started yet
    if (!graphData.chatStarted) {
      graphData.setChatStarted(true);
    }
  }, [graphData, setMessages, outlineImported]);

  // Function to handle importing pitch content
  const handleImportPitchContent = () => {
    if (loadedPitchData?.initialOutline && !outlineImported) {
      console.log("[OutlineCanvas] Importing pitch outline as version 1");
      
      // Clear state first to avoid conflicts
      clearState();
      
      // Format the outline for better rendering
      const formattedOutline = formatOutlineMarkdown(loadedPitchData.initialOutline);
      
      // Set the artifact with the formatted initial outline
      graphData.setArtifact({
        currentIndex: 1,
        contents: [
          {
            index: 1,
            fullMarkdown: formattedOutline,
            title: "Pitch Outline",
            type: "text",
          },
        ],
      });
      
      // Make sure the chat is started so users can interact
      graphData.setChatStarted(true);
      
      // Add notification to the chat
      addOutlineLoadedMessage();
      
      // Ensure the renderer updates
      graphData.setUpdateRenderedArtifactRequired(true);
      
      // Mark as imported
      setOutlineImported(true);
    }
  };

  // Wrap existing functions with useCallback
  const createArtifactFromMessages = useCallback(() => {
    console.log("[OutlineCanvas] Creating artifact from messages...");
    const aiMessages = graphData.messages.filter(msg => 
      msg.constructor.name === 'AIMessage' || 
      (msg as any).type === 'ai' ||
      (msg as any)._getType?.() === 'ai'
    );
    
    if (aiMessages.length > 0) {
      const lastAiMessage = aiMessages[aiMessages.length - 1];
      console.log("[OutlineCanvas] Found AI message to use for artifact:", lastAiMessage);
      
      // Extract content from the AI message
      const content = typeof lastAiMessage.content === 'string' 
        ? lastAiMessage.content 
        : Array.isArray(lastAiMessage.content)
        ? lastAiMessage.content.map(item => 
            typeof item === 'string' ? item : JSON.stringify(item)
          ).join('\n')
        : JSON.stringify(lastAiMessage.content);
      
      // Apply formatting to ensure proper markdown
      const formattedContent = formatOutlineMarkdown(content);
      
      // Only create artifact if content is not empty
      if (formattedContent && formattedContent.trim().length > 0) {
        console.log("[OutlineCanvas] Creating artifact from message content");
        graphData.setArtifact({
          currentIndex: 1,
          contents: [
            {
              index: 1,
              fullMarkdown: formattedContent,
              title: "Pitch Outline",
              type: "text",
            }
          ]
        });
        
        // Force renderer to update
        graphData.setUpdateRenderedArtifactRequired(true);
        console.log("[OutlineCanvas] Artifact created from AI message");
        return true;
      } else {
        console.log("[OutlineCanvas] AI message content is empty, cannot create artifact");
      }
    }
    return false;
  }, [graphData]);

  const checkForArtifact = useCallback((attempt = 1) => {
    console.log(`[OutlineCanvas] Artifact check attempt ${attempt}/${maxRetries}`);
    
    // If artifact exists but is empty or if no artifact exists
    if (!graphData.artifact || 
        !graphData.artifact.contents || 
        graphData.artifact.contents.length === 0) {
      
      console.log("[OutlineCanvas] No artifact found, trying to create from AI messages");
      
      const created = createArtifactFromMessages();
      
      if (!created && attempt < maxRetries) {
        // If no artifact created and still have attempts left, try again
        setAgentStatus('Processing pitch outline results...');
        setTimeout(() => checkForArtifact(attempt + 1), retryDelayMs);
      } else if (!created) {
        console.error("[OutlineCanvas] Failed to create artifact after all attempts");
        setLoadError("Failed to load the outline. Please try refreshing the page.");
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    } else {
      console.log("[OutlineCanvas] Artifact exists, forcing update:", graphData.artifact);
      graphData.setUpdateRenderedArtifactRequired(true);
      setIsLoading(false);
    }
  }, [graphData, createArtifactFromMessages, maxRetries, retryDelayMs, setAgentStatus, setLoadError, setIsLoading]);

  // Updated fetchPitchContextAndSendInitialState to prioritize saved outline
  const fetchPitchContextAndSendInitialState = useCallback(async () => { 
    if (isSendingInitialContext.current) {
      console.log("[OutlineCanvas] Already sending initial context, ignoring duplicate call");
      return;
    }

    console.log("[OutlineCanvas] Fetching pitch context and sending initial state");
    isSendingInitialContext.current = true;
    setIsLoading(true);
    setLoadError(null);
    
    try {
      // First, check if we have a pitch ID and fetch the pitch data
      if (!createdPitchId) {
        throw new Error("No pitch ID provided");
      }
      
      const pitchDocRef = doc(db, "pitches", createdPitchId);
      const pitchDocSnap = await getDoc(pitchDocRef);
      
      if (!pitchDocSnap.exists()) {
        throw new Error(`Pitch document with ID ${createdPitchId} not found`);
      }

      // PRIORITY CHECK: If pitch has initialOutline, use it directly and skip LangGraph interactions
      const pitchData = pitchDocSnap.data() as PitchDocumentData;
      if (pitchData.initialOutline && (pitchData.outlineGenerated || pitchData.initialOutline.length > 100)) {
        console.log("[OutlineCanvas] Found existing outline in Firestore, loading it directly (performance optimization, outlineGenerated:", pitchData.outlineGenerated, ")");
        clearState();
        
        // Format the outline for better rendering
        const formattedOutline = formatOutlineMarkdown(pitchData.initialOutline);
        
        // Set the artifact with the formatted initial outline
        graphData.setArtifact({
          currentIndex: 1,
          contents: [
            {
              index: 1,
              fullMarkdown: formattedOutline,
              title: "Pitch Outline",
              type: "text",
            },
          ],
        });
        
        // Make sure the chat is started so users can interact
        graphData.setChatStarted(true);
        
        // Add notification to the chat
        addOutlineLoadedMessage();
        
        // Ensure the renderer updates
        graphData.setUpdateRenderedArtifactRequired(true);
        
        // Mark as imported
        setOutlineImported(true);
        
        // Hide loading modal since outline is ready
        setIsLoading(false);
        setAgentStatus('');
        
        setShowBlankCanvas(false);
        isSendingInitialContext.current = false;
        return;
      }

      // Only proceed with agent generation if no outline exists
      console.log("[OutlineCanvas] No existing outline found, proceeding with agent generation");
      
      // Continue with regular LangGraph workflow if no initial outline
      clearState(); 
      
      // --- Construct the initial message containing the context ---
      const initialContextString = JSON.stringify({ 
        pitchId: createdPitchId,
        clientId: pitchData.clientId,
        clientName: pitchData.clientName,
        pitchStage: pitchData.pitchStage,
        competitorIds: Object.entries(pitchData.competitorsSelected || {}).filter(([key, isSelected]) => isSelected && !key.startsWith('manual-')).map(([key]) => key),
        manualCompetitorNames: Object.entries(pitchData.competitorsSelected || {}).filter(([key, isSelected]) => isSelected && key.startsWith('manual-')).map(([key]) => key.substring(7)),
        importantClientInfo: pitchData.additionalContext?.importantClientInfo,
        importantToClient: pitchData.additionalContext?.importantToClient,
        clientSentiment: pitchData.additionalContext?.clientSentiment ?? 50,
        ourAdvantages: pitchData.additionalContext?.ourAdvantages,
        competitorStrengths: pitchData.additionalContext?.competitorStrengths,
        pitchFocus: pitchData.additionalContext?.pitchFocus,
        relevantCaseStudies: pitchData.additionalContext?.relevantCaseStudies,
        keyMetrics: pitchData.additionalContext?.keyMetrics,
        implementationTimeline: pitchData.additionalContext?.implementationTimeline,
        expectedROI: pitchData.additionalContext?.expectedROI,
        dataSourcesSelected: pitchData.dataSourcesSelected,
        uploadedFileNames: pitchData.uploadedFiles?.map(f => f.name),
        useResearchData: pitchData.useResearchData,
        _isInitialContext: true, 
      });

      // Send a plain object instead of a HumanMessage instance
      const initialMessagePayload = {
        role: "human",
        content: initialContextString,
      };

      const payloadToSend = { 
        // Pass the plain object message payload
        messages: [initialMessagePayload],
        configurable: { supabase_user_id: 'user-placeholder' } 
      };

      console.log("[OutlineCanvas] Payload being sent to streamMessage (plain object message):", JSON.stringify(payloadToSend, null, 2));
      
      try { // Inner try block for streaming the message
        console.log("[OutlineCanvas] Streaming initial context message to agent...");
        setAgentStatus('Fetching client & competitor data...'); 
        
        await streamMessage(payloadToSend as any).catch(error => {
          console.error("[OutlineCanvas] Stream error:", error);
          throw new Error(`Failed to stream message: ${error.message || 'Unknown error'}`);
        });
        
        console.log("[OutlineCanvas] Agent processing complete. Checking for artifact...");
        setAgentStatus('Finalizing pitch deck outline...'); 
        checkForArtifact(1); 
        console.log("[OutlineCanvas] Initial context message sent and processed.");
      
      } catch (streamError) { // Catch block for streamMessage call
        console.error("[OutlineCanvas] Error streaming initial state:", streamError);
        setLoadError(`Error generating outline: ${streamError instanceof Error ? streamError.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    } catch (error) { // Catch block for outer try (fetching pitch data)
      console.error("[OutlineCanvas] Error fetching pitch context or sending initial state:", error);
      setLoadError(`Error: ${error instanceof Error ? error.message : 'Failed to generate outline'}`);
      setIsLoading(false);
    } finally {
      isSendingInitialContext.current = false;
      setShowBlankCanvas(false); // Hide blank canvas after fetching context
    }
  }, [
    createdPitchId, 
    clearState, 
    streamMessage, 
    setIsLoading, 
    setLoadError, 
    setAgentStatus, 
    checkForArtifact,
    setMessages 
  ]);

  // Simplified useEffect that prioritizes loading saved outline for performance
  // This prevents unnecessary agent calls when navigating back to the outline step
  useEffect(() => {
    console.log(
      "[OutlineCanvas] Effect triggered. LangGraph Thread ID:",
      langGraphThreadId,
      "Loaded Pitch Data:",
      !!loadedPitchData,
      "Has Initial Outline:",
      !!loadedPitchData?.initialOutline,
      "Outline Generated Flag:",
      loadedPitchData?.outlineGenerated,
      "Outline Imported:",
      outlineImported
    );

    // Early return if outline is already imported to prevent infinite loops
    if (outlineImported) {
      console.log("[OutlineCanvas] Outline already imported, skipping effect");
      return;
    }

    // PRIORITY 1: If we have a saved outline in loadedPitchData, load it immediately
    if (loadedPitchData?.initialOutline && (loadedPitchData?.outlineGenerated || loadedPitchData?.initialOutline.length > 100)) {
      console.log("[OutlineCanvas] Found saved outline, loading it directly for performance (outlineGenerated:", loadedPitchData?.outlineGenerated, ")");
      
      // Clear any existing state
      clearState();
      
      // Format the outline for better rendering
      const formattedOutline = formatOutlineMarkdown(loadedPitchData.initialOutline);
      
      // Set the artifact with the formatted initial outline
      graphData.setArtifact({
        currentIndex: 1,
        contents: [
          {
            index: 1,
            fullMarkdown: formattedOutline,
            title: "Pitch Outline",
            type: "text",
          },
        ],
      });
      
      // Make sure the chat is started so users can interact
      graphData.setChatStarted(true);
      
      // Add notification to the chat
      addOutlineLoadedMessage();
      
      // Ensure the renderer updates
      graphData.setUpdateRenderedArtifactRequired(true);
      
      // Mark as imported and hide loading states
      setOutlineImported(true);
      setIsLoading(false);
      setAgentStatus('');
      setShowBlankCanvas(false);
      setUseBlankCanvasMode(false);
      
      // Set thread ID if available
      if (langGraphThreadId) {
        setThreadId(langGraphThreadId);
        promptSentForThreadRef.current = langGraphThreadId;
      }
      
      return; // Exit early since we loaded the saved outline
    }

    // PRIORITY 2: If no saved outline exists, handle thread ID logic for generation
    const hasValidOutline = loadedPitchData?.initialOutline && (loadedPitchData?.outlineGenerated || loadedPitchData?.initialOutline.length > 100);
    if (langGraphThreadId && langGraphThreadId !== promptSentForThreadRef.current && !hasValidOutline) {
      console.log("[OutlineCanvas] No saved outline found, setting up for generation with thread:", langGraphThreadId);
      setThreadId(langGraphThreadId);
      promptSentForThreadRef.current = langGraphThreadId;
      
      // Clear existing artifact/messages for fresh generation
      clearState(); 
      setLoadError(null);
      setIsLoading(false);
      setInitialCallAttempted(false);
      setShowBlankCanvas(true); // Show selection screen for new generation
      setUseBlankCanvasMode(false);
    } else if (!langGraphThreadId && !hasValidOutline) {
      console.log("[OutlineCanvas] No thread ID and no saved outline, showing blank canvas option");
      promptSentForThreadRef.current = null;
      setInitialCallAttempted(false);
      setShowBlankCanvas(true);
      setUseBlankCanvasMode(false);
    }

    // Ensure chat is started when in blank canvas mode
    if (useBlankCanvasMode && !graphData.chatStarted) {
      graphData.setChatStarted(true);
    }

    // PRIORITY 3: Handle cases where we're waiting for agent response (only if no saved outline)
    if (!hasValidOutline && !showBlankCanvas && !useBlankCanvasMode && !isLoading && !outlineImported &&
        (!graphData.artifact || !graphData.artifact.contents || graphData.artifact.contents.length === 0)) {
      // Attempt to create artifact from existing messages if any
      if (graphData.messages.length > 0) {
        console.log("[OutlineCanvas] No saved outline, checking for artifact from messages...");
        setIsLoading(true);
        setAgentStatus("Loading existing outline...");
        checkForArtifact(1);
      } else if (langGraphThreadId && !initialCallAttempted) {
        console.log("[OutlineCanvas] No saved outline, triggering generation...");
        setIsLoading(true);
        setAgentStatus('Initializing outline generation...');
        fetchPitchContextAndSendInitialState();
        setInitialCallAttempted(true);
      }
    } else if (graphData.artifact && isLoading && !useBlankCanvasMode) {
      // If artifact appeared while we were loading, stop loading
      console.log("[OutlineCanvas] Artifact found, stopping loading spinner.");
      setIsLoading(false);
    }
  }, [
    langGraphThreadId,
    loadedPitchData?.initialOutline, // Key dependency - when this changes, re-evaluate
    loadedPitchData?.outlineGenerated, // Performance flag - when this changes, re-evaluate
    outlineImported,
    showBlankCanvas,
    useBlankCanvasMode,
    isLoading,
    initialCallAttempted,
    graphData.artifact,
    graphData.chatStarted,
    graphData.messages.length
  ]);

  // Add effect to check for initial outline on mount
  useEffect(() => {
    if (loadedPitchData?.initialOutline) {
      console.log("[OutlineCanvas] Initial outline available:", loadedPitchData.initialOutline.substring(0, 100) + "...");
    } else {
      console.log("[OutlineCanvas] No initial outline available in loaded pitch data");
    }
  }, [loadedPitchData]);

  const handleSaveAndProceed = async () => {
    if (!createdPitchId) return;
    
    try {
      const pitchDocRef = doc(db, "pitches", createdPitchId);
      const currentArtifact = graphData.artifact?.contents?.[graphData.artifact.currentIndex - 1];
      
      if (!currentArtifact || currentArtifact.type !== "text") {
        toast({
          title: "Error",
          description: "No outline content to save.",
          variant: "destructive",
        });
        return;
      }

      const currentOutline = (currentArtifact as ArtifactMarkdownV3).fullMarkdown;
      
      if (!currentOutline) {
        toast({
          title: "Error",
          description: "No outline content to save.",
          variant: "destructive",
        });
        return;
      }
      
      // Parse the outline into slide outlines for the agent
      const slideOutlines = parseOutlineToSlideOutlines(currentOutline);
      
      if (slideOutlines.length === 0) {
        toast({
          title: "Warning",
          description: "No slides could be parsed from the outline. Saving outline only.",
          variant: "default",
        });
      }
      
      // Save outline and slide outlines to Firestore
      await updateDoc(pitchDocRef, {
        initialOutline: currentOutline,
        slideOutlines: slideOutlines,
        outlineGenerated: true, // Mark outline as generated for performance optimization
        status: slideOutlines.length > 0 ? 'generating-slides' : 'outline-ready',
        lastUpdatedAt: serverTimestamp(),
      });
      
      toast({
        title: "Success",
        description: "Outline saved successfully!",
      });
      
      // If we have slide outlines, trigger slide generation
      if (slideOutlines.length > 0 && loadedPitchData) {
        try {
          console.log("Starting slide generation process...");
          
          // Prepare pitch context for the agent
          const pitchContext: PitchContextData = {
            clientDetails: loadedPitchData.researchData?.clientDetails,
            competitorDetails: loadedPitchData.researchData?.competitorDetails,
            additionalContext: loadedPitchData.additionalContext,
            uploadedFiles: loadedPitchData.uploadedFiles,
            dataSourcesSelected: loadedPitchData.dataSourcesSelected
          };
          
          // Prepare input for slide generation agent
          const slideGenerationInput: SlideGenerationInput = {
            pitchId: createdPitchId,
            clientName: loadedPitchData.clientName,
            clientId: loadedPitchData.clientId,
            pitchStage: loadedPitchData.pitchStage,
            slideOutlines: slideOutlines,
            pitchContext: pitchContext
          };
          
          // Sanitize the input to remove Firestore Timestamp objects
          const sanitizedSlideGenerationInput = sanitizeForServer(slideGenerationInput);
          
          // Call the server action to generate slides
          const result = await generateSlidesServerAction(sanitizedSlideGenerationInput);
          
          if (!result.success) {
            console.error("Error generating slides:", result.error);
            toast({
              title: "Slide Generation Warning",
              description: "The slides could not be generated automatically. You can create them manually.",
              variant: "default"
            });
            
            // Update status to indicate slides need manual creation
            await updateDoc(pitchDocRef, { 
              status: 'slides-manual-needed'
            });
          } else {
            console.log("Slides generated successfully");
            toast({
              title: "Slides Generated",
              description: `${slideOutlines.length} slides have been generated successfully!`,
              variant: "default"
            });
          }
        } catch (slideError) {
          console.error("Error in slide generation:", slideError);
          toast({
            title: "Slide Generation Failed",
            description: "There was an error generating slides. You can create them manually.",
            variant: "destructive"
          });
          
          // Update status to indicate slides need manual creation
          await updateDoc(pitchDocRef, { 
            status: 'slides-manual-needed'
          });
        }
      }
      
      // Refresh pitch data and move to build deck step
      await refreshPitchData(createdPitchId);
      setActiveStep('buildDeck');
      
    } catch (error) {
      console.error("Error saving outline:", error);
      toast({
        title: "Error",
        description: "Failed to save outline. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Modified render code to handle blank canvas mode
  return (
    <div className="h-[calc(100vh-130px)] w-full relative mb-1">
      {createdPitchId ? (
        <>
          {/* Show selection screen */}
          {showBlankCanvas ? (
            <div className="absolute inset-0 bg-white flex flex-col items-center justify-center">
              <div className="max-w-lg text-center p-8">
                <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-indigo-800 mb-4">Starting Pitch Canvas</h2>
                <p className="text-slate-600 mb-6">
                  We're setting up your canvas with the initial outline. Please wait a moment...
                </p>
                <Button 
                  onClick={() => {
                    // Use blank canvas mode without loading context
                    setUseBlankCanvasMode(true);
                    setShowBlankCanvas(false);
                    // Initialize Canvas without context
                    clearState();
                    // Set chat started to true to show chat input
                    graphData.setChatStarted(true);
                    // Initialize with empty content
                    graphData.setArtifact({
                      currentIndex: 1,
                      contents: [
                        {
                          index: 1,
                          type: "text",
                          title: "Pitch Outline",
                          fullMarkdown: ""
                        }
                      ]
                    });
                    
                    // Add a welcome message to the chat
                    const welcomeMessage = new AIMessage({
                      content: "Welcome to the blank canvas! Let me help you create a pitch outline from scratch. What would you like to include in your pitch?",
                      id: `blank-canvas-welcome-${Date.now()}`,
                    });
                    setMessages(prev => [...prev, welcomeMessage]);
                    
                    // Force renderer to update
                    graphData.setUpdateRenderedArtifactRequired(true);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Start with Empty Canvas
                </Button>
              </div>
            </div>
          ) : (
            // Show Canvas whether in blank mode or with loaded context
            <>
              {/* Regular Canvas */}
              {(!isLoading && !loadError) && <Canvas createdPitchId={createdPitchId} handleSaveAndProceed={handleSaveAndProceed} user={user} />}
            </>
          )}
          
          {/* Only render Loading Modal when not in blank canvas mode and not showing selection screen */}
          {!showBlankCanvas && !useBlankCanvasMode && isLoading && (
            <div className="absolute inset-0 bg-indigo-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                {/* Simplified Spinner */}
                <div className="flex items-center justify-center mb-4">
                   <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-center text-indigo-800 mb-2">Generating Pitch Outline</h3>
                {/* Dynamic Status Text */}
                <p className="text-center text-indigo-600 mb-4 text-sm">{agentStatus}</p>
                {/* Simple Progress Bar (Optional) */}
                <div className="w-full bg-indigo-100 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div className="bg-indigo-600 h-1.5 rounded-full animate-pulse w-full"></div> 
                </div>
                <p className="text-xs text-center text-slate-500">This may take a moment...</p>
              </div>
            </div>
          )}
          
          {/* Error Modal - only show when not in blank canvas mode */}
          {!showBlankCanvas && !useBlankCanvasMode && loadError && (
             <div className="absolute inset-0 bg-red-50/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                <div className="flex items-center justify-center mb-4 text-red-500">
                  <AlertCircle className="h-12 w-12" />
                </div>
                <h3 className="text-lg font-medium text-center text-red-800 mb-2">Error Loading Outline</h3>
                <p className="text-center text-red-600 mb-4">{loadError}</p>
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={() => {
                      setLoadError(null);
                      setUseBlankCanvasMode(true);
                      setShowBlankCanvas(false);
                      clearState();
                    }}
                    className="bg-white border border-red-600 text-red-600 hover:bg-red-50"
                  >
                    Use Blank Canvas
                  </Button>
                  <Button 
                    onClick={() => {
                      setLoadError(null);
                      setInitialCallAttempted(false);
                      isSendingInitialContext.current = false;
                      setIsLoading(true);
                      // Force a retry on button click
                      if (graphData.messages.length > 0) {
                        checkForArtifact(1);
                      } else if (langGraphThreadId) {
                        // Reset and try again by triggering the useEffect
                        promptSentForThreadRef.current = null; // Force re-trigger
                        clearState(); // Clear any existing messages or artifacts
                        fetchPitchContextAndSendInitialState();
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Retry with Context
                  </Button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        // Waiting state remains the same
        <div className="flex items-center justify-center h-full">
          <p className="text-slate-500">
            Waiting for pitch context...
          </p>
        </div>
      )}
    </div>
  );
};

// --- Slide Structure Editor Component ---
interface SlideStructureEditorProps {
  createdPitchId: string | null;
  loadedPitchData?: PitchDocumentData | null;
  setActiveStep: (step: WorkflowStepId) => void;
  refreshPitchData: () => void;
  pitchStages?: PitchStage[];
}

const SlideStructureEditor = ({
  createdPitchId,
  loadedPitchData,
  setActiveStep,
  refreshPitchData,
  pitchStages = []
}: SlideStructureEditorProps) => {
  const [slideStructures, setSlideStructures] = useState<SlideStructure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editingSlide, setEditingSlide] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Load slide structures on mount
  useEffect(() => {
    const loadSlideStructures = async () => {
      if (!loadedPitchData?.pitchStage) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Check if we have custom slide structure for this pitch
        if (loadedPitchData.customSlideStructure && loadedPitchData.customSlideStructure.length > 0) {
          console.log("Loading custom slide structure from pitch data");
          setSlideStructures(loadedPitchData.customSlideStructure);
        } else {
          // Load default slide structures for the pitch stage
          console.log("Loading default slide structures for pitch stage:", loadedPitchData.pitchStage);
          
          // Find the pitch stage
          const pitchStage = pitchStages.find(stage => stage.id === loadedPitchData.pitchStage);
          
          if (pitchStage) {
            // Get slide structures for this pitch stage
            const structures = await slideStructuresService.getByPitchStageId(pitchStage.id);
            const sortedStructures = structures
              .filter(s => s.isActive)
              .sort((a, b) => a.order - b.order);
            setSlideStructures(sortedStructures);
          } else {
            // Fallback to all active slide structures
            const allStructures = await slideStructuresService.getAll();
            const activeStructures = allStructures
              .filter(s => s.isActive)
              .sort((a, b) => a.order - b.order);
            setSlideStructures(activeStructures);
          }
        }
      } catch (error) {
        console.error("Error loading slide structures:", error);
        setSaveError("Failed to load slide structures");
      } finally {
        setIsLoading(false);
      }
    };

    loadSlideStructures();
  }, [loadedPitchData, pitchStages]);

  const handleEditSlide = (index: number) => {
    const slide = slideStructures[index];
    setEditingSlide(index);
    setEditTitle(slide.title);
    setEditDescription(slide.description);
  };

  const handleSaveEdit = () => {
    if (editingSlide === null) return;
    
    const updatedStructures = [...slideStructures];
    updatedStructures[editingSlide] = {
      ...updatedStructures[editingSlide],
      title: editTitle,
      description: editDescription,
    };
    
    setSlideStructures(updatedStructures);
    setEditingSlide(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleCancelEdit = () => {
    setEditingSlide(null);
    setEditTitle('');
    setEditDescription('');
  };

  const handleAddSlide = () => {
    const newSlide: SlideStructure = {
      id: `custom-${Date.now()}`,
      title: 'New Slide',
      description: 'Add your slide description here',
      order: slideStructures.length + 1,
      isRequired: false,
      isActive: true,
      pitchStageId: loadedPitchData?.pitchStage || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setSlideStructures([...slideStructures, newSlide]);
  };

  const handleDeleteSlide = (index: number) => {
    const updatedStructures = slideStructures.filter((_, i) => i !== index);
    // Update order for remaining slides
    const reorderedStructures = updatedStructures.map((slide, i) => ({
      ...slide,
      order: i + 1,
    }));
    setSlideStructures(reorderedStructures);
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === slideStructures.length - 1)
    ) {
      return;
    }

    const updatedStructures = [...slideStructures];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap slides
    [updatedStructures[index], updatedStructures[targetIndex]] = 
    [updatedStructures[targetIndex], updatedStructures[index]];
    
    // Update order
    updatedStructures.forEach((slide, i) => {
      slide.order = i + 1;
    });
    
    setSlideStructures(updatedStructures);
  };

  const handleResetToDefault = async () => {
    if (!loadedPitchData?.pitchStage) {
      setSaveError("No pitch stage available to reset template");
      return;
    }

    try {
      setIsLoading(true);
      setSaveError(null);
      
      console.log("Resetting to default slide structure for pitch stage:", loadedPitchData.pitchStage);
      
      // Find the pitch stage
      const pitchStage = pitchStages.find(stage => stage.id === loadedPitchData.pitchStage);
      
      if (pitchStage) {
        // Get default slide structures for this pitch stage
        const structures = await slideStructuresService.getByPitchStageId(pitchStage.id);
        const sortedStructures = structures
          .filter(s => s.isActive)
          .sort((a, b) => a.order - b.order);
        
        setSlideStructures(sortedStructures);
        
        toast({
          title: "Template Reset",
          description: `Slide structure has been reset to the default template for ${pitchStage.name}.`,
          variant: "default"
        });
      } else {
        // Fallback to all active slide structures
        const allStructures = await slideStructuresService.getAll();
        const activeStructures = allStructures
          .filter(s => s.isActive)
          .sort((a, b) => a.order - b.order);
        
        setSlideStructures(activeStructures);
        
        toast({
          title: "Template Reset",
          description: "Slide structure has been reset to the default template.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error resetting to default template:", error);
      setSaveError("Failed to reset to default template. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndProceed = async () => {
    if (!createdPitchId) {
      setSaveError("No pitch ID available");
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      // Save custom slide structure to Firestore
      const pitchDocRef = doc(db, "pitches", createdPitchId);
      await updateDoc(pitchDocRef, {
        customSlideStructure: slideStructures,
        status: 'generating-outline',
        lastUpdatedAt: serverTimestamp(),
      });

      console.log("Custom slide structure saved, proceeding to outline generation");

      // Call the pitch outline generator agent using server action
      try {
        console.log("Starting pitch outline generation process...");
        
        // Create a map of selected competitors
        const competitorsMap: Record<string, boolean> = {};
        
        // Add selected competitors from loadedPitchData
        if (loadedPitchData?.competitorsSelected) {
          Object.entries(loadedPitchData.competitorsSelected).forEach(([key, value]) => {
            competitorsMap[key] = value;
          });
        }
        
        // Prepare input for the outline generator
        const outlineInput = {
          pitchId: createdPitchId,
          clientId: loadedPitchData?.clientId,
          clientName: loadedPitchData?.clientName || '',
          pitchStage: loadedPitchData?.pitchStage || '',
          competitorsSelected: competitorsMap,
          
          // Context data
          importantClientInfo: loadedPitchData?.additionalContext?.importantClientInfo || '',
          importantToClient: loadedPitchData?.additionalContext?.importantToClient || '',
          clientSentiment: loadedPitchData?.additionalContext?.clientSentiment || 50,
          ourAdvantages: loadedPitchData?.additionalContext?.ourAdvantages || '',
          competitorStrengths: loadedPitchData?.additionalContext?.competitorStrengths || '',
          pitchFocus: loadedPitchData?.additionalContext?.pitchFocus || '',
          
          // Additional context
          relevantCaseStudies: loadedPitchData?.additionalContext?.relevantCaseStudies || '',
          keyMetrics: loadedPitchData?.additionalContext?.keyMetrics || '',
          implementationTimeline: loadedPitchData?.additionalContext?.implementationTimeline || '',
          expectedROI: loadedPitchData?.additionalContext?.expectedROI || '',
          
          // Data sources
          dataSourcesSelected: loadedPitchData?.dataSourcesSelected || {},
          uploadedFileNames: loadedPitchData?.uploadedFiles?.map(f => f.name) || [],
          
          // Research data if available
          clientDetails: loadedPitchData?.researchData?.clientDetails,
          competitorDetails: loadedPitchData?.researchData?.competitorDetails,
          
          // Custom slide structure
          customSlideStructure: slideStructures,
          
          // Pass existing thread ID if available
          existingThreadId: loadedPitchData?.langGraphThreadId || null
        };
        
        // Sanitize data to remove Firestore Timestamp objects
        const sanitizedOutlineInput = sanitizeForServer(outlineInput);
        
        // Call server action to generate the outline
        const serverResult = await generateOutlineServerAction(sanitizedOutlineInput as any);
        
        if (!serverResult.success) {
          console.error("Error generating outline:", serverResult.error);
          toast({
            title: "Outline Generation Warning",
            description: "The outline was generated with some issues. You may need to refine it manually.",
            variant: "default"
          });
        } else {
          console.log("Outline generated successfully");
          toast({
            title: "Outline Generated",
            description: "Pitch outline has been successfully generated with your custom slide structure!",
            variant: "default"
          });
        }
      } catch (outlineError) {
        console.error("Error in outline generation:", outlineError);
        toast({
          title: "Outline Generation Failed",
          description: "There was an error generating the outline. You can create it manually.",
          variant: "destructive"
        });
        
        // Still update to ready-for-outline even if generation fails
        await updateDoc(pitchDocRef, { 
          status: 'ready-for-outline'
        });
      }
      
      await refreshPitchData();
      
      // Move to the outline step
      setActiveStep('outline');
    } catch (error) {
      console.error("Error saving slide structure:", error);
      setSaveError("Failed to save slide structure. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 text-indigo-600 animate-spin" />
          <p className="text-slate-600">Loading slide structure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-slate-800">Customize Slide Structure</h3>
        <p className="text-sm text-slate-600 mt-2">
          Review and customize the slide structure for your pitch. You can edit titles, descriptions, add new slides, delete slides, and reorder them.
        </p>
      </div>

      {saveError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="space-y-4">
        {slideStructures.map((slide, index) => (
          <div key={slide.id} className="border border-slate-200 rounded-lg p-4 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {editingSlide === index ? (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor={`edit-title-${index}`} className="text-sm font-medium">
                        Slide Title
                      </Label>
                      <Input
                        id={`edit-title-${index}`}
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`edit-description-${index}`} className="text-sm font-medium">
                        Description
                      </Label>
                      <Textarea
                        id={`edit-description-${index}`}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows={3}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-slate-500">#{index + 1}</span>
                      <h4 className="text-lg font-medium text-slate-800">{slide.title}</h4>
                    </div>
                    <p className="text-slate-600 text-sm">{slide.description}</p>
                  </div>
                )}
              </div>
              
              {editingSlide !== index && (
                <div className="flex items-center space-x-1 ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveSlide(index, 'up')}
                    disabled={index === 0}
                    title="Move up"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleMoveSlide(index, 'down')}
                    disabled={index === slideStructures.length - 1}
                    title="Move down"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditSlide(index)}
                    title="Edit slide"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteSlide(index)}
                    title="Delete slide"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4">
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleAddSlide}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Slide
          </Button>
          <Button
            variant="outline"
            onClick={handleResetToDefault}
            disabled={isLoading}
            className="flex items-center text-amber-600 border-amber-300 hover:bg-amber-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Reset to Default Template
          </Button>
        </div>

        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => setActiveStep('context')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Context
          </Button>
          <Button
            onClick={handleSaveAndProceed}
            disabled={isSaving || slideStructures.length === 0}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Structure & Generate Outline
            {!isSaving && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- Placeholder Components ---
interface DocumentGenerationProps {
  createdPitchId: string | null;
  loadedPitchData: PitchDocumentData | null;
  setActiveStep: (step: WorkflowStepId) => void;
  refreshPitchData: (pitchId: string | null) => Promise<void>;  // Match the exact return type including Promise
}

// Add a sub-step type for the build deck process
type BuildDeckSubStep = 'createSlides' | 'editDeck';

// Enhanced content parsing with better formatting support
const parseContentIntoBlocks = (content: string) => {
  if (!content) return [];
  
  const blocks: { type: "text" | "bullet" | "heading"; content: string; level?: number }[] = [];
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check for headings (## or ###)
    if (trimmed.startsWith('### ')) {
      blocks.push({
        type: 'heading' as const,
        content: trimmed.substring(4),
        level: 3
      });
    } else if (trimmed.startsWith('## ')) {
      blocks.push({
        type: 'heading' as const,
        content: trimmed.substring(3),
        level: 2
      });
    }
    // Check for bullet points
    else if (trimmed.match(/^[\s]*[-•*]\s/)) {
      blocks.push({
        type: 'bullet' as const,
        content: trimmed.replace(/^[\s]*[-•*]\s/, ''),
        level: 1
      });
    }
    // Check for numbered lists
    else if (trimmed.match(/^[\s]*\d+[.)]\s/)) {
      blocks.push({
        type: 'bullet' as const,
        content: trimmed.replace(/^[\s]*\d+[.)]\s/, ''),
        level: 1
      });
    }
    // Regular text
    else {
      blocks.push({
        type: 'text' as const,
        content: trimmed,
        level: 1
      });
    }
  }
  
  return blocks;
};

// Modern PowerPoint-like Slide Carousel Component
const SlideCarousel = ({ slides, onSlideUpdate, loadedPitchData }: { 
  slides: AISlideContent[], 
  onSlideUpdate: (slideIndex: number, updatedSlide: AISlideContent) => void,
  loadedPitchData?: PitchDocumentData | null
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editSubtitle, setEditSubtitle] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOutlineReferenceOpen, setIsOutlineReferenceOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sidebarActiveTab, setSidebarActiveTab] = useState<'outline' | 'notes'>('outline');

  const currentSlide = slides[currentSlideIndex];
  
  // Get the current slide outline from the loaded pitch data
  const currentSlideOutline = loadedPitchData?.slideOutlines?.find(
    outline => outline.number === currentSlideIndex + 1
  );

  // Convert blocks back to editable text format
  const blocksToEditableText = (blocks: any[]) => {
    if (!blocks || blocks.length === 0) return '';
    
    return blocks.map(block => {
      switch (block.type) {
        case 'heading':
          return `## ${block.content}`;
        case 'bullet':
          return `• ${block.content}`;
        default:
          return block.content;
      }
    }).join('\n\n');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditTitle(currentSlide?.content?.title || '');
    setEditSubtitle(currentSlide?.content?.subtitle || '');
    
    // Use blocks for editing if available, otherwise fall back to body
    if (currentSlide?.content?.blocks && currentSlide.content.blocks.length > 0) {
      setEditContent(blocksToEditableText(currentSlide.content.blocks));
    } else {
      setEditContent(currentSlide?.content?.body || '');
    }
    
    setShowPreview(false);
  };

  const handleSaveEdit = () => {
    if (currentSlide) {
      // Parse content into blocks based on formatting
      const blocks = parseContentIntoBlocks(editContent);
      
      const updatedSlide = {
        ...currentSlide,
        content: {
          ...currentSlide.content,
          title: editTitle,
          subtitle: editSubtitle,
          body: editContent,
          blocks: blocks
        }
      };
      onSlideUpdate(currentSlideIndex, updatedSlide);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent('');
    setEditTitle('');
    setEditSubtitle('');
    setShowPreview(false);
  };



  // Formatting helper functions
  const insertFormatting = (format: string) => {
    const textarea = document.getElementById('slide-content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editContent.substring(start, end);
    
    let newText = '';
    let newCursorPos = start;
    
    switch (format) {
      case 'bold':
        newText = `**${selectedText}**`;
        newCursorPos = start + 2;
        break;
      case 'italic':
        newText = `*${selectedText}*`;
        newCursorPos = start + 1;
        break;
      case 'bullet':
        newText = selectedText ? `• ${selectedText}` : '• ';
        newCursorPos = start + 2;
        break;
      case 'heading':
        newText = selectedText ? `## ${selectedText}` : '## ';
        newCursorPos = start + 3;
        break;
      default:
        newText = selectedText;
    }
    
    const newContent = editContent.substring(0, start) + newText + editContent.substring(end);
    setEditContent(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos + (selectedText ? selectedText.length : 0));
    }, 0);
  };

  const handleAIEnhance = async () => {
    // TODO: Implement AI enhancement for individual slides
    toast({
      title: "AI Enhancement",
      description: "AI slide enhancement feature coming soon!",
    });
  };

  if (!slides || slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200/50 shadow-sm">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-slate-500" />
          </div>
          <p className="text-slate-600 font-medium">No slides available</p>
          <p className="text-slate-500 text-sm mt-1">Generate slides to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full relative bg-gradient-to-br from-slate-50/50 to-white rounded-xl border border-slate-200/50 shadow-sm overflow-hidden">
      {/* Modern Left Sidebar - Slide Thumbnails */}
      <div className={cn(
        "transition-all duration-300 ease-out border-r border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50",
        isSidebarCollapsed ? "w-16" : "w-72"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {!isSidebarCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                <h3 className="font-semibold text-slate-800">Slides</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{slides.length}</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4 text-slate-600" />
              ) : (
                <ChevronLeft className="h-4 w-4 text-slate-600" />
              )}
            </Button>
          </div>
        </div>

        {!isSidebarCollapsed && (
          <div className="flex flex-col h-full">
            {/* Slide Thumbnails */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="space-y-3">
                {(loadedPitchData?.slides || []).map((slide, index) => (
                  <button
                    key={slide.id ? `${slide.id}-${index}` : `slide-nav-${index}`}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={cn(
                      "w-full group relative transition-all duration-200 ease-out",
                      currentSlideIndex === index ? "scale-105" : "hover:scale-102"
                    )}
                  >
                                        {/* Slide Thumbnail Card */}
                     <div className={cn(
                       "relative bg-white rounded-lg border shadow-sm transition-all duration-200",
                       currentSlideIndex === index
                         ? "border-indigo-300 shadow-indigo-100 shadow-md ring-2 ring-indigo-100"
                         : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                     )}>
                       {/* Thumbnail Content */}
                       <div className="p-3 flex items-center space-x-3">
                         {/* Slide Number Circle */}
                         <div className={cn(
                           "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shadow-sm",
                           currentSlideIndex === index
                             ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white"
                             : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                         )}>
                           {index + 1}
                         </div>
                         
                         {/* Title Left-Aligned */}
                         <div className={cn(
                           "flex-1 font-medium text-sm truncate transition-colors text-left",
                           currentSlideIndex === index ? "text-indigo-900" : "text-slate-800"
                         )}>
                           {slide.content?.title || `Slide ${index + 1}`}
                         </div>
                       </div>
                       
                       {/* Active Slide Indicator */}
                       {currentSlideIndex === index && (
                         <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 rounded-lg pointer-events-none"></div>
                       )}
                     </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modern Main Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Enhanced Top Navigation Bar */}
        <div className="px-6 py-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            {/* Navigation Controls */}
            <div className="flex items-center space-x-3">
                             <div className="flex items-center bg-slate-50 rounded-lg p-1">
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                   disabled={currentSlideIndex === 0}
                   className="h-8 px-3 hover:bg-white hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent"
                 >
                   <ChevronLeft className="h-4 w-4" />
                   <span className="ml-1 hidden sm:inline">Previous</span>
                 </Button>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                   disabled={currentSlideIndex === slides.length - 1}
                   className="h-8 px-3 hover:bg-white hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent"
                 >
                   <span className="mr-1 hidden sm:inline">Next</span>
                   <ChevronRight className="h-4 w-4" />
                 </Button>
               </div>
              
              {/* Slide Counter */}
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-900">
                  {currentSlideIndex + 1}
                </span>
                <span className="text-xs text-slate-500">of</span>
                <span className="text-sm text-slate-600">{slides.length}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
                            {/* Slide Reference Button */}
              {(currentSlideOutline || currentSlide?.content?.body) && (
                <Button 
                  variant={isOutlineReferenceOpen ? "default" : "outline"}
                  size="sm" 
                  onClick={() => {
                    setIsOutlineReferenceOpen(!isOutlineReferenceOpen);
                    // Default to notes tab if slide has body content but user is seeing different content when editing
                    if (!isOutlineReferenceOpen && currentSlide?.content?.body && currentSlide?.content?.blocks) {
                      setSidebarActiveTab('notes');
                    }
                  }}
                  className={cn(
                    "transition-all duration-200",
                    isOutlineReferenceOpen 
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:from-indigo-600 hover:to-purple-600" 
                      : "hover:bg-slate-50"
                  )}
                >
                  <Info className="h-4 w-4 mr-2" />
                  Slide Reference
                </Button>
              )}
              
                             {/* Edit/Save Controls */}
               {!isEditing ? (
                 <>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={handleEdit}
                     className="hover:bg-slate-50 hover:text-slate-900 border-slate-200"
                   >
                     <Pencil className="h-4 w-4 mr-2" />
                     Edit Slide
                   </Button>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={handleAIEnhance}
                     className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:text-indigo-800 border-indigo-200 text-indigo-700"
                   >
                     <Wand2 className="h-4 w-4 mr-2" />
                     AI Enhance
                   </Button>
                 </>
               ) : (
                 <div className="flex items-center space-x-3">
                   <div className="flex items-center space-x-1 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded">
                     <Type className="h-3 w-3" />
                     <span>Enhanced Editor</span>
                   </div>
                   <div className="flex items-center space-x-2 bg-slate-50 p-1 rounded-lg">
                     <Button 
                       variant="ghost" 
                       size="sm" 
                       onClick={handleCancelEdit}
                       className="hover:bg-white hover:text-slate-900"
                     >
                       <X className="h-4 w-4 mr-1" />
                       Cancel
                     </Button>
                     <Button 
                       size="sm" 
                       onClick={handleSaveEdit}
                       className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-sm"
                     >
                       <Check className="h-4 w-4 mr-1" />
                       Save Changes
                     </Button>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* Enhanced Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Slide Content */}
          <div className={cn(
            "flex-1 transition-all duration-300 ease-out overflow-y-auto",
            isOutlineReferenceOpen ? "mr-0" : ""
          )}>
                         {/* Slide Canvas */}
             <div className="h-full bg-gradient-to-br from-white to-slate-50/30 overflow-y-auto">
               <div className="max-w-5xl mx-auto p-8">
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200/50 w-full p-6 flex flex-col relative overflow-hidden min-h-[500px] max-h-[700px]">
                  {/* Subtle background pattern */}
                  <div className="absolute inset-0 opacity-[0.02]">
                    <div className="absolute inset-0" style={{
                      backgroundImage: `radial-gradient(circle at 1px 1px, rgb(148 163 184) 1px, transparent 0)`,
                      backgroundSize: '20px 20px'
                    }}></div>
                  </div>
                  
                                     {/* Slide Content */}
                   <div className="relative z-10 flex-1 space-y-4">
                     {/* Slide Title */}
                     <div className="space-y-1">
                       <h2 className="text-3xl font-bold text-slate-900 leading-tight">
                         {currentSlide?.content?.title || `Slide ${currentSlideIndex + 1}`}
                       </h2>
                       {currentSlide?.content?.subtitle && (
                         <h3 className="text-lg text-slate-600 font-medium">{currentSlide.content.subtitle}</h3>
                       )}
                     </div>
                     
                     {/* Slide Body */}
                     {isEditing ? (
                       <div className="space-y-4 flex-1">
                         {/* Enhanced Edit Mode */}
                         <div className="space-y-3">
                           {/* Title and Subtitle Editing */}
                           <div className="grid grid-cols-1 gap-3">
                             <div>
                               <Label htmlFor="slide-title" className="text-sm font-medium text-slate-700">
                                 Slide Title
                               </Label>
                               <Input
                                 id="slide-title"
                                 value={editTitle}
                                 onChange={(e) => setEditTitle(e.target.value)}
                                 className="text-lg font-semibold"
                                 placeholder="Enter slide title..."
                               />
                             </div>
                             <div>
                               <Label htmlFor="slide-subtitle" className="text-sm font-medium text-slate-700">
                                 Subtitle (Optional)
                               </Label>
                               <Input
                                 id="slide-subtitle"
                                 value={editSubtitle}
                                 onChange={(e) => setEditSubtitle(e.target.value)}
                                 placeholder="Enter subtitle..."
                               />
                             </div>
                           </div>

                           {/* Content Editing with Formatting Toolbar */}
                           <div className="space-y-2">
                             <div className="flex items-center justify-between">
                               <Label htmlFor="slide-content" className="text-sm font-medium text-slate-700">
                                 Slide Content
                               </Label>
                               <div className="flex items-center space-x-1">
                                 <Button
                                   type="button"
                                   variant={showPreview ? "default" : "outline"}
                                   size="sm"
                                   onClick={() => setShowPreview(!showPreview)}
                                   className="h-7 px-2"
                                 >
                                   <Eye className="h-3 w-3 mr-1" />
                                   Preview
                                 </Button>
                               </div>
                             </div>

                             {/* Formatting Toolbar */}
                             <div className="flex items-center space-x-1 p-2 bg-slate-50 rounded-lg border">
                               <Button
                                 type="button"
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => insertFormatting('bold')}
                                 className="h-7 w-7 p-0"
                                 title="Bold"
                               >
                                 <Bold className="h-3 w-3" />
                               </Button>
                               <Button
                                 type="button"
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => insertFormatting('italic')}
                                 className="h-7 w-7 p-0"
                                 title="Italic"
                               >
                                 <Italic className="h-3 w-3" />
                               </Button>
                               <div className="w-px h-4 bg-slate-300 mx-1"></div>
                               <Button
                                 type="button"
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => insertFormatting('heading')}
                                 className="h-7 w-7 p-0"
                                 title="Heading"
                               >
                                 <Heading2 className="h-3 w-3" />
                               </Button>
                               <Button
                                 type="button"
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => insertFormatting('bullet')}
                                 className="h-7 w-7 p-0"
                                 title="Bullet Point"
                               >
                                 <List className="h-3 w-3" />
                               </Button>
                             </div>

                             {/* Content Input */}
                             {!showPreview ? (
                               <Textarea
                                 id="slide-content"
                                 value={editContent}
                                 onChange={(e) => setEditContent(e.target.value)}
                                 rows={12}
                                 className="w-full border-slate-200 focus:border-indigo-300 focus:ring-indigo-100 rounded-lg font-mono text-sm"
                                 placeholder="Enter slide content...

Use formatting:
## Heading
• Bullet point
**Bold text**
*Italic text*"
                               />
                             ) : (
                               /* Live Preview */
                               <div className="border border-slate-200 rounded-lg p-4 bg-white min-h-[200px]">
                                 <div className="space-y-2">
                                   {editTitle && (
                                     <h3 className="text-xl font-bold text-slate-900">{editTitle}</h3>
                                   )}
                                   {editSubtitle && (
                                     <h4 className="text-lg text-slate-600">{editSubtitle}</h4>
                                   )}
                                   {editContent ? (
                                     parseContentIntoBlocks(editContent).map((block, index) => (
                                       <div key={index}>
                                         {block.type === 'heading' ? (
                                           <h4 className="text-lg font-bold text-slate-800 mt-3 mb-1">
                                             {block.content}
                                           </h4>
                                         ) : block.type === 'bullet' ? (
                                           <div className="flex items-start space-x-2 ml-2">
                                             <span className="flex-shrink-0 w-1 h-1 bg-indigo-500 rounded-full mt-2"></span>
                                             <span className="text-sm text-slate-700">{block.content}</span>
                                           </div>
                                         ) : (
                                           <p className="text-sm text-slate-700 leading-relaxed">
                                             {/* Simple bold/italic parsing for preview */}
                                             {block.content.split(/(\*\*.*?\*\*|\*.*?\*)/).map((part, i) => {
                                               if (part.startsWith('**') && part.endsWith('**')) {
                                                 return <strong key={i}>{part.slice(2, -2)}</strong>;
                                               } else if (part.startsWith('*') && part.endsWith('*')) {
                                                 return <em key={i}>{part.slice(1, -1)}</em>;
                                               } else {
                                                 return part;
                                               }
                                             })}
                                           </p>
                                         )}
                                       </div>
                                     ))
                                   ) : (
                                     <p className="text-slate-400 text-sm italic">Content preview will appear here...</p>
                                   )}
                                 </div>
                               </div>
                             )}
                           </div>
                         </div>
                       </div>
                     ) : (
                       <div className="space-y-2 flex-1">
                         {/* Render AI-generated blocks if available */}
                         {currentSlide?.content?.blocks && currentSlide.content.blocks.length > 0 ? (
                           currentSlide.content.blocks.map((block, index) => (
                             <div key={index} className="group">
                               {block.type === 'heading' ? (
                                 <h4 className="text-xl font-bold text-slate-800 mb-2 pb-1 border-b border-slate-100">
                                   {block.content}
                                 </h4>
                               ) : block.type === 'bullet' ? (
                                 <div className="flex items-start space-x-3 py-0.5 px-2 rounded hover:bg-slate-50/50 transition-colors">
                                   <span className="flex-shrink-0 w-1.5 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-2"></span>
                                   <span className="text-base leading-relaxed text-slate-700">{block.content}</span>
                                 </div>
                               ) : (
                                 <p className="text-base leading-relaxed text-slate-700 py-0.5 px-2 rounded hover:bg-slate-50/50 transition-colors">
                                   {block.content}
                                 </p>
                               )}
                             </div>
                           ))
                         ) : (
                           /* Fallback to body content if no blocks */
                           <div className="space-y-1.5">
                             {currentSlide?.content?.body ? (
                               currentSlide.content.body.split('\n').filter(line => line.trim()).map((line, index) => {
                                 const trimmedLine = line.trim();
                                 if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                                   return (
                                     <div key={index} className="flex items-start space-x-3 py-0.5 px-2 rounded hover:bg-slate-50/50 transition-colors">
                                       <span className="flex-shrink-0 w-1.5 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-2"></span>
                                       <span className="text-base leading-relaxed text-slate-700">{trimmedLine.substring(1).trim()}</span>
                                     </div>
                                   );
                                 } else {
                                   return (
                                     <p key={index} className="text-base leading-relaxed text-slate-700 py-0.5 px-2 rounded hover:bg-slate-50/50 transition-colors">
                                       {trimmedLine}
                                     </p>
                                   );
                                 }
                               })
                             ) : (
                               <div className="flex items-center justify-center h-40 text-center">
                                 <div className="space-y-2">
                                   <div className="w-12 h-12 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                                     <AlertCircle className="h-6 w-6 text-slate-400" />
                                   </div>
                                   <p className="text-base text-slate-500 font-medium">No content available</p>
                                   <p className="text-sm text-slate-400">Click "Edit Slide" to add content</p>
                                 </div>
                               </div>
                             )}
                           </div>
                         )}
                       </div>
                     )}
                  </div>
                  
                  {/* Slide Footer */}
                  <div className="relative z-10 flex items-center justify-between pt-6 mt-auto border-t border-slate-100">
                    <div className="text-sm text-slate-400">
                      Slide {currentSlideIndex + 1} of {slides.length}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
                      <span>Pitch Perfect</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

                     {/* Enhanced Outline Reference Panel */}
           {currentSlideOutline && (
             <div className={cn(
               "bg-white border-l border-slate-200/80 shadow-xl transition-all duration-300 ease-out overflow-hidden",
               isOutlineReferenceOpen ? "w-80" : "w-0"
             )}>
              <div className="h-full flex flex-col">
                {/* Panel Header with Tabs */}
                <div className="border-b border-slate-200/60 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                      <h3 className="font-semibold text-slate-800">Slide Reference</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOutlineReferenceOpen(false)}
                      className="h-8 w-8 p-0 hover:bg-white/80 rounded-lg"
                    >
                      <X className="h-4 w-4 text-slate-600" />
                    </Button>
                  </div>
                  
                  {/* Tab Navigation */}
                  <div className="px-4 pb-2">
                    <div className="flex space-x-1 bg-white/50 rounded-lg p-1">
                      <button
                        onClick={() => setSidebarActiveTab('outline')}
                        className={cn(
                          "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                          sidebarActiveTab === 'outline'
                            ? "bg-white text-indigo-700 shadow-sm"
                            : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                        )}
                      >
                        Slide Outline
                      </button>
                      <button
                        onClick={() => setSidebarActiveTab('notes')}
                        className={cn(
                          "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                          sidebarActiveTab === 'notes'
                            ? "bg-white text-indigo-700 shadow-sm"
                            : "text-slate-600 hover:text-slate-800 hover:bg-white/50"
                        )}
                      >
                        Slide Notes
                      </button>
                    </div>
                  </div>
                </div>
                
                                 {/* Panel Content */}
                 <div className="p-3 overflow-y-auto flex-1 bg-gradient-to-b from-white to-slate-50/30">
                   {sidebarActiveTab === 'outline' && (
                     <div className="space-y-3 text-sm">
                       {currentSlideOutline ? (
                         <>
                           {/* Complete outline content */}
                           {currentSlideOutline.rawContent && (
                         <div className="text-slate-600 leading-snug space-y-2">
                           {currentSlideOutline.rawContent.split('\n').map((line: string, idx: number) => {
                             let trimmedLine = line.trim();
                             if (!trimmedLine) return <div key={idx} className="h-1" />;
                             
                             // Section headers
                             const sectionWithContentMatch = trimmedLine.match(/^\*+([^:]+):\*+\s*(.*)$/);
                             if (sectionWithContentMatch) {
                               const headerText = sectionWithContentMatch[1].trim();
                               const content = sectionWithContentMatch[2].trim();
                               
                               return (
                                 <div key={idx} className="bg-slate-50/50 rounded p-2">
                                   <div className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-1">
                                     {headerText}
                                   </div>
                                   {content && <div className="text-slate-600 text-xs">{content}</div>}
                                 </div>
                               );
                             }
                             
                             // Regular section headers
                             const sectionHeaderMatch = trimmedLine.match(/^\*+(.+?):\*+$/);
                             if (sectionHeaderMatch) {
                               const headerText = sectionHeaderMatch[1].trim();
                               return (
                                 <div key={idx} className="font-semibold text-slate-800 text-xs uppercase tracking-wide mt-2 mb-1">
                                   {headerText}:
                                 </div>
                               );
                             }
                             
                             // Bullet points
                             if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                               const bulletContent = trimmedLine.replace(/^[•\-]\s*/, '');
                               return (
                                 <div key={idx} className="flex items-start space-x-2 ml-2 mb-1">
                                   <span className="flex-shrink-0 w-1 h-1 bg-indigo-400 rounded-full mt-1.5"></span>
                                   <span className="flex-1 text-slate-600 text-xs leading-relaxed">{bulletContent}</span>
                                 </div>
                               );
                             }
                             
                             // Regular text
                             return (
                               <div key={idx} className="text-slate-600 text-xs mb-1">
                                 {trimmedLine}
                               </div>
                             );
                           })}
                         </div>
                       )}
                       
                           {/* Parsed sections fallback */}
                           {!currentSlideOutline.rawContent && (
                             <div className="space-y-3">
                               {[
                                 { key: 'purpose', label: 'Purpose', content: currentSlideOutline.purpose },
                                 { key: 'keyContent', label: 'Key Content', content: currentSlideOutline.keyContent },
                                 { key: 'supportingEvidence', label: 'Supporting Evidence', content: currentSlideOutline.supportingEvidence },
                                 { key: 'keyTakeaway', label: 'Key Takeaway', content: currentSlideOutline.keyTakeaway },
                                 { key: 'strategicFraming', label: 'Strategic Framing', content: currentSlideOutline.strategicFraming },
                                 { key: 'visualRecommendation', label: 'Visual Recommendation', content: currentSlideOutline.visualRecommendation }
                               ].filter(section => section.content).map(section => (
                                 <div key={section.key} className="bg-white rounded border border-slate-200/50 p-2">
                                   <div className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-1">
                                     {section.label}
                                   </div>
                                   <div className="text-slate-600 leading-snug">
                                     {Array.isArray(section.content) ? (
                                       <ul className="space-y-0.5">
                                         {section.content.map((item: string, idx: number) => (
                                           <li key={idx} className="flex items-start space-x-2">
                                             <span className="flex-shrink-0 w-1 h-1 bg-indigo-400 rounded-full mt-1.5"></span>
                                             <span className="text-xs">{item}</span>
                                           </li>
                                         ))}
                                       </ul>
                                     ) : (
                                       <div className="whitespace-pre-wrap text-xs">{String(section.content)}</div>
                                     )}
                                   </div>
                                 </div>
                               ))}
                             </div>
                           )}
                         </>
                       ) : (
                         <div className="text-center py-8">
                           <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-xl flex items-center justify-center">
                             <Info className="h-6 w-6 text-slate-400" />
                           </div>
                           <p className="text-slate-500 text-xs">No slide outline available</p>
                           <p className="text-slate-400 text-xs mt-1">Outline will appear here when available</p>
                         </div>
                       )}
                     </div>
                   )}

                   {sidebarActiveTab === 'notes' && (
                     <div className="space-y-3 text-sm">
                       {currentSlide?.content?.body ? (
                         <div className="bg-white rounded-lg border border-slate-200/50 p-3">
                           <div className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap">
                             {currentSlide.content.body}
                           </div>
                         </div>
                       ) : (
                         <div className="text-center py-8">
                           <div className="w-12 h-12 mx-auto mb-3 bg-slate-100 rounded-xl flex items-center justify-center">
                             <Info className="h-6 w-6 text-slate-400" />
                           </div>
                           <p className="text-slate-500 text-xs">No slide notes available</p>
                           <p className="text-slate-400 text-xs mt-1">Notes will appear here if available</p>
                         </div>
                       )}
                     </div>
                   )}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Update the DocumentGeneration component to show generated slides in a carousel
const DocumentGeneration = ({ createdPitchId, loadedPitchData, setActiveStep, refreshPitchData }: DocumentGenerationProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string>('');
  const [isLoadingSlides, setIsLoadingSlides] = useState(false);
  const [selectedSlides, setSelectedSlides] = useState<Record<number, boolean>>({});
  const [generatedSlideCount, setGeneratedSlideCount] = useState(0);
  const [initialParsingDone, setInitialParsingDone] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle refresh data
  const handleRefreshData = async () => {
    if (!createdPitchId) return;
    setIsRefreshing(true);
    try {
      await refreshPitchData(createdPitchId);
      toast({
        title: "Data Refreshed",
        description: "Slide data has been refreshed successfully.",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      toast({
        title: "Error",
        description: "Failed to refresh slide data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  // Handle slide updates
  const handleSlideUpdate = async (slideIndex: number, updatedSlide: AISlideContent) => {
    if (!loadedPitchData?.slides) return;
    
    const newSlides = [...loadedPitchData.slides];
    newSlides[slideIndex] = updatedSlide;
    
    // Save to Firestore
    if (createdPitchId) {
      try {
        const pitchDocRef = doc(db, "pitches", createdPitchId);
        await updateDoc(pitchDocRef, {
          slides: newSlides,
          lastUpdatedAt: serverTimestamp(),
        });
        
        toast({
          title: "Slide Updated",
          description: "Your changes have been saved.",
        });
      } catch (error) {
        console.error("Error saving slide update:", error);
        toast({
          title: "Error",
          description: "Failed to save slide changes.",
          variant: "destructive",
        });
      }
    }
  };

  // Other functions remain unchanged...
  const handleContinueToEditDeck = async () => {
    /* ... existing function ... */
  };
  
  const handleBackToSlideCreation = () => {
    /* ... existing function ... */
  };
  

  
  const parseOutlineToSlides = (outline: string): AISlideContent[] => {
    if (!outline) {
      console.warn("No outline provided to parse slides from");
      return [];
    }
    
    console.log("Starting to parse outline...");
    
    const slides: AISlideContent[] = [];
    
    // Heading-based regex pattern for slides
    const headingRegex = /#+\s*(?:Slide\s*)?(\d+)[:\-–—.]?\s*(.+?)(?=\n|$)([\s\S]*?)(?=\n#+\s*(?:Slide\s*)?\d+[:\-–—.]?\s*|$)/gi;
    
    // List format regex (1. Slide Title)
    const listFormatRegex = /(?:^|\n)(\d+)[.\)]\s+(.+?)(?=\n|$)([\s\S]*?)(?=\n\d+[.\)]\s+|$)/g;
    
    // Fallback regex to identify potential slide numbers
    const fallbackRegex = /(?:^|\n)(?:slide|section)\s*(\d+)(?:[:\-–—.])?\s*(.+?)(?=\n|$)([\s\S]*?)(?=\n(?:slide|section)\s*\d+|$)/gi;
    
    // Try heading-based pattern first
    const slideMatches = [];
    let match;
    
    while ((match = headingRegex.exec(outline)) !== null) {
      slideMatches.push(match);
    }
    
    // If no matches, try list format
    if (slideMatches.length === 0) {
      // Reset regex index
      listFormatRegex.lastIndex = 0;
      while ((match = listFormatRegex.exec(outline)) !== null) {
        slideMatches.push(match);
      }
    }
    
    // If still no matches, try fallback pattern
    if (slideMatches.length === 0) {
      // Reset regex index
      fallbackRegex.lastIndex = 0;
      while ((match = fallbackRegex.exec(outline)) !== null) {
        slideMatches.push(match);
      }
    }
    
    console.log(`Found ${slideMatches.length} slide matches in the outline`);
    
    // Process the matches into slides
    for (const match of slideMatches) {
      const slideNumber = parseInt(match[1]);
      const slideTitle = match[2].trim();
      const slideContent = match[3] ? match[3].trim() : '';
      
      console.log(`Processed slide ${slideNumber}: ${slideTitle}`);
      
      const slideType = determineSlideType(slideTitle);
      
      slides.push({
        id: `slide-${slideNumber}`,
        type: slideType,
        content: {
          title: slideTitle,
          body: slideContent,
          blocks: parseContentIntoBlocks(slideContent)
        }
      });
    }
    
    // If we have some slides but less than 14, create placeholder slides
    if (slides.length > 0 && slides.length < 14) {
      console.log(`Creating placeholder slides to reach 14 (currently have ${slides.length})`);
      
      // Sort slides by number
      slides.sort((a, b) => {
        const aNum = parseInt((a.id || '').replace('slide-', '') || '0');
        const bNum = parseInt((b.id || '').replace('slide-', '') || '0');
        return aNum - bNum;
      });
      
      // Fill in missing slides
      for (let i = 1; i <= 14; i++) {
        const slideExists = slides.some(slide => {
          const slideNum = parseInt((slide.id || '').replace('slide-', '') || '0');
          return slideNum === i;
        });
        
        if (!slideExists) {
          const slideType = i === 1 ? 'title' : i === 14 ? 'closing' : 'content';
          slides.push({
            id: `slide-${i}`,
            type: slideType,
            content: {
              title: `Slide ${i}`,
              body: 'Content to be added',
              blocks: []
            }
          });
          console.log(`Added placeholder for slide ${i}`);
        }
      }
      
      // Re-sort to ensure correct order
      slides.sort((a, b) => {
        const aNum = parseInt((a.id || '').replace('slide-', '') || '0');
        const bNum = parseInt((b.id || '').replace('slide-', '') || '0');
        return aNum - bNum;
      });
    }
    
    return slides;
  };
  
  const determineSlideType = (title: string): SlideType => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('cover') || 
        titleLower.includes('title') || 
        titleLower.includes('introduction') || 
        titleLower.includes('overview')) {
      return 'title';
    } else if (titleLower.includes('conclusion') || 
               titleLower.includes('next steps') || 
               titleLower.includes('thank you')) {
      return 'closing';
    } else if (titleLower.includes('table') || 
               titleLower.includes('comparison')) {
      return 'table';
    } else if (titleLower.includes('chart') || 
               titleLower.includes('graph') || 
               titleLower.includes('data')) {
      return 'chart';
    } else {
      return 'content';
    }
  };
  
  const toggleSlideSelection = (slideNumber: number) => {
    setSelectedSlides(prev => ({
      ...prev,
      [slideNumber]: !prev[slideNumber]
    }));
  };
  
  const selectAllSlides = () => {
    const allSelected: Record<number, boolean> = {};
    if (loadedPitchData?.slides) {
      loadedPitchData.slides.forEach((_, index) => {
        allSelected[index + 1] = true;
      });
    }
    setSelectedSlides(allSelected);
  };
  
  const clearSelection = () => {
    setSelectedSlides({});
  };
  
  const generateContent = async () => {
    if (!createdPitchId || !loadedPitchData) return;
    
    setIsGenerating(true);
    setIsLoadingSlides(true);
    
    try {
      // Use the enhanced AI agent for slide generation
      console.log("Starting enhanced AI slide generation...");
      
      // Parse slide outlines from the initial outline if available
      const slideOutlines = loadedPitchData.slideOutlines || 
        (loadedPitchData.initialOutline ? parseOutlineToSlideOutlines(loadedPitchData.initialOutline) : []);
      
      if (slideOutlines.length === 0) {
        toast({
          title: "No slide outlines found",
          description: "Could not find slide outlines. Please ensure the outline step is completed.",
          variant: "destructive",
        });
        return;
      }
      
      // Prepare pitch context for the agent
      const pitchContext = {
        clientDetails: loadedPitchData.researchData?.clientDetails,
        competitorDetails: loadedPitchData.researchData?.competitorDetails,
        additionalContext: loadedPitchData.additionalContext,
        uploadedFiles: loadedPitchData.uploadedFiles,
        dataSourcesSelected: loadedPitchData.dataSourcesSelected
      };
      
      // Prepare input for the enhanced slide generation agent
      const slideGenerationInput = {
        pitchId: createdPitchId,
        clientName: loadedPitchData.clientName,
        clientId: loadedPitchData.clientId,
        pitchStage: loadedPitchData.pitchStage,
        slideOutlines: slideOutlines,
        pitchContext: pitchContext
      };
      
      // Sanitize the input to remove Firestore Timestamp objects
      const sanitizedSlideGenerationInput = sanitizeForServer(slideGenerationInput);
      
      // Call the enhanced AI agent via server action
      const result = await generateSlidesServerAction(sanitizedSlideGenerationInput);
      
      if (!result.success) {
        console.error("Enhanced slide generation failed:", result.error);
        toast({
          title: "AI Slide Generation Failed",
          description: "There was an error generating slides with AI. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      console.log(`Enhanced AI generated ${result.result?.slides?.length || 0} slides`);
      
      toast({
        title: "AI Slides Generated",
        description: `${result.result?.slides?.length || 0} high-quality slides have been generated using AI.`,
      });
      
      // Update the UI
      setGeneratedSlideCount(result.result?.slides?.length || 0);
      
      // Call refreshPitchData to update the parent component's state
      await refreshPitchData(createdPitchId);
      
    } catch (error) {
      console.error("Error in enhanced slide generation:", error);
      toast({
        title: "Failed to generate slides",
        description: "There was an error generating slides with AI. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setIsLoadingSlides(false);
      setInitialParsingDone(true);
    }
  };
  
  const getSlideDescription = (slide: any) => {
    if (slide.content?.body) {
      return slide.content.body.substring(0, 60) + (slide.content.body.length > 60 ? '...' : '');
    } else if (slide.content?.blocks && slide.content.blocks.length > 0) {
      return `${slide.content.blocks.length} content blocks`;
    } else {
      return 'No content';
    }
  };
  
  const handlePresentationComplete = async (updatedSlides: any[]) => {
    if (!createdPitchId) return;
    
    try {
      // Save updated slides to Firestore
      const db = getFirestore();
      const pitchDocRef = doc(db, "pitches", createdPitchId);
      
      await updateDoc(pitchDocRef, {
        slides: updatedSlides,
        lastUpdatedAt: serverTimestamp(),
      });
      
      toast({
        title: "Pitch deck saved",
        description: "Your changes have been saved.",
      });
      
    } catch (error) {
      console.error("Error saving updated slides:", error);
      toast({
        title: "Failed to save",
        description: "There was an error saving your changes.",
        variant: "destructive",
      });
    }
  };

  // Show loading state while processing slides
  if (isLoadingSlides) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-12 w-12 mx-auto mb-4 text-indigo-600 animate-spin" />
          <h3 className="text-lg font-medium text-indigo-800">Processing Slides</h3>
          <p className="text-sm text-slate-600 mt-2">Creating slides from your outline...</p>
        </div>
      </div>
    );
  }

  // Error state if no slides could be generated
  if (!loadedPitchData?.slides || loadedPitchData.slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-50/50">
        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">No Slides Found</h3>
        <p className="text-slate-600 text-center max-w-md mb-6">
          No slides could be automatically generated from your outline. 
          Click the button below to generate slides now.
        </p>
        <div className="flex gap-4">
          <Button
            onClick={() => setActiveStep('outline')}
            variant="outline"
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Outline
          </Button>
          <Button 
            onClick={generateContent}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Slides
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Show the simple slide carousel interface
  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header with title and controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Build Pitch Deck</h2>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline"
            onClick={handleRefreshData}
            className="flex items-center"
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh Slides
          </Button>
          <Button 
            variant="outline"
            onClick={() => setActiveStep('outline')}
            className="flex items-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Outline
          </Button>
        </div>
      </div>

      {/* Enhanced slide carousel with sidebar */}
      <div className="flex-1 overflow-hidden">
        <SlideCarousel 
          slides={loadedPitchData?.slides || []} 
          onSlideUpdate={handleSlideUpdate}
          loadedPitchData={loadedPitchData}
        />
      </div>
    </div>
  );
};

// Legacy component removed - using simple SlideCarousel instead

// PitchPreparation component removed - using simple DocumentGeneration with SlideCarousel instead

const PitchReflection = () => <div className="p-4 text-muted-foreground">Pitch Reflection Placeholder...</div>;

// --- Workflow Steps Configuration (Now after OutlineCanvas) ---

const workflowSteps = [
  { id: 'setup' as WorkflowStepId, title: "Setup", component: PitchFramingForm },
  { id: 'context' as WorkflowStepId, title: "Context", component: PitchFramingForm },
  { id: 'slideStructure' as WorkflowStepId, title: "Slide Structure", component: SlideStructureEditor },
  { id: 'outline' as WorkflowStepId, title: "Build Outline", component: OutlineCanvas },
  { id: 'buildDeck' as WorkflowStepId, title: 'Build Pitch Deck', component: DocumentGeneration },
  { id: 'reflect' as WorkflowStepId, title: 'Pitch Review', component: PitchReflection },
];

// --- Main Page Component ---
function NewPitchPageContent() {
  const [threadIdFromUrl, setThreadIdInUrl] = useQueryState("pitchId");
  const [activeStep, setActiveStep] = useState<WorkflowStepId>(workflowSteps[0].id);
  const [createdPitchId, setCreatedPitchId] = useState<string | null>(threadIdFromUrl ?? null);
  const [currentLangGraphThreadId, setCurrentLangGraphThreadId] = useState<string | null>(null);
  const [loadedPitchData, setLoadedPitchData] = useState<PitchDocumentData | null>(null);
  const [isLoadingPitchData, setIsLoadingPitchData] = useState<boolean>(false);
  const [pitchStages, setPitchStages] = useState<PitchStage[]>([]);
  
  // Add user context to pass down to Canvas
  const { user, loading: userLoading } = useUserContext();
  


  // Function to fetch and update loadedPitchData
  const refreshPitchData = async (pitchId: string | null) => {
    if (!pitchId) return;
    console.log(`[NewPitchPage] Refreshing data for pitch ID: ${pitchId}`);
    setIsLoadingPitchData(true);
    try {
      const pitchDocRef = doc(db, "pitches", pitchId);
      const pitchDocSnap = await getDoc(pitchDocRef);
      if (pitchDocSnap.exists()) {
        const data = pitchDocSnap.data() as PitchDocumentData;
        setLoadedPitchData(data);
        // Optionally update LangGraphThreadId if it changed, though unlikely here
        if(data.langGraphThreadId) {
            setCurrentLangGraphThreadId(data.langGraphThreadId);
        }
        console.log("[NewPitchPage] Data refreshed:", data);
      } else {
        console.warn(`[NewPitchPage] Pitch ID ${pitchId} not found during refresh.`);
        setLoadedPitchData(null); // Clear data if not found
      }
    } catch (error) {
      console.error("[NewPitchPage] Error refreshing pitch data:", error);
      setLoadedPitchData(null); // Clear on error
      toast({ title: "Error Loading Pitch", description: "Could not reload pitch data.", variant: "destructive" });
    } finally {
      setIsLoadingPitchData(false);
    }
  };

  const handlePitchCreated = (firestoreId: string, langGraphId: string) => {
    console.log(`Pitch Created/Saved: Firestore ID: ${firestoreId}, LangGraph ID: ${langGraphId}`);
    setCreatedPitchId(firestoreId);
    setCurrentLangGraphThreadId(langGraphId);
    setThreadIdInUrl(firestoreId);
    setLoadedPitchData(null); // Clear old data
    refreshPitchData(firestoreId); // Fetch the newly created/updated data immediately
  };

  // Load pitch stages on component mount
  useEffect(() => {
    const fetchPitchStages = async () => {
      try {
        const stages = await pitchStagesService.getAll();
        // Sort by order to ensure consistent display
        const sortedStages = stages.sort((a, b) => a.order - b.order);
        setPitchStages(sortedStages);
      } catch (error) {
        console.error("Error fetching pitch stages:", error);
        // Fallback to hardcoded stages if Firebase fails
        setPitchStages([
          { id: "stage1", name: "Initial Engagement / Prospecting", description: "", order: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { id: "stage2", name: "Needs Assessment / Exploration", description: "", order: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { id: "stage3", name: "RFP Response", description: "", order: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { id: "stage4", name: "Proposal / Pitch Presentation", description: "", order: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() },
          { id: "stage5", name: "Evaluation / Negotiation", description: "", order: 5, isActive: true, createdAt: new Date(), updatedAt: new Date() },
        ]);
      }
    };
    fetchPitchStages();
  }, []);

  // useEffect for initial load from URL
  useEffect(() => {
    if (threadIdFromUrl) {
      refreshPitchData(threadIdFromUrl); // Use refresh function for initial load
      // If we have a pitch ID from the URL, default to the context step
      setActiveStep(createdPitchId ? 'context' : 'setup');
    } else {
      setActiveStep('setup');
      setCreatedPitchId(null);
      setCurrentLangGraphThreadId(null);
      setLoadedPitchData(null);
    }
  }, [threadIdFromUrl]); // Simplified dependency

  // useEffect to sync createdPitchId back to URL (keep this)
  useEffect(() => {
    if (createdPitchId && createdPitchId !== threadIdFromUrl) {
      console.log(`Syncing createdPitchId (${createdPitchId}) to URL.`);
      setThreadIdInUrl(createdPitchId);
    }
    if (createdPitchId === null && threadIdFromUrl !== null) {
       console.log(`Syncing null createdPitchId to URL.`);
       setThreadIdInUrl(null);
    }
  }, [createdPitchId, threadIdFromUrl, setThreadIdInUrl]);

  // Get current step component
  const ActiveStepConfig = workflowSteps.find(step => step.id === activeStep);
  const ActiveComponent: React.FC<any> = ActiveStepConfig?.component || PitchFramingForm;
  const activeStepTitle = ActiveStepConfig?.title || "Pitch Creation";

  // Get display names for header
  const displayClientName = loadedPitchData?.clientName;
  const displayPitchStage = loadedPitchData?.pitchStage ? 
    (() => {
      // Try to find the stage name from configurable stages first
      const stage = pitchStages.find(s => s.id === loadedPitchData.pitchStage);
      if (stage) return stage.name;
      
      // Fallback to hardcoded names for backward compatibility
      const fallbackNames: Record<string, string> = {
        stage1: "Initial Engagement / Prospecting",
        stage2: "Needs Assessment / Exploration", 
        stage3: "RFP Response",
        stage4: "Proposal / Pitch Presentation",
        stage5: "Evaluation / Negotiation",
      };
      return fallbackNames[loadedPitchData.pitchStage] || loadedPitchData.pitchStage;
    })() : null;

  // Common props for the PitchFramingForm
  const commonPitchFramingProps = {
    onPitchCreated: handlePitchCreated,
    createdPitchId,
    setActiveStep,
    loadedPitchData,
    refreshPitchData: () => refreshPitchData(createdPitchId),
    onThreadIdUpdate: setCurrentLangGraphThreadId,
    pitchStages
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header Section */}
      <div className="relative w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 pb-2">
        {/* Taller top gradient bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-60" />
        
        {/* Main Header Content Area */}
        <div className="relative px-8 py-6">
          <div className="flex justify-between items-center">
              <h1 className="text-3xl font-semibold text-white">Pitch Builder</h1>
              
              {/* Workflow Steps - Compact, Horizontal, Top Right */}
              <div className="flex items-center bg-white/20 rounded-md shadow-sm overflow-hidden">
                {workflowSteps.map((step, index) => {
                  // Determine if this step should be disabled
                  const isDisabled = step.id !== 'setup' && !createdPitchId;
                  
                  return (
                    <Button
                      key={step.id}
                      variant="ghost"
                      disabled={isDisabled}
                      aria-current={activeStep === step.id ? "step" : undefined}
                      onClick={() => {
                        if (!isDisabled) {
                          setActiveStep(step.id);
                        }
                      }}
                      className={cn(
                        "h-9 px-2 py-1 text-xs font-medium rounded-none border-r border-white/10 last:border-r-0",
                        activeStep === step.id
                          ? 'bg-white/30 text-white font-semibold'
                          : 'text-white/80 hover:text-white hover:bg-white/10',
                        isDisabled ? 'opacity-50 cursor-not-allowed' : '',
                      )}
                    >
                      {step.title}
                    </Button>
                  );
                })}
              </div>
          </div>

          {/* Integrated Pitch Details */}
          {createdPitchId && (displayClientName || displayPitchStage) && (
            <div className="mt-2 flex items-center space-x-4 text-sm">
               {/* Client */} 
               {displayClientName && (
                  <div className="flex items-center space-x-1.5">
                    <User className="h-4 w-4 text-white flex-shrink-0"/>
                    <span className="font-medium text-slate-300">{displayClientName}</span>
                  </div>
                )}
                {/* Separator */}
                {(displayClientName || displayPitchStage) && (
                  <span className="text-slate-300/60">|</span> 
                )}
                {/* Stage */} 
                {displayPitchStage && (
                   <div className="flex items-center space-x-1.5">
                    <Clock className="h-4 w-4 text-slate-200 flex-shrink-0"/>
                    <span className="text-slate-300">{displayPitchStage}</span>
                  </div>
                )}
                {/* Separator */}
                {(displayClientName || displayPitchStage) && (
                  <span className="text-slate-300/60">|</span> 
                )}
                {/* Pitch ID (Moved here, pushed right) */} 
                <div className="ml-auto text-right">
                  <p className="text-slate-300">ID: {createdPitchId}</p>
                </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 pb-8 mt-6 px-12">
        {isLoadingPitchData && !loadedPitchData ? (
           <div className="flex items-center justify-center p-10">
                <Loader2 className="h-8 w-8 mr-2 animate-spin text-indigo-600" />
                <span className="text-slate-600">Loading pitch data...</span>
            </div>
        ) : (
          <>
            {activeStep === 'setup' && (
              <PitchFramingForm 
                {...commonPitchFramingProps} 
                activeStepId="setup" 
              />
            )}
            {activeStep === 'context' && (
              <PitchFramingForm 
                {...commonPitchFramingProps} 
                activeStepId="context" 
              />
            )}
            {activeStep === 'slideStructure' && (
              <SlideStructureEditor
                createdPitchId={createdPitchId}
                loadedPitchData={loadedPitchData}
                setActiveStep={setActiveStep}
                refreshPitchData={() => refreshPitchData(createdPitchId)}
                pitchStages={pitchStages}
              />
            )}
            {activeStep === 'outline' && (
              <OutlineCanvas 
                createdPitchId={createdPitchId} 
                langGraphThreadId={currentLangGraphThreadId} 
                loadedPitchData={loadedPitchData}
                setActiveStep={setActiveStep}
                refreshPitchData={refreshPitchData}
                user={user}
              />
            )}
            {activeStep === 'buildDeck' && (
              <div className="w-full">
                <DocumentGeneration
                  createdPitchId={createdPitchId}
                  loadedPitchData={loadedPitchData}
                  setActiveStep={setActiveStep}
                  refreshPitchData={refreshPitchData}
                />
              </div>
            )}
            {/* prepare step removed - using buildDeck directly */}
            {activeStep === 'reflect' && <PitchReflection />}
          </>
        )}
      </div>
    </div>
  );
}

const NewPitchPageContentDynamic = dynamicImport(() => Promise.resolve(NewPitchPageContent), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export default function NewPitchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewPitchPageContentDynamic />
    </Suspense>
  );
} 