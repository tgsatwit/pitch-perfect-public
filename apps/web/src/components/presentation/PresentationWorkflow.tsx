import React, { useState, useRef, useEffect } from 'react';
import { PitchContext } from '../../app/pitches/types';
import { presentationAIService } from './services/PresentationAIService';
import { presentationContentService } from './services/PresentationContentService';
import { slideContentGenerationService } from './services/SlideContentGenerationService';
import { presentationExportService, ExportOptions } from './services/PresentationExportService';
import { SlideEditor } from './SlideEditor';
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, ArrowRight, Download, Check, ChevronRight, ChevronLeft, Wand2, Plus, PlusCircle, Eye, EyeOff, Trash2, Copy, FileText, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  SlideData,
  SlideOutlineData, 
  PresentationWorkflowProps, 
  WorkflowStep,
  ContentGenerationOptions,
  SlideGenerationRequest,
  SlideType
} from './types';
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedSlideEditor } from './EnhancedSlideEditor';
import { PresentationStorageService } from './services/PresentationStorageService';
import { ExportToPDF } from './ExportToPDF';
import { PresentationMode } from './PresentationMode';

// Function to transform Firestore slides to the format expected by PresentationWorkflow
const transformFirestoreSlides = (firestoreSlides: any[]): SlideData[] => {
  if (!firestoreSlides || !Array.isArray(firestoreSlides)) return [];
  
  return firestoreSlides.map(slide => {
    // Extract slide number from id (e.g., "slide-1" -> 1)
    const slideNumber = parseInt((slide.id.match(/\d+/) || [0])[0]);
    
    // Determine slide type if not already specified
    const slideType = slide.type || determineSlideTypeFromContent(slide.content);
    
    // Create basic slide structure
    const transformedSlide: SlideData = {
      id: slide.id,
      type: slideType,
      content: {
        title: slide.content?.title || '',
        subtitle: slide.content?.subtitle || '',
      },
      notes: slide.notes || ''
    };
    
    // Handle different content types
    if (slide.content) {
      // For slides with body content
      if (slide.content.body) {
        transformedSlide.content.body = slide.content.body;
      }
      
      // For chart slides
      if (slideType === 'chart' || slide.content.chartType) {
        transformedSlide.content.chartType = slide.content.chartType || 'bar';
        transformedSlide.content.data = slide.content.data || [];
      }
      
      // For table slides
      if (slideType === 'table' || slide.content.headers) {
        transformedSlide.content.headers = slide.content.headers || [];
        transformedSlide.content.data = slide.content.data || [];
      }
      
      // Convert sections format if provided
      if (slide.content.sections) {
        transformedSlide.content.sections = slide.content.sections;
      }
      
      // Convert blocks to sections if needed
      if (slide.content.blocks && Array.isArray(slide.content.blocks)) {
        const sections = processSlideSections(slide.content.blocks);
        if (sections && sections.length > 0) {
          transformedSlide.content.sections = sections;
        }
      }
    }
    
    return transformedSlide;
  });
};

// Helper function to process slide blocks into sections
const processSlideSections = (blocks: any[]): any[] => {
  if (!blocks || !Array.isArray(blocks)) return [];
  
  const sections: any[] = [];
  let currentSection: any = null;
  
  blocks.forEach(block => {
    switch (block.type) {
      case 'title':
        // Title blocks typically start a new section
        currentSection = {
          type: 'header',
          content: block.content,
          id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        };
        sections.push(currentSection);
        break;
        
      case 'subtitle':
        if (!currentSection) {
          currentSection = {
            type: 'header',
            content: '',
            id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
          };
          sections.push(currentSection);
        }
        currentSection.subtitle = block.content;
        break;
        
      case 'text':
        sections.push({
          type: 'text',
          content: block.content,
          id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        });
        break;
        
      case 'bullet':
        // Group consecutive bullets into a single list section
        const lastSection = sections.length > 0 ? sections[sections.length - 1] : null;
        if (lastSection && lastSection.type === 'bulletList') {
          lastSection.items.push(block.content);
        } else {
          sections.push({
            type: 'bulletList',
            items: [block.content],
            id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
          });
        }
        break;
        
      case 'chart':
        sections.push({
          type: 'chart',
          chartType: block.chartType || 'bar',
          data: block.data || {},
          id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        });
        break;
        
      case 'table':
        sections.push({
          type: 'table',
          headers: block.headers || [],
          data: block.data || [],
          id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        });
        break;
        
      case 'image':
        sections.push({
          type: 'image',
          src: block.content,
          alt: block.alt || 'Slide image',
          id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        });
        break;
        
      default:
        // Handle any other types as text
        sections.push({
          type: 'text',
          content: block.content || '',
          id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
        });
    }
  });
  
  return sections;
};

