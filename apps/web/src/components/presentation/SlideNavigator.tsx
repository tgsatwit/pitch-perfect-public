import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AISlideContent } from './services/PresentationAIService';
import { SlideData, SlideOutlineData, SlideType, ContentSection, ContentSectionType } from './types';
import { EnhancedSlideEditor } from './EnhancedSlideEditor';
import { Button } from '@/components/ui/button';
import { ExportToPDF, SlidesForExport } from './ExportToPDF';
import { PresentationMode } from './PresentationMode';
import { PresenterNotes } from './PresenterNotes';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Settings,
  FileDown,
  MessageCircle,
  Play
} from 'lucide-react';
import { UndoRedo } from './UndoRedo';
import { useHistory } from '@/hooks/use-history';
import { cn } from '@/lib/utils';

interface SlideNavigatorProps {
  slides: AISlideContent[];
  initialOutline: string;
  onSlidesUpdate: (updatedSlides: any[]) => Promise<void>;
}

// Extended slide content type to include sections
interface ExtendedSlideContent extends AISlideContent {
  content: {
    title?: string;
    subtitle?: string;
    body?: string;
    chartType?: 'bar' | 'line' | 'pie';
    data?: any;
    chartTitle?: string;
    headers?: string[];
    style?: string;
    sections?: ContentSection[];
    clientName?: string;
    bankName?: string;
    [key: string]: any;
  }
}

