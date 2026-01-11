import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Edit2, Eye, Wand2, Loader2, Plus, ArrowLeft, ArrowRight, Image as ImageIcon, LayoutTemplate, Table, Grid, Palette, Heading1, Type, List, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContentSection, SlideData, SlideEditorProps, ContentSectionType, Theme, SlideTheme } from './types';
import { SlideCanvas } from './SlideCanvas';
import { slideContentGenerationService, OutlineContentInput } from './services/SlideContentGenerationService';
import { ImageUpload } from './ImageUpload';
import { TemplateSelector } from './TemplateSelector';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ChartSelector } from './ChartSelector';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UndoRedo } from './UndoRedo';
import { useHistory } from '@/hooks/use-history';
import { createPositionedElement } from './config/defaultPositioning';
import { FormattingToolbar } from './FormattingToolbar';
import { AlignmentControls } from './AlignmentControls';
import { PropertiesPanel } from './PropertiesPanel';
import { SlideOutlineData } from './types';
import { Separator } from '@/components/ui/separator';
import { MousePointer } from 'lucide-react';
import { GridOverlay } from './GridOverlay';
import { ThemeSelector } from './ThemeSelector';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

// Default theme
const DEFAULT_THEME: SlideTheme = {
  themeId: 'professional'
};

// Helper function to generate unique IDs for slide elements
const generateId = (prefix: string): string => {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Enhanced Slide Editor component that provides PowerPoint-like editing capabilities
 * using a canvas-based approach for precise positioning of elements.
 */
export function EnhancedSlideEditor({
  slide,
  onChange,
  className,
  slideOutlineData,
  onPreviousSlide,
  onNextSlide
}: SlideEditorProps) {
  // State for tabs and editing
  const [viewMode, setViewMode] = useState<'outline' | 'edit' | 'preview'>('outline');
  const [historySlide, setHistorySlide] = useState<SlideData>(slide);
  const [historyStack, setHistoryStack] = useState<SlideData[]>([slide]);
  const [historyPosition, setHistoryPosition] = useState(0);
  
  // Various state variables for the editor
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showChartSelector, setShowChartSelector] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showGridOverlay, setShowGridOverlay] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [currentTheme, setCurrentTheme] = useState<string>('default');
  
  // State to track empty/generated state for Edit tab
  const [hasGeneratedContent, setHasGeneratedContent] = useState(false);
  
  // Keep track of initial empty slide for reset functionality
  const [initialEmptySlide] = useState<SlideData>({
    ...slide,
    content: {
      ...slide.content,
      sections: [] // Start with no sections in Edit tab
    }
  });

  const canvasRef = useRef<HTMLDivElement>(null);
  const [editMode, setEditMode] = useState<'select' | 'text'>('select');
  
  // Update the internal state when the slide prop changes
  useEffect(() => {
    // Only update the slide data structure, not the content
    // This preserves our empty Edit tab until generation
    setHistorySlide({
      ...slide,
      content: hasGeneratedContent ? slide.content : { 
        ...slide.content,
        sections: [] // Keep sections empty until generated
      }
    });
    
    if (!hasGeneratedContent) {
      setHistoryStack([{
        ...slide,
        content: { 
          ...slide.content,
          sections: [] // Keep history stack with empty sections too
        }
      }]);
    }
  }, [slide]);
  
  const canUndo = historyPosition > 0;
  const canRedo = historyPosition < historyStack.length - 1;
  
  // Handle undo/redo functions
  const undo = () => {
    if (canUndo) {
      const newPosition = historyPosition - 1;
      setHistoryPosition(newPosition);
      setHistorySlide(historyStack[newPosition]);
      onChange(historyStack[newPosition]);
    }
  };
  
  const redo = () => {
    if (canRedo) {
      const newPosition = historyPosition + 1;
      setHistoryPosition(newPosition);
      setHistorySlide(historyStack[newPosition]);
      onChange(historyStack[newPosition]);
    }
  };
  
  // Generate default sections based on slide type
  const getDefaultSectionsForSlideType = (slideType: string): ContentSection[] => {
    switch (slideType) {
      case 'title':
        return [
          {
            id: `heading-${Date.now()}`,
            type: 'heading',
            content: {
              text: slide.content?.title || 'Presentation Title',
              level: 1
            },
            position: { x: 250, y: 100 },
            size: { width: 500, height: 80 }
          },
          {
            id: `text-${Date.now() + 1}`,
            type: 'text',
            content: {
              text: slide.content?.subtitle || 'Company Name | Date'
            },
            position: { x: 250, y: 200 },
            size: { width: 500, height: 60 }
          }
        ];
        
      case 'content':
        return [
          {
            id: `heading-${Date.now()}`,
            type: 'heading',
            content: {
              text: slide.content?.title || 'Section Title',
              level: 2
            },
            position: { x: 250, y: 80 },
            size: { width: 500, height: 60 }
          },
          {
            id: `bullet-list-${Date.now() + 1}`,
            type: 'bullet-list',
            content: {
              items: slide.content?.body ? formatBodyToItems(slide.content.body) : ['Point 1', 'Point 2', 'Point 3']
            },
            position: { x: 150, y: 180 },
            size: { width: 700, height: 200 }
          }
        ];
        
      case 'chart':
        return [
          {
            id: `heading-${Date.now()}`,
            type: 'heading',
            content: {
              text: slide.content?.title || 'Chart Title',
              level: 2
            },
            position: { x: 250, y: 80 },
            size: { width: 500, height: 60 }
          },
          {
            id: `chart-${Date.now() + 1}`,
            type: 'chart',
            content: {
              chartType: slide.content?.chartType || 'bar',
              data: slide.content?.data || {
                labels: ['Category A', 'Category B', 'Category C'],
                values: [30, 50, 20]
              }
            },
            position: { x: 250, y: 180 },
            size: { width: 500, height: 250 }
          },
          {
            id: `text-${Date.now() + 2}`,
            type: 'text',
            content: {
              text: 'Chart description and key insights'
            },
            position: { x: 250, y: 450 },
            size: { width: 500, height: 60 }
          }
        ];
        
      default:
        return [
          {
            id: `heading-${Date.now()}`,
            type: 'heading',
            content: {
              text: slide.content?.title || 'Slide Title',
              level: 2
            },
            position: { x: 250, y: 100 },
            size: { width: 500, height: 60 }
          },
          {
            id: `text-${Date.now() + 1}`,
            type: 'text',
            content: {
              text: slide.content?.body || 'Add content here'
            },
            position: { x: 250, y: 200 },
            size: { width: 500, height: 100 }
          }
        ];
    }
  };
  
  // Convert slide body text to bullet points if needed
  const formatBodyToItems = (body: string): string[] => {
    if (!body) return ['Add content here'];
    
    return body.split('\n')
      .filter(line => line.trim())
      .map(line => line.trim().startsWith('•') ? line.trim().substring(1).trim() : line.trim());
  };
  
  // Handle element updates from canvas
  const handleElementUpdate = (sectionId: string, updates: Partial<ContentSection>) => {
    if (!historySlide.content.sections) return;
    
    const updatedSections = historySlide.content.sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          ...updates
        };
      }
      return section;
    });
    
    setHistorySlide({
      ...historySlide,
      content: {
        ...historySlide.content,
        sections: updatedSections
      }
    });
  };
  
  // Modify the addElement function to use createPositionedElement
  const addElement = (type: ContentSectionType) => {
    if (!historySlide.content.sections) return;
    
    // Special handling for chart element
    if (type === 'chart') {
      setShowChartSelector(true);
      return;
    }
    
    // Create a new element based on type and using proper positioning
    let newElement: ContentSection;
    
    switch (type) {
      case 'heading':
        newElement = createPositionedElement(
          historySlide.type,
          'heading',
          `heading-${Date.now()}`,
          {
            text: 'New Heading',
            level: 2
          }
        );
        break;
        
      case 'text':
        newElement = createPositionedElement(
          historySlide.type,
          'text',
          `text-${Date.now()}`,
          {
            text: 'New text content'
          }
        );
        break;
        
      case 'bullet-list':
        newElement = createPositionedElement(
          historySlide.type,
          'bullet-list',
          `bullet-list-${Date.now()}`,
          {
            items: ['New bullet point', 'Add more points']
          }
        );
        break;
        
      case 'image':
        newElement = createPositionedElement(
          historySlide.type,
          'image',
          `image-${Date.now()}`,
          {
            src: '', // Will be updated when image is uploaded
            alt: 'Slide image'
          }
        );
        break;
        
      case 'table':
        newElement = createPositionedElement(
          historySlide.type,
          'table',
          `table-${Date.now()}`,
          {
            headers: ['Header 1', 'Header 2', 'Header 3'],
            rows: [
              ['Row 1, Col 1', 'Row 1, Col 2', 'Row 1, Col 3'],
              ['Row 2, Col 1', 'Row 2, Col 2', 'Row 2, Col 3']
            ]
          }
        );
        break;
        
      default:
        newElement = createPositionedElement(
          historySlide.type,
          'text',
          `text-${Date.now()}`,
          {
            text: 'New content'
          }
        );
    }
    
    // Add the new element to the slide
    setHistorySlide({
      ...historySlide,
      content: {
        ...historySlide.content,
        sections: [...historySlide.content.sections, newElement]
      }
    });
    
    setSelectedElement(newElement.id);
  };
  
  // Add a handler for image uploads
  const handleImageUploaded = (imageUrl: string) => {
    // Create a new image element with default positioning
    const newImageElement = createPositionedElement(
      historySlide.type,
      'image',
      `image-${Date.now()}`,
      {
        src: imageUrl,
        alt: 'Uploaded image'
      }
    );
    
    // Add the new element to the slide
    const updatedSections = [...(historySlide.content.sections || []), newImageElement];
    setHistorySlide({
      ...historySlide,
      content: {
        ...historySlide.content,
        sections: updatedSections
      }
    });
    
    // Close the image upload panel
    setShowImageUpload(false);
  };
  
  // Generate content from the outline
  const generateContentFromOutline = async () => {
    if (!slideOutlineData) {
      console.error("No outline data available");
      return;
    }
    
    setIsGeneratingContent(true);
    
    try {
      // Extract the outline content to use as input
      const outlineInput: OutlineContentInput = {
        slideTitle: slideOutlineData.title,
        slideNumber: slideOutlineData.number,
        slideType: slideOutlineData.slideType,
        purpose: slideOutlineData.purpose,
        keyContent: slideOutlineData.keyContent,
        keyTakeaway: slideOutlineData.keyTakeaway,
        strategicFraming: slideOutlineData.strategicFraming,
        visualRecommendation: slideOutlineData.visualRecommendation
      };
      
      // Call the service to generate content from outline
      const generatedContent = await slideContentGenerationService.generateFromOutline(outlineInput);
      
      if (generatedContent) {
        // Create sections from the generated content
        const newSections: ContentSection[] = [];
        
        // Add title
        newSections.push({
          id: generateId('heading'),
          type: 'heading',
          content: {
            text: generatedContent.title,
            level: 1
          },
          position: { x: 250, y: 80 },
          size: { width: 500, height: 60 }
        });
        
        // Add subtitle if available
        if (generatedContent.subtitle) {
          newSections.push({
            id: generateId('text'),
            type: 'text',
            content: {
              text: generatedContent.subtitle
            },
            position: { x: 250, y: 150 },
            size: { width: 500, height: 40 }
          });
        }
        
        // Add content blocks
        if (generatedContent.contentBlocks) {
          let yPosition = generatedContent.subtitle ? 200 : 150;
          
          generatedContent.contentBlocks.forEach((block, index) => {
            if (block.type === 'bullet') {
              // Create a bullet list
              newSections.push({
                id: generateId('bullet-list'),
                type: 'bullet-list',
                content: {
                  items: block.content.split('\n').filter(item => item.trim().length > 0)
                },
                position: { x: 150, y: yPosition },
                size: { width: 700, height: 200 }
              });
            } else {
              // Create text block
              newSections.push({
                id: generateId('text'),
                type: 'text',
                content: {
                  text: block.content
                },
                position: { x: 250, y: yPosition },
                size: { width: 500, height: 100 }
              });
            }
            yPosition += 120; // Increment position for next element
          });
        }
        
        // Update the slide with new content
        const updatedSlide = {
          ...historySlide,
          content: {
            ...historySlide.content,
            title: generatedContent.title,
            sections: newSections
          }
        };
        
        // Update the history stack with the new slide
        setHistorySlide(updatedSlide);
        setHistoryStack([...historyStack, updatedSlide]);
        setHistoryPosition(historyStack.length);
        
        // Mark content as generated and switch to Edit tab
        setHasGeneratedContent(true);
        setViewMode('edit');
        
        // Call the onChange to update parent components
        onChange(updatedSlide);
      }
    } catch (error) {
      console.error("Error generating content from outline:", error);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const companyName = slideOutlineData?.companyName || 'Pitch Perfect';

  const handleTemplateSelect = (template: SlideData) => {
    // Merge the template with the current slide
    // This preserves the slide ID but updates all content
    const updatedSlide: SlideData = {
      ...slide,
      type: template.type,
      content: {
        ...template.content,
        title: template.content.title || slide.content.title
      }
    };
    
    onChange(updatedSlide);
  };

  // Update theme handlers
  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    setHistorySlide({
      ...historySlide,
      theme: {
        ...(historySlide.theme || {}), 
        themeId
      }
    });
    onChange({
      ...historySlide,
      theme: {
        ...(historySlide.theme || {}),
        themeId
      }
    });
  };
  
  const handleFontChange = (fontType: 'heading' | 'body', font: string) => {
    setHistorySlide({
      ...historySlide,
      theme: {
        ...(historySlide.theme || { themeId: currentTheme }), // Ensure themeId is always present
        customFonts: {
          ...(historySlide.theme?.customFonts || {}),
          [fontType]: font
        }
      }
    });
  };

  // Add ElementProperties component
  interface ElementPropertyProps {
    element: string;
    onUpdate: (updates: Partial<ContentSection>) => void;
  }

  const ElementProperties: React.FC<ElementPropertyProps> = ({ 
    element, 
    onUpdate 
  }) => {
    // Find the selected section
    const selectedSection = historySlide.content.sections?.find(section => section.id === element);
    
    if (!selectedSection) {
      return <p className="text-sm text-slate-500">No element selected</p>;
    }
    
    // Render different property panels based on section type
    switch (selectedSection.type) {
      case 'heading':
        return (
          <>
            <div className="mb-3">
              <Label className="mb-1 block">Text</Label>
              <Input
                value={selectedSection.content?.text || ''}
                onChange={(e) => {
                  onUpdate({
                    content: { ...selectedSection.content, text: e.target.value }
                  });
                }}
              />
            </div>
            <div className="mb-3">
              <Label className="mb-1 block">Level</Label>
              <select
                className="w-full p-2 border rounded"
                value={selectedSection.content?.level || 2}
                onChange={(e) => {
                  onUpdate({
                    content: { ...selectedSection.content, level: parseInt(e.target.value) }
                  });
                }}
              >
                <option value={1}>Level 1 - Main Title</option>
                <option value={2}>Level 2 - Subtitle</option>
                <option value={3}>Level 3 - Section Title</option>
              </select>
            </div>
          </>
        );
        
      case 'text':
        return (
          <div className="mb-3">
            <Label className="mb-1 block">Text</Label>
            <Textarea
              className="min-h-[100px]"
              value={selectedSection.content?.text || ''}
              onChange={(e) => {
                onUpdate({
                  content: { ...selectedSection.content, text: e.target.value }
                });
              }}
            />
          </div>
        );
        
      case 'bullet-list':
        return (
          <div className="mb-3">
            <Label className="mb-1 block">Items (one per line)</Label>
            <Textarea
              className="min-h-[100px]"
              value={selectedSection.content?.items?.join('\n') || ''}
              onChange={(e) => {
                const items = e.target.value.split('\n').filter(item => item.trim().length > 0);
                onUpdate({
                  content: { ...selectedSection.content, items }
                });
              }}
              placeholder="Enter one item per line"
            />
          </div>
        );
        
      default:
        return (
          <p className="text-sm text-slate-500">
            Properties for {selectedSection.type} type are not yet available.
          </p>
        );
    }
  };

  // Add missing handleSelectedElementUpdate function
  const handleSelectedElementUpdate = (updates: Partial<ContentSection>) => {
    if (!selectedElement) return;
    handleElementUpdate(selectedElement, updates);
  };

  // Add a new handler for when a chart is selected from the ChartSelector
  const handleChartSelected = (chartType: string, chartData: any) => {
    // Create a new chart element based on the selected type and data using default positioning
    const newChartElement = createPositionedElement(
      historySlide.type,
      'chart',
      `chart-${Date.now()}`,
      {
        chartType: chartType.includes('financial-') ? chartType.replace('financial-', '') : chartType,
        data: chartData,
        title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1).replace('financial-', '')} Chart`
      }
    );
    
    // Add the new chart element to the slide
    const updatedSections = [...(historySlide.content.sections || []), newChartElement];
    setHistorySlide({
      ...historySlide,
      content: {
        ...historySlide.content,
        sections: updatedSections
      }
    });
    
    // Close the chart selector
    setShowChartSelector(false);
    
    // Select the new chart element
    setSelectedElement(newChartElement.id);
  };

  // Add the handleKeyDown function to handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Check for Ctrl+Z (Undo)
    if (e.ctrlKey && e.key === 'z' && canUndo) {
      e.preventDefault();
      undo();
    }
    
    // Check for Ctrl+Y (Redo)
    if (e.ctrlKey && e.key === 'y' && canRedo) {
      e.preventDefault();
      redo();
    }
  };

  return (
    <div className={cn("flex flex-col border rounded-md", className)}>
      <div className="border-b p-2 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onPreviousSlide}
            disabled={!onPreviousSlide}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onNextSlide}
            disabled={!onNextSlide}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Slide {slideOutlineData?.number || ''}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Undo/Redo controls */}
          <UndoRedo
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            buttonSize="sm"
          />
          
          {/* Grid toggle */}
          {viewMode === 'edit' && (
            <div className="flex items-center space-x-2 ml-2">
              <Label htmlFor="show-grid" className="text-xs cursor-pointer">
                <Grid className="h-4 w-4" />
              </Label>
              <Switch
                id="show-grid"
                checked={showGridOverlay}
                onCheckedChange={setShowGridOverlay}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="outline" value={viewMode} onValueChange={(value) => setViewMode(value as 'outline' | 'edit' | 'preview')}>
        <TabsList className="p-0 border-b rounded-none flex w-full">
          <TabsTrigger value="outline" className="flex-1 rounded-none">
            <span className="flex items-center gap-1">
              <LayoutTemplate className="h-4 w-4" />
              Outline
            </span>
          </TabsTrigger>
          <TabsTrigger value="edit" className="flex-1 rounded-none">
            <span className="flex items-center gap-1">
              <Edit2 className="h-4 w-4" />
              Edit
            </span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex-1 rounded-none">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Preview
            </span>
          </TabsTrigger>
        </TabsList>
        
        {/* Outline Tab Content */}
        <TabsContent value="outline" className="pt-0 min-h-[500px]">
          <div className="h-full p-4 overflow-auto">
            {slideOutlineData ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{slideOutlineData.title}</h3>
                  <p className="text-sm text-muted-foreground">Slide {slideOutlineData.number} - {slideOutlineData.slideType}</p>
                </div>
                
                {slideOutlineData.purpose && (
                  <div>
                    <h4 className="text-sm font-medium">Purpose</h4>
                    <p className="text-sm">{slideOutlineData.purpose}</p>
                  </div>
                )}
                
                {slideOutlineData.keyContent && slideOutlineData.keyContent.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium">Key Content</h4>
                    <ul className="text-sm list-disc pl-5">
                      {slideOutlineData.keyContent.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {slideOutlineData.keyTakeaway && (
                  <div>
                    <h4 className="text-sm font-medium">Key Takeaway</h4>
                    <p className="text-sm">{slideOutlineData.keyTakeaway}</p>
                  </div>
                )}
                
                {slideOutlineData.strategicFraming && (
                  <div>
                    <h4 className="text-sm font-medium">Strategic Framing</h4>
                    <p className="text-sm">{slideOutlineData.strategicFraming}</p>
                  </div>
                )}
                
                {slideOutlineData.visualRecommendation && (
                  <div>
                    <h4 className="text-sm font-medium">Visual Recommendation</h4>
                    <p className="text-sm">{slideOutlineData.visualRecommendation}</p>
                  </div>
                )}
                
                <div className="pt-4">
                  <Button
                    onClick={generateContentFromOutline}
                    className="w-full"
                    disabled={isGeneratingContent}
                  >
                    {isGeneratingContent ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating Content...
                      </>
                    ) : hasGeneratedContent ? (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Regenerate Content
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Content from Outline
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">No outline data available for this slide.</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Edit Tab Content */}
        <TabsContent value="edit" className="pt-0 min-h-[500px]">
          <div className="grid grid-cols-[auto_1fr_250px] h-full">
            {/* Left sidebar - Element controls */}
            <div className="w-16 border-r bg-slate-50 flex flex-col items-center py-4 space-y-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => addElement('heading')}
                className="w-10 h-10"
                title="Add Heading"
              >
                <Heading1 className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => addElement('text')}
                className="w-10 h-10"
                title="Add Text"
              >
                <Type className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => addElement('bullet-list')}
                className="w-10 h-10"
                title="Add Bullet List"
              >
                <List className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowChartSelector(true)}
                className="w-10 h-10"
                title="Add Chart"
              >
                <BarChart className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowImageUpload(true)}
                className="w-10 h-10"
                title="Add Image"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => addElement('table')}
                className="w-10 h-10"
                title="Add Table"
              >
                <Table className="h-5 w-5" />
              </Button>
              <div className="border-t w-10 my-2"></div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowTemplateSelector(true)}
                className="w-10 h-10"
                title="Templates"
              >
                <LayoutTemplate className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Center - Canvas */}
            <div className="flex-1 overflow-auto relative" onKeyDown={handleKeyDown}>
              {!hasGeneratedContent ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center max-w-md p-6">
                    <Wand2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">Create Slide Content</h3>
                    <p className="text-muted-foreground mb-4">
                      Go to the Outline tab and click "Generate Content from Outline" to transform 
                      your outline into slide content.
                    </p>
                    <Button onClick={() => setViewMode('outline')}>
                      Go to Outline
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <SlideCanvas
                    slide={historySlide}
                    onElementUpdate={handleElementUpdate}
                    width={960}
                    height={540}
                  />
                  {showGridOverlay && (
                    <GridOverlay
                      visible={showGridOverlay}
                      gridSize={gridSize}
                      width={960}
                      height={540}
                    />
                  )}
                </>
              )}
            </div>
            
            {/* Right sidebar - Element properties */}
            <div className="w-64 border-l overflow-auto">
              <Tabs defaultValue="properties">
                <TabsList className="p-0 border-b rounded-none flex w-full">
                  <TabsTrigger value="properties" className="flex-1 rounded-none text-xs">
                    Properties
                  </TabsTrigger>
                  <TabsTrigger value="style" className="flex-1 rounded-none text-xs">
                    Style
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex-1 rounded-none text-xs">
                    AI
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="properties" className="p-3">
                  {selectedElement ? (
                    <ElementProperties
                      element={selectedElement}
                      onUpdate={handleSelectedElementUpdate}
                    />
                  ) : (
                    <div className="text-center py-12 text-muted-foreground text-sm">
                      <p>Select an element to edit its properties</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="style" className="p-3">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Slide Theme</h4>
                      <ThemeSelector
                        currentTheme={currentTheme}
                        onThemeChange={handleThemeChange}
                        onFontChange={handleFontChange}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="ai" className="p-3">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium mb-2">AI Generation</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateContentFromOutline}
                      disabled={isGeneratingContent || !slideOutlineData}
                      className="w-full flex items-center justify-center"
                    >
                      {isGeneratingContent ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate Content
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </TabsContent>
        
        {/* Preview Tab Content */}
        <TabsContent value="preview" className="pt-0 min-h-[500px]">
          <div className="h-full flex items-center justify-center bg-slate-50">
            <SlideCanvas
              slide={historySlide}
              onElementUpdate={handleElementUpdate}
              width={960}
              height={540}
              editable={false}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Dialogs for image upload, chart selector, etc. */}
      <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          <ImageUpload onImageUploaded={handleImageUploaded} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={showChartSelector} onOpenChange={setShowChartSelector}>
        <DialogContent className="p-0 bg-transparent border-none max-w-md">
          <ChartSelector 
            onChartSelected={handleChartSelected}
            onCancel={() => setShowChartSelector(false)}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Template</DialogTitle>
          </DialogHeader>
          <TemplateSelector
            onTemplateSelect={handleTemplateSelect}
            clientName={historySlide.content.clientName || ''}
            bankName={historySlide.content.bankName || ''}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 