// Helper function to determine slide type from content
const determineSlideTypeFromContent = (content: any): SlideType => {
  if (!content) return 'content';
  
  if (content.chartType || (content.blocks && content.blocks.some((b: any) => b.type === 'chart'))) {
    return 'chart';
  }
  
  if (content.headers || (content.blocks && content.blocks.some((b: any) => b.type === 'table'))) {
    return 'table';
  }
  
  const title = content.title?.toLowerCase() || '';
  
  if (title.includes('introduction') || title.includes('cover') || 
      title.includes('title') || title.includes('overview')) {
    return 'title';
  }
  
  if (title.includes('conclusion') || title.includes('next steps') || 
      title.includes('thank you') || title.includes('summary')) {
    return 'closing';
  }
  
  return 'content';
};

export function PresentationWorkflow({ 
  pitchContext, 
  initialOutline = '', 
  initialSlides = [],
  onComplete 
}: PresentationWorkflowProps) {
  const [activeTab, setActiveTab] = useState<WorkflowStep>('edit');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slides, setSlides] = useState<SlideData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [slideOutlines, setSlideOutlines] = useState<SlideOutlineData[]>([]);
  const [parsingError, setParsingError] = useState<string | null>(null);
  const [showPDFExport, setShowPDFExport] = useState(false);
  const [showPresentationMode, setShowPresentationMode] = useState(false);
  const slideEditorRef = useRef<HTMLDivElement>(null);
  
  // Initialize local storage service for the current user
  // In a real app, use actual user ID from auth
  const storageService = useRef(new PresentationStorageService('current-user'));

  // Parse the outline into slide data
  useEffect(() => {
    if (initialOutline && typeof initialOutline === 'string' && initialOutline.trim() !== '') {
      try {
        const parsedSlides = parseOutlineToSlides(initialOutline);
        setSlideOutlines(parsedSlides);
        console.log(`Parsed ${parsedSlides.length} slides from outline`);
      } catch (error) {
        console.error('Error parsing outline:', error);
        setParsingError('Failed to parse outline. Please check the format.');
      }
    } else {
      console.warn('No valid outline provided');
      setSlideOutlines([]);
    }
  }, [initialOutline]);

  // If initial slides are provided, transform and use them
  useEffect(() => {
    if (initialSlides && initialSlides.length > 0) {
      console.log(`Transforming ${initialSlides.length} pre-loaded slides from Firestore`);
      const transformedSlides = transformFirestoreSlides(initialSlides);
      console.log('Transformed slides:', transformedSlides);
      setSlides(transformedSlides);
      setCurrentSlideIndex(0);
    }
  }, [initialSlides]);

  // Function to parse outline markdown into structured slide data
  const parseOutlineToSlides = (outlineMarkdown: string): SlideOutlineData[] => {
    const slides: SlideOutlineData[] = [];
    
    console.log("Starting to parse outline...");
    
    // Regular expression to match slide sections - more flexible to match various formats
    const slideRegex = /#+\s*(?:Slide\s+)?(\d+)(?:\s*[:.]\s*|\s*[-–—]\s*|\s+)([^\n]+)(?:\n([\s\S]*?)(?=#+\s*(?:Slide\s+)?\d+(?:\s*[:.]\s*|\s*[-–—]\s*|\s+)|$))/gi;
    let match;
    
    while ((match = slideRegex.exec(outlineMarkdown)) !== null) {
      const slideNumber = parseInt(match[1]);
      const slideTitle = match[2].trim();
      const slideContent = match[3].trim();
      
      console.log(`Found slide ${slideNumber}: "${slideTitle}"`);
      
      // Extract different sections using regex with improved patterns
      const purposeMatch = /\*\*(?:Purpose|Objective|Goal):\*\*\s*([^\n]+)/i.exec(slideContent);
      const keyContentMatch = /\*\*(?:Key Content|Content|Main Points):\*\*([\s\S]*?)(?=\*\*|$)/i.exec(slideContent);
      const supportingEvidenceMatch = /\*\*(?:Supporting Evidence|Evidence|Data|Support)(?:\/Data)?:\*\*([\s\S]*?)(?=\*\*|$)/i.exec(slideContent);
      const keyTakeawayMatch = /\*\*(?:Key Takeaway|Takeaway|Summary):\*\*\s*([^\n]+)/i.exec(slideContent);
      const strategicFramingMatch = /\*\*(?:Strategic Framing|Strategy|Approach):\*\*\s*([^\n]+)/i.exec(slideContent);
      const visualMatch = /\*\*(?:Visual Recommendation|Visual|Visualization|Design):\*\*\s*([^\n]+)/i.exec(slideContent);
      
      // Log what we found
      console.log(`  Purpose: ${purposeMatch?.[1]?.substring(0, 30)}...`);
      console.log(`  Content: ${keyContentMatch ? 'Found' : 'Not found'}`);
      console.log(`  Visual: ${visualMatch?.[1]}`);
      
      // Extract bullet points from content sections with improved regex
      const parseListItems = (text?: string): string[] => {
        if (!text) return [];
        const items: string[] = [];
        
        // Match both dashes, bullets, numbers, and other potential bullet formats
        const itemRegex = /(?:[-•*+]\s+|\d+[.)]\s+)([^\n]+)/g;
        let itemMatch;
        while ((itemMatch = itemRegex.exec(text)) !== null) {
          items.push(itemMatch[1].trim());
        }
        
        // If no bullet points found but there is text, split by lines and filter empty lines
        if (items.length === 0 && text.trim()) {
          return text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);
        }
        
        return items;
      };
      
      // Better slide type detection
      const visualRecommendation = visualMatch?.[1] || '';
      const slideType = determineSlideType(slideTitle, visualRecommendation);
      
      slides.push({
        id: `slide-${slideNumber}`,
        number: slideNumber,
        title: slideTitle,
        purpose: purposeMatch?.[1]?.trim() || '',
        keyContent: parseListItems(keyContentMatch?.[1]),
        supportingEvidence: parseListItems(supportingEvidenceMatch?.[1]),
        keyTakeaway: keyTakeawayMatch?.[1]?.trim() || '',
        strategicFraming: strategicFramingMatch?.[1]?.trim() || '',
        visualRecommendation,
        slideType,
        companyName: pitchContext.companyName
      });
    }
    
    // If we didn't find any slides with the regex, try a more flexible fallback approach
    if (slides.length === 0) {
      console.log("No slides matched with primary regex, trying fallback...");
      
      // Look for any header sections that might be slides
      const fallbackRegex = /#+\s*([^#\n]+)(?:\n([\s\S]*?)(?=#+\s*|$))/gi;
      let fallbackMatch;
      let slideNumber = 1;
      
      while ((fallbackMatch = fallbackRegex.exec(outlineMarkdown)) !== null) {
        const title = fallbackMatch[1].trim();
        const content = fallbackMatch[2].trim();
        
        // Skip sections that don't look like slides
        if (title.toLowerCase().includes('outline summary') || 
            title.toLowerCase().includes('table of contents') ||
            title.length > 100) {
          console.log(`Skipping non-slide section: ${title}`);
          continue;
        }
        
        console.log(`Found potential slide from fallback: "${title}"`);
        
        // Try to extract some structure from unstructured content
        const contentLines = content.split('\n').filter(line => line.trim().length > 0);
        const keyPoints = contentLines.slice(0, Math.min(5, contentLines.length));
        
        const slideType = determineSlideType(title, content);
        
        slides.push({
          id: `slide-${slideNumber}`,
          number: slideNumber,
          title: title,
          purpose: contentLines[0] || 'Present key information',
          keyContent: keyPoints,
          supportingEvidence: [],
          keyTakeaway: contentLines[contentLines.length - 1] || '',
          strategicFraming: '',
          visualRecommendation: '',
          slideType,
          companyName: pitchContext.companyName
        });
        
        slideNumber++;
      }
    }
    
    // Check if we have any slides, and if not, create a default title slide
    if (slides.length === 0) {
      console.log("No slides found at all, creating a default title slide");
      slides.push({
        id: `slide-1`,
        number: 1,
        title: "Presentation Title",
        purpose: 'Introduce the presentation',
        keyContent: ["Introduction to the presentation"],
        supportingEvidence: [],
        keyTakeaway: '',
        strategicFraming: '',
        visualRecommendation: '',
        slideType: 'title',
        companyName: pitchContext.companyName
      });
    }
    
    console.log(`Parsed ${slides.length} slides from outline`);
    
    // Sort slides by slide number to ensure correct order
    return slides.sort((a, b) => a.number - b.number);
  };

  // Determine slide type based on content
  const determineSlideType = (title: string, visualRecommendation: string): SlideOutlineData['slideType'] => {
    const titleLower = title.toLowerCase();
    const visualLower = visualRecommendation.toLowerCase();
    
    // Log the inputs to help with debugging
    console.log(`Determining slide type for: "${title}" with visual: "${visualRecommendation}"`);
    
    // First check for title slides
    if (titleLower.includes('cover') || 
        titleLower.includes('introduction') || 
        titleLower.includes('title') || 
        titleLower.includes('overview')) {
      console.log(`Detected as title slide`);
      return 'title';
    }
    
    // Check for closing slides
    if (titleLower.includes('next steps') || 
        titleLower.includes('conclusion') || 
        titleLower.includes('thank you') || 
        titleLower.includes('summary') && titleLower.includes('executive')) {
      console.log(`Detected as closing slide`);
      return 'closing';
    }
    
    // Check for chart slides - expanded keywords
    if (visualLower.includes('chart') || 
        visualLower.includes('graph') || 
        visualLower.includes('bar') || 
        visualLower.includes('pie') || 
        visualLower.includes('plot') || 
        visualLower.includes('visual') || 
        titleLower.includes('chart') || 
        titleLower.includes('graph') || 
        titleLower.includes('data visualization') ||
        titleLower.includes('metrics') ||
        titleLower.includes('comparison')) {
      console.log(`Detected as chart slide`);
      return 'chart';
    }
    
    // Check for table slides
    if (visualLower.includes('table') || 
        titleLower.includes('table') || 
        titleLower.includes('comparison') ||
        titleLower.includes('data')) {
      console.log(`Detected as table slide`);
      return 'table';
    }
    
    // Check for image slides - will be treated as content slides
    if (visualLower.includes('image') || 
        visualLower.includes('photo') || 
        visualLower.includes('diagram') || 
        visualLower.includes('picture') || 
        visualLower.includes('illustration')) {
      console.log(`Detected as image content slide`);
      return 'content'; // Return 'content' instead of 'image'
    }
    
    console.log(`Defaulting to content slide`);
    return 'content';
  };

  // Generate initial slides from outline
  const generateInitialSlides = async () => {
    // If we have parsed slide outlines, use them to generate slides
    if (slideOutlines.length > 0) {
      setIsGenerating(true);
      setCurrentSlideIndex(0);
      
      try {
        console.log(`Generating slides from ${slideOutlines.length} slide outlines`);
        const generatedSlides: SlideData[] = [];
        
        for (let i = 0; i < slideOutlines.length; i++) {
          const outline = slideOutlines[i];
          const slideType = outline.slideType;
          console.log(`Generating slide ${i+1}: ${outline.title} (${slideType})`);
          
          // Use our content generation service to create slide content
          const generationRequest: SlideGenerationRequest = {
            slideType,
            slideOutline: outline,
            options: {
              useOutline: true,
              useSupportingEvidence: true
            }
          };
          
          const sections = await slideContentGenerationService.generateSlideContent(generationRequest);
          
          // Create slide object
          const slideContent: SlideData = {
            id: outline.id,
            type: slideType,
            content: {
              title: outline.title,
              sections: sections,
            },
            notes: outline.purpose ? `Purpose: ${outline.purpose}\nKey Takeaway: ${outline.keyTakeaway || ''}` : '',
            research: {
              clientData: pitchContext,
              competitorData: pitchContext.competitors,
              marketData: pitchContext.market
            },
            aiSuggestions: {
              content: outline.keyContent,
              visuals: [outline.visualRecommendation],
              talking_points: [outline.strategicFraming, outline.keyTakeaway]
            }
          };
          
          generatedSlides.push(slideContent);
        }
        
        console.log(`Successfully generated ${generatedSlides.length} slides`);
        setSlides(generatedSlides);
        setCurrentSlideIndex(0);
      } catch (error) {
        console.error('Error generating slides:', error);
        // Fallback to simpler slide generation
        fallbackSlideGeneration();
      } finally {
        setIsGenerating(false);
      }
    } else {
      // Fallback to original method if no outline data is available
      fallbackSlideGeneration();
    }
  };

  // Fallback slide generation when outlines are not available or generation fails
  const fallbackSlideGeneration = async () => {
    setIsGenerating(true);
    setCurrentSlideIndex(0);
    console.warn('Using fallback slide generation');

    try {
      // Use the outline slide count if available, otherwise default to 5
      const totalSlides = Math.max(slideOutlines.length, 5);
      const generatedSlides: SlideData[] = [];

      // Create some default slides
      for (let i = 0; i < totalSlides; i++) {
        let slideType: SlideData['type'];
        let title: string;
        let content: any = {};
        
        if (i === 0) {
          slideType = 'title';
          title = 'Presentation Title';
          content = {
            title,
            subtitle: pitchContext.companyName
          };
        } else if (i === totalSlides - 1) {
          slideType = 'closing';
          title = 'Next Steps';
          content = {
            title,
            body: 'Thank you for your attention!'
          };
        } else if (i === Math.floor(totalSlides / 2)) {
          slideType = 'chart';
          title = `Key Metrics`;
          content = {
            title,
            chartType: 'bar',
            data: {
              labels: ['Q1', 'Q2', 'Q3', 'Q4'],
              values: [30, 50, 60, 80]
            }
          };
        } else if (i === Math.floor(totalSlides / 3)) {
          slideType = 'table';
          title = `Comparison`;
          content = {
            title,
            headers: ['Feature', 'Our Solution', 'Competitor'],
            data: [
              { cells: ['Feature 1', 'Excellent', 'Good'] },
              { cells: ['Feature 2', 'Excellent', 'Average'] },
              { cells: ['Feature 3', 'Good', 'Poor'] }
            ]
          };
        } else {
          slideType = 'content';
          title = `Slide ${i + 1}`;
          content = {
            title,
            body: '• Key Point 1\n• Key Point 2\n• Key Point 3'
          };
        }
        
        const slideContent: SlideData = {
          id: `slide-${i + 1}`,
          type: slideType,
          content,
          notes: '',
          research: {
            clientData: pitchContext,
            competitorData: pitchContext.competitors,
            marketData: pitchContext.market
          },
          aiSuggestions: {
            content: [],
            visuals: [],
            talking_points: []
          }
        };
        
        generatedSlides.push(slideContent);
      }

      setSlides(generatedSlides);
      setCurrentSlideIndex(0);
    } catch (error) {
      console.error('Error in fallback slide generation:', error);
      // Create a single blank slide as a last resort
      const blankSlide: SlideData = {
        id: 'slide-1',
        type: 'title',
        content: {
          title: 'Presentation Title',
          subtitle: pitchContext.companyName
        },
        notes: ''
      };
      setSlides([blankSlide]);
      setCurrentSlideIndex(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSlideUpdate = (index: number, updatedContent: SlideData) => {
    if (index < 0 || index >= slides.length) {
      console.error(`Invalid slide index: ${index}`);
      return;
    }
    
    const newSlides = [...slides];
    newSlides[index] = updatedContent;
    setSlides(newSlides);
  };

  const handleExport = async (options: ExportOptions) => {
    setCurrentSlideIndex(0);
    setActiveTab('export');
    try {
      const exportedFile = await presentationExportService.exportPresentation(slides, options);
      // TODO: Handle the exported file (download, preview, etc.)
    } catch (error) {
      console.error('Error exporting presentation:', error);
      // TODO: Handle error state
    }
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(slides);
    }
  };

  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };
  
  const goToPrevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const generateSlideContent = async (index: number) => {
    if (index < 0 || index >= slides.length) {
      console.error(`Invalid slide index: ${index}`);
      return;
    }
    
    setIsGeneratingContent(true);
    try {
      const slide = slides[index];
      const outline = slideOutlines[index];
      
      if (!outline) {
        console.error('No outline available for this slide');
        return;
      }
      
      // Use our content generation service to generate content
      const generationRequest: SlideGenerationRequest = {
        slideType: slide.type,
        slideOutline: outline,
        options: {
          useOutline: true,
          useSupportingEvidence: true,
          useResearch: true
        }
      };
      
      const sections = await slideContentGenerationService.generateSlideContent(generationRequest);
      
      // Create updated slide with the new content
      const updatedSlide: SlideData = {
        ...slide,
        content: {
          ...slide.content,
          title: outline.title,
          sections
        },
        notes: outline.purpose ? `Purpose: ${outline.purpose}\nKey Takeaway: ${outline.keyTakeaway || ''}` : '',
      };
      
      // Update the slides array
      const newSlides = [...slides];
      newSlides[index] = updatedSlide;
      setSlides(newSlides);
      
      console.log(`Successfully generated content for slide ${index + 1}`);
    } catch (error) {
      console.error('Error generating slide content:', error);
      // TODO: Handle error state
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // Check if we have a valid current slide
  const currentSlide = slides[currentSlideIndex];
  const currentOutline = slideOutlines[currentSlideIndex];

  const handleAddNewSlide = () => {
    // Create a new blank slide and add it to the slides array
    const newSlideId = `slide-${Date.now()}`;
    const newSlideIndex = slides.length;
    
    // Create a default empty slide (content type)
    const newSlide: SlideData = {
      id: newSlideId,
      type: 'content', // Default to content type
      content: {
        title: `New Slide ${newSlideIndex + 1}`,
        body: 'Add your content here'
      }
    };
    
    // Create a default slide outline
    const newOutline: SlideOutlineData = {
      id: newSlideId,
      number: newSlideIndex + 1,
      title: `New Slide ${newSlideIndex + 1}`,
      purpose: 'To be defined',
      keyContent: ['Key point 1', 'Key point 2'],
      supportingEvidence: [],
      keyTakeaway: 'To be defined',
      strategicFraming: '',
      visualRecommendation: '',
      slideType: 'content',
      companyName: pitchContext.companyName
    };
    
    // Add the new slide and outline
    setSlides([...slides, newSlide]);
    setSlideOutlines([...slideOutlines, newOutline]);
    
    // Switch to the new slide
    setCurrentSlideIndex(newSlideIndex);
  };

  // Function to reformat the outline into slides
  const reformatOutline = async () => {
    if (!initialOutline || typeof initialOutline !== 'string' || initialOutline.trim() === '') {
      console.warn('No valid outline to reformat');
      return;
    }
    
    try {
      const parsedSlides = parseOutlineToSlides(initialOutline);
      setSlideOutlines(parsedSlides);
      setParsingError(null);
      console.log(`Reformatted outline into ${parsedSlides.length} slides`);
      
      // Show success toast or feedback
      toast({
        title: "Outline Reformatted",
        description: `Successfully parsed ${parsedSlides.length} slides from the outline.`,
      });
    } catch (error) {
      console.error('Error reformatting outline:', error);
      setParsingError('Failed to parse outline. Please check the format.');
      
      // Show error toast
      toast({
        title: "Reformat Failed",
        description: "Failed to parse outline. Please check the format.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top toolbar */}
      <div className="flex justify-between items-center p-2 border-b">
        <div className="flex items-center space-x-2">
          {/* Slide navigation */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToPrevSlide}
            disabled={currentSlideIndex === 0}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm">
            Slide {currentSlideIndex + 1} of {slides.length}
          </span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToNextSlide}
            disabled={currentSlideIndex >= slides.length - 1}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Slide actions */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddNewSlide}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="h-4 w-4 mr-1" />
            )}
            <span>Add Slide</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab('preview')}
            disabled={slides.length === 0}
          >
            <Eye className="h-4 w-4 mr-1" />
            <span>Preview</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPresentationMode(true)}
            disabled={slides.length === 0}
          >
            <Eye className="h-4 w-4 mr-1" />
            <span>Start Presentation</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPDFExport(true)}
            disabled={slides.length === 0}
          >
            <FileText className="h-4 w-4 mr-1" />
            <span>Export to PDF</span>
          </Button>
          
          {/* Save button */}
          <Button
            onClick={() => setActiveTab('export')}
            disabled={isGenerating}
          >
            <Save className="h-4 w-4 mr-2" />
            <span>Export & Share</span>
          </Button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as WorkflowStep)}>
          <TabsList className="grid grid-cols-3 mb-4 w-auto">
            <TabsTrigger value="edit">Edit Slide</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="export">Export & Share</TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="flex-1">
            <div className="h-full" ref={slideEditorRef}>
              <EnhancedSlideEditor
                slide={currentSlide}
                onChange={(updatedContent) => handleSlideUpdate(currentSlideIndex, updatedContent)}
                slideOutlineData={currentOutline}
                onPreviousSlide={goToPrevSlide}
                onNextSlide={goToNextSlide}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <div className="p-4 bg-gray-100 rounded-md text-center">
              <button 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                onClick={() => setShowPresentationMode(true)}
              >
                Start Presentation Mode
              </button>
            </div>
          </TabsContent>
          
          <TabsContent value="export">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Export Options</h3>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPDFExport(true)}
                  className="flex items-center justify-center h-20"
                >
                  <FileText className="h-6 w-6 mr-2" />
                  <span>Export to PDF</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowPresentationMode(true)}
                  className="flex items-center justify-center h-20"
                >
                  <Eye className="h-6 w-6 mr-2" />
                  <span>Start Presentation</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Presentation Mode */}
      <PresentationMode
        slides={slides}
        initialSlideIndex={currentSlideIndex}
        open={showPresentationMode}
        onClose={() => setShowPresentationMode(false)}
        presentationTitle={pitchContext.clientName 
          ? `Pitch Deck for ${pitchContext.clientName}` 
          : 'Pitch Deck'}
      />
      
      {/* PDF Export Dialog */}
      <ExportToPDF
        slides={slides}
        presentationTitle={pitchContext.clientName 
          ? `Pitch Deck for ${pitchContext.clientName}` 
          : 'Pitch Deck'}
        clientName={pitchContext.clientName}
        open={showPDFExport}
        onClose={() => setShowPDFExport(false)}
      />
    </div>
  );
} 