export const SlideNavigator: React.FC<SlideNavigatorProps> = ({
  slides,
  initialOutline,
  onSlidesUpdate
}) => {
  // Use history hook for slides with correct type
  const { 
    state: historySlides, 
    setState: setHistorySlides, 
    undo, 
    redo, 
    canUndo, 
    canRedo 
  } = useHistory<ExtendedSlideContent[]>(slides as ExtendedSlideContent[]);
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [showThumbnails, setShowThumbnails] = useState(true);
  const [presentationMode, setPresentationMode] = useState(false);
  const [presenterNotes, setPresenterNotes] = useState<Record<string, string>>({});
  const [showNotesEditor, setShowNotesEditor] = useState(false);
  
  // Reference to the slide thumbnails container for scrolling
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  
  // Parse outline to get slide data
  const [slideOutlines, setSlideOutlines] = useState<SlideOutlineData[]>([]);
  
  // Determine whether presentation mode should be full screen
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  // Parse outline once on mount or when initialOutline changes
  useEffect(() => {
    if (initialOutline && initialOutline.trim().length > 0) {
      try {
        const parsed = parseOutlineToSlideOutlines(initialOutline);
        setSlideOutlines(parsed);
      } catch (err) {
        console.error('Failed to parse slide outlines:', err);
      }
    }
  }, [initialOutline]);
  
  // Ensure the current slide always has sections stored in history state to avoid regenerated IDs each render (prevents infinite loops)
  useEffect(() => {
    const slide = historySlides[currentSlideIndex];
    // Check if sections are truly missing or empty, not just a different array reference
    if (slide && (!slide.content?.sections || slide.content.sections.length === 0)) {
      console.log(`[SlideNavigator] Initializing default sections for slide ${currentSlideIndex} (ID: ${slide.id})`);
      const defaultSections: ContentSection[] = [];
      // Heading section with deterministic ID
      defaultSections.push({
        id: `heading-${slide.id}`,
        type: 'heading',
        content: {
          text: slide.content?.title || `Slide ${currentSlideIndex + 1}`,
          level: 2
        },
        position: { x: 250, y: 80 },
        size: { width: 500, height: 60 }
      });

      // Body text section with deterministic ID
      if (slide.content?.body) {
        defaultSections.push({
          id: `body-${slide.id}`,
          type: 'text',
          content: {
            text: slide.content.body,
            level: 1
          },
          position: { x: 250, y: 160 },
          size: { width: 500, height: 100 }
        });
      }

      const newSlides = [...historySlides];
      // Ensure the slide object exists before trying to update it
      if (newSlides[currentSlideIndex]) {
          newSlides[currentSlideIndex] = {
            ...slide,
            content: {
              ...slide.content,
              sections: defaultSections
            }
          } as ExtendedSlideContent;
    
          // Update the history state - this WILL add to the undo/redo stack
          setHistorySlides(newSlides);
      }
    }
  }, [currentSlideIndex, historySlides, setHistorySlides]);
  
  // Memoize current slide to avoid new object identity on each render
  const currentSlideMemo: SlideData = useMemo(() => {
    return historySlides[currentSlideIndex] as unknown as SlideData;
  }, [historySlides, currentSlideIndex]);
  
  const handleFullScreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };
  
  // Function to save presenter notes
  const handleSaveNotes = async (slideId: string, notes: string) => {
    setPresenterNotes(prev => ({
      ...prev,
      [slideId]: notes
    }));
    
    // You might want to persist this to a database or local storage
    // For now, we'll just keep it in component state
  };
  
  const parseOutlineToSlideOutlines = (outline: string): SlideOutlineData[] => {
    const outlines: SlideOutlineData[] = [];
    
    // Simple parser to extract slide outlines
    const slideRegex = /##\s*Slide\s*(\d+)[:\-–—.]?\s*(.+?)(?=\n|$)([\s\S]*?)(?=\n##\s*Slide\s*\d+[:\-–—.]?\s*|$)/gi;
    const purposeRegex = /\*\*Purpose:\*\*\s*([^\n]+)/i;
    const keyContentRegex = /\*\*Key Content:\*\*\s*([\s\S]*?)(?=\*\*|$)/i;
    const keyTakeawayRegex = /\*\*Key Takeaway:\*\*\s*([^\n]+)/i;
    const strategicFramingRegex = /\*\*Strategic Framing:\*\*\s*([^\n]+)/i;
    const visualRecommendationRegex = /\*\*Visual Recommendation:\*\*\s*([^\n]+)/i;
    
    let match;
    while ((match = slideRegex.exec(outline)) !== null) {
      const slideNumber = parseInt(match[1]);
      const slideTitle = match[2].trim();
      const slideContent = match[3].trim();
      
      // Extract details using regex
      const purpose = (slideContent.match(purposeRegex) || [])[1] || '';
      
      // Extract bullet points from key content
      const keyContentMatch = slideContent.match(keyContentRegex);
      const keyContentText = keyContentMatch ? keyContentMatch[1] : '';
      const keyContent = keyContentText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('-') || line.startsWith('•'))
        .map(line => line.substring(1).trim());
      
      const keyTakeaway = (slideContent.match(keyTakeawayRegex) || [])[1] || '';
      const strategicFraming = (slideContent.match(strategicFramingRegex) || [])[1] || '';
      const visualRecommendation = (slideContent.match(visualRecommendationRegex) || [])[1] || '';
      
      // Determine slide type from title or content
      let slideType: SlideType = 'content';
      const titleLower = slideTitle.toLowerCase();
      
      if (slideNumber === 1 || titleLower.includes('introduction') || titleLower.includes('cover')) {
        slideType = 'title';
      } else if (titleLower.includes('chart') || titleLower.includes('graph') || visualRecommendation.toLowerCase().includes('chart')) {
        slideType = 'chart';
      } else if (titleLower.includes('table') || titleLower.includes('comparison')) {
        slideType = 'table';
      } else if (slideNumber === slideOutlines.length || titleLower.includes('conclusion') || titleLower.includes('next steps')) {
        slideType = 'closing';
      }
      
      outlines.push({
        id: `slide-${slideNumber}`,
        number: slideNumber,
        title: slideTitle,
        purpose,
        keyContent,
        supportingEvidence: [],
        keyTakeaway,
        strategicFraming,
        visualRecommendation,
        slideType,
        companyName: 'Unknown Company'
      });
    }
    
    return outlines.sort((a, b) => a.number - b.number);
  };
  
  const getCurrentSlide = (): SlideData => currentSlideMemo;
  
  const handleSlideChange = (slideData: SlideData) => {
    const newSlides = [...historySlides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      id: slideData.id,
      type: slideData.type,
      content: {
        ...newSlides[currentSlideIndex].content,
        title: slideData.content.title,
        subtitle: slideData.content.subtitle,
        sections: slideData.content.sections
      }
    };
    
    setHistorySlides(newSlides);
    
    // Autosave changes
    onSlidesUpdate(newSlides);
  };
  
  const handlePreviousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };
  
  const handleNextSlide = () => {
    if (currentSlideIndex < historySlides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };
  
  // Function to scroll to current slide in the thumbnails
  const scrollToCurrentThumbnail = () => {
    if (thumbnailsContainerRef.current) {
      const container = thumbnailsContainerRef.current;
      const currentThumb = container.querySelector(`[data-slide-index="${currentSlideIndex}"]`);
      
      if (currentThumb) {
        container.scrollTo({
          top: (currentThumb as HTMLElement).offsetTop - container.offsetTop - 20,
          behavior: 'smooth'
        });
      }
    }
  };
  
  // Get the current slide outline if available
  const currentOutline = slideOutlines.find(outline => 
    outline.number === currentSlideIndex + 1
  );
  
  // Convert historySlides to AISlideContent[] for export (ExtendedSlideContent extends AISlideContent)
  const slidesForExport: AISlideContent[] = historySlides;
  
  const presentationTitle = historySlides[0]?.content?.title || 'Pitch Presentation';
  
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  return (
    // Root container adapts to fill available space and provides subtle border & background as in new mockup
    <div className="slide-navigator flex flex-col h-[calc(100vh-220px)] border rounded-md bg-background">
      {/* Top controls */}
      <div className="flex items-center justify-between p-2 bg-white border-b">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowThumbnails(!showThumbnails)}
            className="flex items-center"
          >
            {showThumbnails ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="ml-1">{showThumbnails ? 'Hide' : 'Show'} Thumbnails</span>
          </Button>
          
          <div className="border-r h-6 mx-2"></div>
          
          <UndoRedo
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            buttonSize="sm"
          />
          
          {/* Slide navigation arrows and counter */}
          <div className="flex items-center space-x-1 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePreviousSlide}
              disabled={currentSlideIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Previous slide</span>
            </Button>
            <span className="text-xs w-12 text-center text-muted-foreground">
              {currentSlideIndex + 1}/{historySlides.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextSlide}
              disabled={currentSlideIndex >= historySlides.length - 1}
            >
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Next slide</span>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotesEditor(true)}
            className="flex items-center"
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            Presenter Notes
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExportDialog(true)}
            className="flex items-center"
          >
            <FileDown className="h-4 w-4 mr-1" />
            Export
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPresentationMode(true)}
            className="flex items-center"
          >
            <Play className="h-4 w-4 mr-1" />
            Present
          </Button>
        </div>
      </div>
      
      <div className="flex">
        {/* Slide thumbnails sidebar */}
        {showThumbnails && (
          <div className="w-64 border-r h-[calc(100vh-180px)] bg-slate-50 overflow-y-auto" ref={thumbnailsContainerRef}>
            {historySlides.map((slide, index) => (
              <div
                key={slide.id || index}
                data-slide-index={index}
                className={cn(
                  "p-3 border-b cursor-pointer group hover:bg-muted transition-colors",
                  index === currentSlideIndex && "bg-primary/5 border-l-4 border-l-primary"
                )}
                onClick={() => setCurrentSlideIndex(index)}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Slide {index + 1}</span>
                  {slide.type && (
                    <span className="text-xs px-1.5 py-0.5 bg-slate-200 rounded-sm">
                      {slide.type}
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-medium truncate">
                  {slide.content?.title || `Slide ${index + 1}`}
                </h4>
                {slide.content?.subtitle && (
                  <p className="text-xs text-slate-600 truncate">{slide.content.subtitle}</p>
                )}
                
                {/* Presenter notes indicator */}
                {slide.id && presenterNotes[slide.id] && (
                  <div className="mt-1 flex items-center text-xs text-indigo-600">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    <span>Has presenter notes</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Main slide editor area */}
        <div className="flex-1 overflow-hidden bg-white">
          <EnhancedSlideEditor
            slide={getCurrentSlide()}
            onChange={handleSlideChange}
            slideOutlineData={currentOutline}
            onPreviousSlide={handlePreviousSlide}
            onNextSlide={handleNextSlide}
          />
        </div>
      </div>
      
      {/* Hidden container for PDF export */}
      <SlidesForExport 
        slides={slidesForExport} 
      />
      
      {/* Export to PDF dialog */}
      <ExportToPDF 
        slides={slidesForExport}
        presentationTitle={presentationTitle}
        clientName={(historySlides[0] as any)?.content?.clientName}
        open={showExportDialog}
        onClose={() => setShowExportDialog(false)}
      />
      
      {/* Presentation mode dialog */}
      {presentationMode && (
        <PresentationMode 
          slides={slidesForExport}
          initialSlideIndex={currentSlideIndex}
          open={presentationMode}
          onClose={() => setPresentationMode(false)}
        />
      )}
      
      {/* Presenter notes dialog */}
      <Dialog open={showNotesEditor} onOpenChange={setShowNotesEditor}>
        <DialogContent className="sm:max-w-[600px]">
          <PresenterNotes 
            slide={getCurrentSlide()}
            notes={presenterNotes[getCurrentSlide().id] || ''}
            onSaveNotes={handleSaveNotes}
            onClose={() => setShowNotesEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}; 