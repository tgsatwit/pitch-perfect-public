"use client";

import { useState, useEffect } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FirebaseDoc, PitchDocumentData } from '@/types/pitch';
import type { FormState, CompetitorState, DataSourcesState } from '../types';

export const usePitchForm = (loadedPitchData?: PitchDocumentData | null) => {
  // Client state
  const [clients, setClients] = useState<FirebaseDoc[]>([]);
  const [clientsLoading, setClientsLoading] = useState(true);
  const [clientsError, setClientsError] = useState<string | null>(null);

  // Competitor state
  const [competitors, setCompetitors] = useState<FirebaseDoc[]>([]);
  const [competitorsLoading, setCompetitorsLoading] = useState(true);
  const [competitorsError, setCompetitorsError] = useState<string | null>(null);
  const [knownCompetitors, setKnownCompetitors] = useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = useState("");
  const [selectedCompetitorsFromList, setSelectedCompetitorsFromList] = useState<Record<string, boolean>>({});
  const [competitorDetailedData, setCompetitorDetailedData] = useState<Record<string, any>>({});

  // Form state
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedClientName, setSelectedClientName] = useState<string>("");
  const [pitchStage, setPitchStage] = useState<string>("");
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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

  // Data sources state
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

  // Initialize form state from loaded data
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

      // Load data source selections
      if (loadedPitchData.dataSourcesSelected && Object.keys(loadedPitchData.dataSourcesSelected).length > 0) {
        setDataSourcesSelected(loadedPitchData.dataSourcesSelected);
      }
      if (loadedPitchData.subDataSourcesSelected && loadedPitchData.subDataSourcesSelected.length > 0) {
        const initialSubChecks: Record<string, boolean> = {};
        Object.keys(subDataSourceChecks).forEach(key => { initialSubChecks[key] = false; });
        loadedPitchData.subDataSourcesSelected.forEach(key => { initialSubChecks[key] = true; });
        setSubDataSourceChecks(initialSubChecks);
      }
    }
  }, [loadedPitchData]);

  // Fetch clients
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

  // Fetch competitors
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
    
    // TODO: Implement detailed competitor information fetching
    // This would be moved to a separate service/hook
  };

  return {
    // State
    clients,
    clientsLoading,
    clientsError,
    competitors,
    competitorsLoading,
    competitorsError,
    knownCompetitors,
    newCompetitor,
    selectedCompetitorsFromList,
    competitorDetailedData,
    selectedClientId,
    selectedClientName,
    pitchStage,
    sentiment,
    importantClientInfo,
    importantToClient,
    ourAdvantages,
    competitorStrengths,
    pitchFocus,
    relevantCaseStudies,
    keyMetrics,
    implementationTimeline,
    expectedROI,
    filesToUpload,
    clientDetailedData,
    isSaving,
    saveError,
    ignoreSections,
    dataSourcesSelected,
    subDataSourceChecks,
    uploadModalOpen,

    // Setters
    setKnownCompetitors,
    setNewCompetitor,
    setSelectedCompetitorsFromList,
    setCompetitorDetailedData,
    setSelectedClientId,
    setSelectedClientName,
    setPitchStage,
    setSentiment,
    setImportantClientInfo,
    setImportantToClient,
    setOurAdvantages,
    setCompetitorStrengths,
    setPitchFocus,
    setRelevantCaseStudies,
    setKeyMetrics,
    setImplementationTimeline,
    setExpectedROI,
    setFilesToUpload,
    setClientDetailedData,
    setIsSaving,
    setSaveError,
    setIgnoreSections,
    setDataSourcesSelected,
    setSubDataSourceChecks,
    setUploadModalOpen,

    // Handlers
    handleAddCompetitor,
    handleCompetitorCheckboxChange,
  };
};