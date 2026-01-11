import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Maximize2,
  Minimize2,
  List,
  Monitor,
  Eye,
  Grid,
  PlayCircle,
  FileText,
  BarChart3,
  Table
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AISlideContent } from './services/PresentationAIService';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export interface PresentationModeProps {
  slides: AISlideContent[];
  initialSlideIndex?: number;
  open: boolean;
  onClose: () => void;
  presentationTitle?: string;
}

export function PresentationMode({
  slides,
  initialSlideIndex = 0,
  open,
  onClose,
  presentationTitle = 'Pitch Deck'
}: PresentationModeProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlideIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  // Get visible slides only
  const visibleSlides = slides.filter(slide => !slide.hidden);
  
  // Reset to first slide when opening
  useEffect(() => {
    if (open) {
      setCurrentSlideIndex(initialSlideIndex);
    }
  }, [open, initialSlideIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;
      
      switch (event.key) {
        case 'ArrowRight':
        case 'Space':
          goToNextSlide();
          break;
        case 'ArrowLeft':
          goToPreviousSlide();
          break;
        case 'Escape':
          if (isFullscreen) {
            exitFullscreen();
          } else {
            onClose();
          }
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'h':
          setShowControls(prev => !prev);
          break;
        case 't':
          setShowThumbnails(prev => !prev);
          break;
        case 'Home':
          setCurrentSlideIndex(0);
          break;
        case 'End':
          setCurrentSlideIndex(visibleSlides.length - 1);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, currentSlideIndex, visibleSlides.length, isFullscreen]);
  
  // Handle fullscreen
  const enterFullscreen = useCallback(() => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    }
    setIsFullscreen(true);
  }, []);
  
  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  }, []);
  
  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);
  
  // Handle slide navigation
  const goToNextSlide = useCallback(() => {
    if (currentSlideIndex < visibleSlides.length - 1) {
      setCurrentSlideIndex(prevIndex => prevIndex + 1);
    }
  }, [currentSlideIndex, visibleSlides.length]);
  
  const goToPreviousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prevIndex => prevIndex - 1);
    }
  }, [currentSlideIndex]);
  
  const goToSlide = (index: number) => {
    if (index >= 0 && index < visibleSlides.length) {
      setCurrentSlideIndex(index);
    }
  };
  
  // Check if we have slides to present
  if (visibleSlides.length === 0) {
    return (
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-md">
          <div className="p-4 text-center">
            <h3 className="text-lg font-medium mb-2">No Slides to Present</h3>
            <p className="text-sm text-gray-500 mb-4">
              There are no visible slides in this presentation. Please add slides or make existing slides visible.
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  const currentSlide = visibleSlides[currentSlideIndex];
  
  return (
    <div 
      className={cn(
        "fixed inset-0 bg-black flex flex-col z-50",
        isFullscreen ? "fullscreen-mode" : "",
        !open && "hidden"
      )}
    >
      {/* Presentation Header */}
      {showControls && (
        <div className="flex justify-between items-center p-2 bg-black text-white">
          <div className="text-sm font-medium">{presentationTitle}</div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 text-white hover:bg-gray-800"
              onClick={() => setShowThumbnails(prev => !prev)}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 text-white hover:bg-gray-800"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 w-8 p-0 text-white hover:bg-gray-800"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Main Presentation Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Thumbnails Sidebar */}
        {showThumbnails && (
          <div className="w-48 bg-gray-900 overflow-y-auto">
            {visibleSlides.map((slide, index) => (
              <div 
                key={slide.id || `slide-${index}`}
                className={cn(
                  "p-2 cursor-pointer hover:bg-gray-800 border-l-2",
                  index === currentSlideIndex 
                    ? "border-indigo-500 bg-gray-800" 
                    : "border-transparent"
                )}
                onClick={() => goToSlide(index)}
              >
                <div className="aspect-video bg-black rounded overflow-hidden flex items-center justify-center text-xs text-white mb-1">
                  {/* Simple thumbnail preview */}
                  <div className="w-full aspect-video relative">
                    {slide.type === 'chart' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 opacity-50" />
                      </div>
                    )}
                    {slide.type === 'table' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Table className="h-4 w-4 opacity-50" />
                      </div>
                    )}
                    {(slide.type === 'content' || !slide.type) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FileText className="h-4 w-4 opacity-50" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-white truncate">
                  Slide {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Current Slide */}
        <div 
          className="flex-1 flex items-center justify-center bg-black relative"
          onClick={() => setShowControls(prev => !prev)}
        >
          <div 
            className="bg-white aspect-[16/9] max-h-full max-w-full relative overflow-hidden shadow-xl"
            style={{ height: 'calc(100vh - 6rem)' }}
          >
            {/* Slide Title */}
            {currentSlide.content?.title && (
              <div className="absolute top-10 left-0 right-0 px-12 text-center">
                <h2 className="text-3xl font-bold text-gray-800">
                  {currentSlide.content.title}
                </h2>
              </div>
            )}
            
            {/* Slide Content */}
            <div className="absolute top-24 left-12 right-12 bottom-12 overflow-auto">
              {/* Text content */}
              {currentSlide.content?.body && (
                <div className="text-xl mb-8 whitespace-pre-line">
                  {currentSlide.content.body}
                </div>
              )}
              
              {/* Blocks (bullets, etc) */}
              {currentSlide.content?.blocks && (
                <div className="space-y-4">
                  {currentSlide.content.blocks.map((block, i) => (
                    <div key={i}>
                      {block.type === 'bullet' ? (
                        <div className="flex items-start space-x-2 text-xl">
                          <span className="text-indigo-500">•</span>
                          <div>{block.content}</div>
                        </div>
                      ) : (
                        <div className="text-xl">{block.content}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Chart placeholder */}
              {currentSlide.type === 'chart' && (
                <div className="w-full aspect-[4/3] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-indigo-500" />
                    <div className="text-lg font-medium text-gray-700">
                      {currentSlide.content?.chartTitle || 'Chart Data'}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Table placeholder */}
              {currentSlide.type === 'table' && (
                <div className="w-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <div className="p-4 text-center">
                    <Table className="h-12 w-12 mx-auto mb-2 text-indigo-500" />
                    <div className="text-lg font-medium text-gray-700">
                      {currentSlide.content?.title || 'Table Data'}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Slide number */}
            <div className="absolute bottom-2 right-4 text-sm text-gray-400">
              {currentSlideIndex + 1} / {visibleSlides.length}
            </div>
          </div>
          
          {/* Navigation Arrows - shown when showControls is true */}
          {showControls && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-black/30 text-white hover:bg-black/50"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPreviousSlide();
                }}
                disabled={currentSlideIndex === 0}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-4 top-1/2 transform -translate-y-1/2 h-12 w-12 rounded-full bg-black/30 text-white hover:bg-black/50"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextSlide();
                }}
                disabled={currentSlideIndex === visibleSlides.length - 1}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Bottom Controls */}
      {showControls && (
        <div className="h-10 bg-black flex items-center justify-between p-2 text-white">
          <div className="text-xs">
            Press <kbd className="px-1 py-0.5 bg-gray-800 rounded">←</kbd> / <kbd className="px-1 py-0.5 bg-gray-800 rounded">→</kbd> to navigate • 
            <kbd className="px-1 py-0.5 bg-gray-800 rounded ml-2">F</kbd> for fullscreen • 
            <kbd className="px-1 py-0.5 bg-gray-800 rounded ml-2">H</kbd> to hide controls • 
            <kbd className="px-1 py-0.5 bg-gray-800 rounded ml-2">T</kbd> for thumbnails • 
            <kbd className="px-1 py-0.5 bg-gray-800 rounded ml-2">ESC</kbd> to exit
          </div>
          <div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-6 text-xs px-2 text-white hover:bg-gray-800"
              onClick={() => goToSlide(0)}
            >
              Start
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PresentationMode; 