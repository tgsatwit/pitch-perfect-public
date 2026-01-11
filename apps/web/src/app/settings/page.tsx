"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ArrowUp, 
  ArrowDown,
  Loader2,
  RefreshCw,
  Upload,
  Download,
  AlertTriangle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  PitchStage,
  SlideStructure,
  KeyPrinciple,
  CreatePitchStageRequest,
  UpdatePitchStageRequest,
  CreateSlideStructureRequest,
  UpdateSlideStructureRequest,
  CreateKeyPrincipleRequest,
  UpdateKeyPrincipleRequest
} from '@/types/settings';
import {
  pitchStagesService,
  slideStructuresService,
  keyPrinciplesService
} from '@/services/settingsService';
import { SettingsInitializer } from '@/services/settingsInitializer';
import { SettingsService } from '../../../../agents/src/services/settingsService';

export default function SettingsPage() {
  // State management
  const [pitchStages, setPitchStages] = useState<PitchStage[]>([]);
  const [slideStructures, setSlideStructures] = useState<SlideStructure[]>([]);
  const [keyPrinciples, setKeyPrinciples] = useState<KeyPrinciple[]>([]);
  const [selectedPitchStageId, setSelectedPitchStageId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);

  // Dialog states
  const [pitchStageDialog, setPitchStageDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    data?: PitchStage;
  }>({ open: false, mode: 'create' });

  const [slideStructureDialog, setSlideStructureDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    data?: SlideStructure;
  }>({ open: false, mode: 'create' });

  const [keyPrincipleDialog, setKeyPrincipleDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    data?: KeyPrinciple;
  }>({ open: false, mode: 'create' });

  // Form states
  const [pitchStageForm, setPitchStageForm] = useState<CreatePitchStageRequest>({
    name: '',
    description: '',
    order: 1
  });

  const [slideStructureForm, setSlideStructureForm] = useState<CreateSlideStructureRequest>({
    pitchStageId: '',
    title: '',
    description: '',
    order: 1,
    isRequired: true
  });

  const [keyPrincipleForm, setKeyPrincipleForm] = useState<CreateKeyPrincipleRequest>({
    title: '',
    description: '',
    order: 1
  });

  // Load data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  // Set selected pitch stage to first one when stages load
  useEffect(() => {
    if (pitchStages.length > 0 && !selectedPitchStageId) {
      setSelectedPitchStageId(pitchStages[0].id);
    }
  }, [pitchStages, selectedPitchStageId]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [stagesData, structuresData, principlesData] = await Promise.all([
        pitchStagesService.getAll(),
        slideStructuresService.getAll(),
        keyPrinciplesService.getAll()
      ]);
      
      setPitchStages(stagesData);
      setSlideStructures(structuresData);
      setKeyPrinciples(principlesData);
    } catch (error) {
      console.error('Error loading settings data:', error);
      toast({
        title: "Error",
        description: "Failed to load settings data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeSettings = async () => {
    setInitializing(true);
    try {
      const result = await SettingsInitializer.initializeAllSettings();
      
      if (result.pitchStagesCreated === 0) {
        toast({
          title: "Settings Already Exist",
          description: "Settings have already been initialized.",
        });
      } else {
        toast({
          title: "Settings Initialized",
          description: `Created ${result.pitchStagesCreated} pitch stages, ${result.slideStructuresCreated} slide structures, and ${result.keyPrinciplesCreated} key principles.`,
        });
        await loadAllData();
      }
    } catch (error) {
      console.error('Error initializing settings:', error);
      toast({
        title: "Error",
        description: "Failed to initialize settings.",
        variant: "destructive",
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleResetSettings = async () => {
    setInitializing(true);
    try {
      const result = await SettingsInitializer.resetAllSettings();
      toast({
        title: "Settings Reset",
        description: `Reset and recreated ${result.pitchStagesCreated} pitch stages, ${result.slideStructuresCreated} slide structures, and ${result.keyPrinciplesCreated} key principles.`,
      });
      await loadAllData();
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast({
        title: "Error",
        description: "Failed to reset settings.",
        variant: "destructive",
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleLoadFallbackPitchStages = async () => {
    setInitializing(true);
    try {
      const fallbackStages = SettingsService.getFallbackPitchStages();
      let createdCount = 0;
      
      for (const stage of fallbackStages) {
        try {
          await pitchStagesService.create({
            name: stage.name,
            description: stage.description,
            order: stage.order
          });
          createdCount++;
        } catch (error) {
          console.warn(`Failed to create stage ${stage.name}:`, error);
        }
      }
      
      toast({
        title: "Fallback Pitch Stages Loaded",
        description: `Created ${createdCount} pitch stages from fallback template.`,
      });
      await loadAllData();
    } catch (error) {
      console.error('Error loading fallback pitch stages:', error);
      toast({
        title: "Error",
        description: "Failed to load fallback pitch stages.",
        variant: "destructive",
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleLoadFallbackSlideStructures = async () => {
    if (!selectedPitchStageId) {
      toast({
        title: "No Pitch Stage Selected",
        description: "Please select a pitch stage first.",
        variant: "destructive",
      });
      return;
    }

    setInitializing(true);
    try {
      const fallbackStructures = SettingsService.getFallbackSlideStructures();
      let createdCount = 0;
      
      for (const structure of fallbackStructures) {
        try {
          await slideStructuresService.create({
            pitchStageId: selectedPitchStageId,
            title: structure.title,
            description: structure.description,
            order: structure.order,
            isRequired: structure.isRequired
          });
          createdCount++;
        } catch (error) {
          console.warn(`Failed to create slide structure ${structure.title}:`, error);
        }
      }
      
      toast({
        title: "Fallback Slide Structures Loaded",
        description: `Created ${createdCount} slide structures from fallback template.`,
      });
      await loadAllData();
    } catch (error) {
      console.error('Error loading fallback slide structures:', error);
      toast({
        title: "Error",
        description: "Failed to load fallback slide structures.",
        variant: "destructive",
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleLoadFallbackKeyPrinciples = async () => {
    setInitializing(true);
    try {
      const fallbackPrinciples = SettingsService.getFallbackKeyPrinciples();
      let createdCount = 0;
      
      for (const principle of fallbackPrinciples) {
        try {
          await keyPrinciplesService.create({
            title: principle.title,
            description: principle.description,
            order: principle.order
          });
          createdCount++;
        } catch (error) {
          console.warn(`Failed to create key principle ${principle.title}:`, error);
        }
      }
      
      toast({
        title: "Fallback Key Principles Loaded",
        description: `Created ${createdCount} key principles from fallback template.`,
      });
      await loadAllData();
    } catch (error) {
      console.error('Error loading fallback key principles:', error);
      toast({
        title: "Error",
        description: "Failed to load fallback key principles.",
        variant: "destructive",
      });
    } finally {
      setInitializing(false);
    }
  };

  // Pitch Stage CRUD operations
  const handleCreatePitchStage = async () => {
    setSaving(true);
    try {
      await pitchStagesService.create(pitchStageForm);
      toast({
        title: "Success",
        description: "Pitch stage created successfully.",
      });
      setPitchStageDialog({ open: false, mode: 'create' });
      setPitchStageForm({ name: '', description: '', order: pitchStages.length + 1 });
      await loadAllData();
    } catch (error) {
      console.error('Error creating pitch stage:', error);
      toast({
        title: "Error",
        description: "Failed to create pitch stage.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePitchStage = async () => {
    if (!pitchStageDialog.data) return;
    
    setSaving(true);
    try {
      const updateData: UpdatePitchStageRequest = {
        name: pitchStageForm.name,
        description: pitchStageForm.description,
        order: pitchStageForm.order
      };
      
      await pitchStagesService.update(pitchStageDialog.data.id, updateData);
      toast({
        title: "Success",
        description: "Pitch stage updated successfully.",
      });
      setPitchStageDialog({ open: false, mode: 'create' });
      await loadAllData();
    } catch (error) {
      console.error('Error updating pitch stage:', error);
      toast({
        title: "Error",
        description: "Failed to update pitch stage.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePitchStage = async (id: string) => {
    try {
      // First delete all associated slide structures
      await slideStructuresService.deleteByPitchStageId(id);
      // Then delete the pitch stage
      await pitchStagesService.delete(id);
      toast({
        title: "Success",
        description: "Pitch stage and associated slide structures deleted successfully.",
      });
      await loadAllData();
    } catch (error) {
      console.error('Error deleting pitch stage:', error);
      toast({
        title: "Error",
        description: "Failed to delete pitch stage.",
        variant: "destructive",
      });
    }
  };

  // Slide Structure CRUD operations
  const handleCreateSlideStructure = async () => {
    setSaving(true);
    try {
      const formData = {
        ...slideStructureForm,
        pitchStageId: selectedPitchStageId
      };
      await slideStructuresService.create(formData);
      toast({
        title: "Success",
        description: "Slide structure created successfully.",
      });
      setSlideStructureDialog({ open: false, mode: 'create' });
      setSlideStructureForm({
        pitchStageId: selectedPitchStageId,
        title: '',
        description: '',
        order: getNextSlideOrder(),
        isRequired: true
      });
      await loadAllData();
    } catch (error) {
      console.error('Error creating slide structure:', error);
      toast({
        title: "Error",
        description: "Failed to create slide structure.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSlideStructure = async () => {
    if (!slideStructureDialog.data) return;
    
    setSaving(true);
    try {
      const updateData: UpdateSlideStructureRequest = {
        title: slideStructureForm.title,
        description: slideStructureForm.description,
        order: slideStructureForm.order,
        isRequired: slideStructureForm.isRequired
      };
      
      await slideStructuresService.update(slideStructureDialog.data.id, updateData);
      toast({
        title: "Success",
        description: "Slide structure updated successfully.",
      });
      setSlideStructureDialog({ open: false, mode: 'create' });
      await loadAllData();
    } catch (error) {
      console.error('Error updating slide structure:', error);
      toast({
        title: "Error",
        description: "Failed to update slide structure.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlideStructure = async (id: string) => {
    try {
      await slideStructuresService.delete(id);
      toast({
        title: "Success",
        description: "Slide structure deleted successfully.",
      });
      await loadAllData();
    } catch (error) {
      console.error('Error deleting slide structure:', error);
      toast({
        title: "Error",
        description: "Failed to delete slide structure.",
        variant: "destructive",
      });
    }
  };

  // Key Principle CRUD operations
  const handleCreateKeyPrinciple = async () => {
    setSaving(true);
    try {
      await keyPrinciplesService.create(keyPrincipleForm);
      toast({
        title: "Success",
        description: "Key principle created successfully.",
      });
      setKeyPrincipleDialog({ open: false, mode: 'create' });
      setKeyPrincipleForm({ title: '', description: '', order: keyPrinciples.length + 1 });
      await loadAllData();
    } catch (error) {
      console.error('Error creating key principle:', error);
      toast({
        title: "Error",
        description: "Failed to create key principle.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateKeyPrinciple = async () => {
    if (!keyPrincipleDialog.data) return;
    
    setSaving(true);
    try {
      const updateData: UpdateKeyPrincipleRequest = {
        title: keyPrincipleForm.title,
        description: keyPrincipleForm.description,
        order: keyPrincipleForm.order
      };
      
      await keyPrinciplesService.update(keyPrincipleDialog.data.id, updateData);
      toast({
        title: "Success",
        description: "Key principle updated successfully.",
      });
      setKeyPrincipleDialog({ open: false, mode: 'create' });
      await loadAllData();
    } catch (error) {
      console.error('Error updating key principle:', error);
      toast({
        title: "Error",
        description: "Failed to update key principle.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteKeyPrinciple = async (id: string) => {
    try {
      await keyPrinciplesService.delete(id);
      toast({
        title: "Success",
        description: "Key principle deleted successfully.",
      });
      await loadAllData();
    } catch (error) {
      console.error('Error deleting key principle:', error);
      toast({
        title: "Error",
        description: "Failed to delete key principle.",
        variant: "destructive",
      });
    }
  };

  // Helper functions
  const getNextSlideOrder = () => {
    const currentStageSlides = slideStructures.filter(s => s.pitchStageId === selectedPitchStageId);
    return currentStageSlides.length + 1;
  };

  const getFilteredSlideStructures = () => {
    return slideStructures
      .filter(s => s.pitchStageId === selectedPitchStageId)
      .sort((a, b) => a.order - b.order);
  };

  const openPitchStageDialog = (mode: 'create' | 'edit', data?: PitchStage) => {
    if (mode === 'edit' && data) {
      setPitchStageForm({
        name: data.name,
        description: data.description || '',
        order: data.order
      });
    } else {
      setPitchStageForm({
        name: '',
        description: '',
        order: pitchStages.length + 1
      });
    }
    setPitchStageDialog({ open: true, mode, data });
  };

  const openSlideStructureDialog = (mode: 'create' | 'edit', data?: SlideStructure) => {
    if (mode === 'edit' && data) {
      setSlideStructureForm({
        pitchStageId: data.pitchStageId,
        title: data.title,
        description: data.description,
        order: data.order,
        isRequired: data.isRequired
      });
    } else {
      setSlideStructureForm({
        pitchStageId: selectedPitchStageId,
        title: '',
        description: '',
        order: getNextSlideOrder(),
        isRequired: true
      });
    }
    setSlideStructureDialog({ open: true, mode, data });
  };

  const openKeyPrincipleDialog = (mode: 'create' | 'edit', data?: KeyPrinciple) => {
    if (mode === 'edit' && data) {
      setKeyPrincipleForm({
        title: data.title,
        description: data.description,
        order: data.order
      });
    } else {
      setKeyPrincipleForm({
        title: '',
        description: '',
        order: keyPrinciples.length + 1
      });
    }
    setKeyPrincipleDialog({ open: true, mode, data });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen pb-16 bg-white">
      {/* Gradient header background */}
      <div className="absolute top-0 w-full h-64 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-b-3xl opacity-10" />
      
      <div className="w-full px-6 pt-10 relative">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              Pitch Builder Settings
            </h1>
            <p className="text-slate-600 mt-1">
              Configure pitch stages, slide structures, and key principles for the outline generator.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={loadAllData} 
              variant="outline"
              disabled={loading}
              className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            
            {pitchStages.length === 0 && (
              <Button 
                onClick={handleInitializeSettings}
                disabled={initializing}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
              >
                {initializing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                Initialize Settings
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs moved outside the gradient area */}
      <div className="w-full px-6 relative">
        {/* Settings Content */}
        <Tabs defaultValue="pitch-stages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-slate-50 border border-slate-200">
          <TabsTrigger value="pitch-stages">Pitch Stages</TabsTrigger>
          <TabsTrigger value="slide-structures">Slide Structures</TabsTrigger>
          <TabsTrigger value="key-principles">Key Principles</TabsTrigger>
        </TabsList>

        {/* Pitch Stages Tab */}
        <TabsContent value="pitch-stages" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Pitch Stages</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleLoadFallbackPitchStages}
                disabled={initializing}
                className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
              >
                {initializing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Load Template
              </Button>
              <Button 
                onClick={() => openPitchStageDialog('create')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Pitch Stage
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {pitchStages.map((stage) => (
              <Card key={stage.id} className="bg-white shadow-md border border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{stage.order}</Badge>
                    <CardTitle className="text-lg">{stage.name}</CardTitle>
                    {!stage.isActive && <Badge variant="outline">Inactive</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPitchStageDialog('edit', stage)}
                      className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-red-400 bg-transparent text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Pitch Stage</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will delete the pitch stage and all associated slide structures. 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeletePitchStage(stage.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                {stage.description && (
                  <CardContent>
                    <p className="text-slate-600">{stage.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Slide Structures Tab */}
        <TabsContent value="slide-structures" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Slide Structures</h2>
            <div className="flex gap-2">
              <Select value={selectedPitchStageId} onValueChange={setSelectedPitchStageId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select pitch stage" />
                </SelectTrigger>
                <SelectContent>
                  {pitchStages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                onClick={handleLoadFallbackSlideStructures}
                disabled={initializing || !selectedPitchStageId}
                className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
              >
                {initializing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Load Template
              </Button>
              <Button 
                onClick={() => openSlideStructureDialog('create')}
                disabled={!selectedPitchStageId}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Slide
              </Button>
            </div>
          </div>

          {selectedPitchStageId && (
            <div className="grid gap-4">
              {getFilteredSlideStructures().map((slide) => (
                <Card key={slide.id} className="bg-white shadow-md border border-slate-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{slide.order}</Badge>
                      <CardTitle className="text-lg">{slide.title}</CardTitle>
                      {slide.isRequired && <Badge variant="default">Required</Badge>}
                      {!slide.isActive && <Badge variant="outline">Inactive</Badge>}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openSlideStructureDialog('edit', slide)}
                        className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-red-400 bg-transparent text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Slide Structure</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this slide structure. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteSlideStructure(slide.id)}
                              className="bg-red-600 hover:bg-red-700 text-white"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600">{slide.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Key Principles Tab */}
        <TabsContent value="key-principles" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-slate-900">Key Principles</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleLoadFallbackKeyPrinciples}
                disabled={initializing}
                className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
              >
                {initializing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Load Template
              </Button>
              <Button 
                onClick={() => openKeyPrincipleDialog('create')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Principle
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {keyPrinciples.map((principle) => (
              <Card key={principle.id} className="bg-white shadow-md border border-slate-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{principle.order}</Badge>
                    <CardTitle className="text-lg">{principle.title}</CardTitle>
                    {!principle.isActive && <Badge variant="outline">Inactive</Badge>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openKeyPrincipleDialog('edit', principle)}
                      className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-red-400 bg-transparent text-red-500 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Key Principle</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete this key principle. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDeleteKeyPrinciple(principle.id)}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">{principle.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        </Tabs>

        {/* Pitch Stage Dialog */}
        <Dialog open={pitchStageDialog.open} onOpenChange={(open) => setPitchStageDialog({ ...pitchStageDialog, open })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {pitchStageDialog.mode === 'create' ? 'Create Pitch Stage' : 'Edit Pitch Stage'}
              </DialogTitle>
              <DialogDescription>
                {pitchStageDialog.mode === 'create' 
                  ? 'Add a new pitch stage to the system.'
                  : 'Update the pitch stage details.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="stage-name">Name</Label>
                <Input
                  id="stage-name"
                  value={pitchStageForm.name}
                  onChange={(e) => setPitchStageForm({ ...pitchStageForm, name: e.target.value })}
                  placeholder="Enter stage name"
                />
              </div>
              
              <div>
                <Label htmlFor="stage-description">Description</Label>
                <Textarea
                  id="stage-description"
                  value={pitchStageForm.description}
                  onChange={(e) => setPitchStageForm({ ...pitchStageForm, description: e.target.value })}
                  placeholder="Enter stage description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="stage-order">Order</Label>
                <Input
                  id="stage-order"
                  type="number"
                  value={pitchStageForm.order}
                  onChange={(e) => setPitchStageForm({ ...pitchStageForm, order: parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setPitchStageDialog({ ...pitchStageDialog, open: false })}
                className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={pitchStageDialog.mode === 'create' ? handleCreatePitchStage : handleUpdatePitchStage}
                disabled={saving || !pitchStageForm.name.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {pitchStageDialog.mode === 'create' ? 'Create' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Slide Structure Dialog */}
        <Dialog open={slideStructureDialog.open} onOpenChange={(open) => setSlideStructureDialog({ ...slideStructureDialog, open })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {slideStructureDialog.mode === 'create' ? 'Create Slide Structure' : 'Edit Slide Structure'}
              </DialogTitle>
              <DialogDescription>
                {slideStructureDialog.mode === 'create' 
                  ? 'Add a new slide structure to the selected pitch stage.'
                  : 'Update the slide structure details.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="slide-title">Title</Label>
                <Input
                  id="slide-title"
                  value={slideStructureForm.title}
                  onChange={(e) => setSlideStructureForm({ ...slideStructureForm, title: e.target.value })}
                  placeholder="Enter slide title"
                />
              </div>
              
              <div>
                <Label htmlFor="slide-description">Description</Label>
                <Textarea
                  id="slide-description"
                  value={slideStructureForm.description}
                  onChange={(e) => setSlideStructureForm({ ...slideStructureForm, description: e.target.value })}
                  placeholder="Enter slide description"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="slide-order">Order</Label>
                <Input
                  id="slide-order"
                  type="number"
                  value={slideStructureForm.order}
                  onChange={(e) => setSlideStructureForm({ ...slideStructureForm, order: parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="slide-required"
                  checked={slideStructureForm.isRequired}
                  onCheckedChange={(checked) => setSlideStructureForm({ ...slideStructureForm, isRequired: checked })}
                />
                <Label htmlFor="slide-required">Required slide</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setSlideStructureDialog({ ...slideStructureDialog, open: false })}
                className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={slideStructureDialog.mode === 'create' ? handleCreateSlideStructure : handleUpdateSlideStructure}
                disabled={saving || !slideStructureForm.title.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {slideStructureDialog.mode === 'create' ? 'Create' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Key Principle Dialog */}
        <Dialog open={keyPrincipleDialog.open} onOpenChange={(open) => setKeyPrincipleDialog({ ...keyPrincipleDialog, open })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {keyPrincipleDialog.mode === 'create' ? 'Create Key Principle' : 'Edit Key Principle'}
              </DialogTitle>
              <DialogDescription>
                {keyPrincipleDialog.mode === 'create' 
                  ? 'Add a new key principle for pitch generation.'
                  : 'Update the key principle details.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="principle-title">Title</Label>
                <Input
                  id="principle-title"
                  value={keyPrincipleForm.title}
                  onChange={(e) => setKeyPrincipleForm({ ...keyPrincipleForm, title: e.target.value })}
                  placeholder="Enter principle title"
                />
              </div>
              
              <div>
                <Label htmlFor="principle-description">Description</Label>
                <Textarea
                  id="principle-description"
                  value={keyPrincipleForm.description}
                  onChange={(e) => setKeyPrincipleForm({ ...keyPrincipleForm, description: e.target.value })}
                  placeholder="Enter principle description"
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="principle-order">Order</Label>
                <Input
                  id="principle-order"
                  type="number"
                  value={keyPrincipleForm.order}
                  onChange={(e) => setKeyPrincipleForm({ ...keyPrincipleForm, order: parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setKeyPrincipleDialog({ ...keyPrincipleDialog, open: false })}
                className="border-indigo-400 bg-transparent text-indigo-500 hover:bg-indigo-50"
              >
                Cancel
              </Button>
              <Button 
                onClick={keyPrincipleDialog.mode === 'create' ? handleCreateKeyPrinciple : handleUpdateKeyPrinciple}
                disabled={saving || !keyPrincipleForm.title.trim()}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md"
              >
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {keyPrincipleDialog.mode === 'create' ? 'Create' : 'Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 