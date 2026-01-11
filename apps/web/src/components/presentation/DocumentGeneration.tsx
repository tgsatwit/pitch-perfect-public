import React, { useState, useEffect } from 'react';
import { PresentationWorkflow } from './PresentationWorkflow';
import { AISlideContent } from './services/PresentationAIService';
import { PitchContext } from '@/app/pitches/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Wand2, Copy, Loader2 } from 'lucide-react';
import { PresentationStorageService } from './services/PresentationStorageService';

export interface DocumentGenerationProps {
  pitchContext: PitchContext;
  initialOutline?: string;
  initialSlides?: AISlideContent[];
  onComplete?: (slides: AISlideContent[]) => Promise<void>;
}

export function DocumentGeneration({
  pitchContext,
  initialOutline,
  initialSlides,
  onComplete
}: DocumentGenerationProps) {
  const [activeTab, setActiveTab] = useState<string>('create-presentation');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templates, setTemplates] = useState<{id: string, title: string, slides: number, thumbnail: string}[]>([
    {
      id: 'template-1',
      title: 'General Banking Pitch',
      slides: 10,
      thumbnail: '/templates/banking-1.jpg'
    },
    {
      id: 'template-2',
      title: 'Investment Banking Deck',
      slides: 12,
      thumbnail: '/templates/investment-1.jpg'
    },
    {
      id: 'template-3',
      title: 'Financial Advisory Presentation',
      slides: 8,
      thumbnail: '/templates/advisory-1.jpg'
    }
  ]);
  
  // Handle creating a presentation from scratch
  const handleCreateNew = () => {
    setActiveTab('edit-presentation');
  };
  
  // Handle creating a presentation from a template
  const handleUseTemplate = async (templateId: string) => {
    setIsLoading(true);
    try {
      // In a real app, we would load the template from the storage service
      const storageService = new PresentationStorageService('current-user');
      
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setActiveTab('edit-presentation');
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle the completion of the presentation workflow
  const handlePresentationComplete = async (slides: AISlideContent[]) => {
    if (onComplete) {
      try {
        // Save the slides with their position data to Firestore
        await onComplete(slides);
        
        // You would navigate away or show a success message here
        console.log('Presentation successfully saved!');
      } catch (error) {
        console.error('Error completing presentation:', error);
      }
    }
  };
  
  return (
    <div className="flex flex-col space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {activeTab === 'create-presentation' && (
          <>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create-presentation">Create New</TabsTrigger>
              <TabsTrigger value="use-template">Use Template</TabsTrigger>
            </TabsList>
            
            <TabsContent value="create-presentation" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create a New Presentation</CardTitle>
                  <CardDescription>
                    Start from scratch or let AI generate content based on your pitch context.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={handleCreateNew} 
                    className="w-full"
                    disabled={isLoading}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Blank Presentation
                  </Button>
                  
                  <Button 
                    onClick={handleCreateNew}
                    variant="outline" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate AI Content
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="use-template" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Select a Template</CardTitle>
                  <CardDescription>
                    Choose from our banking-specific presentation templates.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <div 
                        key={template.id}
                        className={`cursor-pointer border rounded-lg overflow-hidden transition-all ${
                          selectedTemplate === template.id 
                            ? 'ring-2 ring-blue-500 scale-105 shadow-md' 
                            : 'hover:border-blue-300'
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <div className="aspect-video bg-gray-100 relative">
                          {/* Template thumbnail */}
                          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                            Template Preview
                          </div>
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-sm">{template.title}</h3>
                          <p className="text-xs text-gray-500">{template.slides} slides</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <Button
                      onClick={() => selectedTemplate && handleUseTemplate(selectedTemplate)}
                      disabled={!selectedTemplate || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading Template...
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Use Selected Template
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
        
        {activeTab === 'edit-presentation' && (
          <div className="h-[calc(100vh-200px)]">
            <PresentationWorkflow
              pitchContext={pitchContext}
              initialOutline={initialOutline}
              initialSlides={initialSlides}
              onComplete={handlePresentationComplete}
            />
          </div>
        )}
      </Tabs>
    </div>
  );
}

export default DocumentGeneration; 