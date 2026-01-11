import React, { useState } from 'react';
import { 
  PlusCircle, 
  X, 
  Copy, 
  Trash, 
  ChevronUp, 
  ChevronDown,
  Eye,
  EyeOff,
  Pencil,
  FileText,
  BarChart3,
  Table,
  GanttChartSquare
} from 'lucide-react';
import { Draggable, Droppable, DragDropContext, DropResult } from 'react-beautiful-dnd';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { SlideType } from './types';
import { AISlideContent } from './services/PresentationAIService';

interface SlideThumbnailPanelProps {
  slides: AISlideContent[];
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
  onSlideAdd: (type: SlideType) => void;
  onSlideRemove: (index: number) => void;
  onSlideDuplicate: (index: number) => void;
  onSlideReorder: (startIndex: number, endIndex: number) => void;
  onSlideVisibilityToggle: (index: number) => void;
}

export function SlideThumbnailPanel({
  slides,
  currentSlideIndex,
  onSlideSelect,
  onSlideAdd,
  onSlideRemove,
  onSlideDuplicate,
  onSlideReorder,
  onSlideVisibilityToggle
}: SlideThumbnailPanelProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  
  // Handle drag and drop reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    onSlideReorder(sourceIndex, destinationIndex);
  };
  
  // Get icon for slide type
  const getSlideTypeIcon = (type: SlideType | string) => {
    switch (type) {
      case 'title':
        return <FileText className="h-4 w-4" />;
      case 'chart':
        return <BarChart3 className="h-4 w-4" />;
      case 'table':
        return <Table className="h-4 w-4" />;
      case 'timeline':
        return <GanttChartSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white border-r border-slate-200 flex flex-col h-full w-64">
      <div className="p-3 border-b border-slate-200 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700">Slides</h3>
        <div className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setShowAddMenu(!showAddMenu)}
          >
            <PlusCircle className="h-4 w-4" />
          </Button>
          
          {showAddMenu && (
            <div className="absolute right-0 mt-1 w-44 bg-white rounded-md shadow-lg z-10 border border-slate-200">
              <div className="p-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-left text-xs h-8 px-2"
                  onClick={() => {
                    onSlideAdd('title');
                    setShowAddMenu(false);
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Title Slide
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-left text-xs h-8 px-2"
                  onClick={() => {
                    onSlideAdd('content');
                    setShowAddMenu(false);
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Content Slide
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-left text-xs h-8 px-2"
                  onClick={() => {
                    onSlideAdd('chart');
                    setShowAddMenu(false);
                  }}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Chart Slide
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-left text-xs h-8 px-2"
                  onClick={() => {
                    onSlideAdd('table');
                    setShowAddMenu(false);
                  }}
                >
                  <Table className="h-4 w-4 mr-2" />
                  Table Slide
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-left text-xs h-8 px-2"
                  onClick={() => {
                    onSlideAdd('closing');
                    setShowAddMenu(false);
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Closing Slide
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="slides">
          {(provided) => (
            <div 
              className="flex-1 overflow-y-auto p-2 space-y-2"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {slides.map((slide, index) => {
                const isHidden = slide.hidden;
                const isCurrent = index === currentSlideIndex;
                
                return (
                  <Draggable 
                    key={slide.id || `slide-${index}`} 
                    draggableId={slide.id || `slide-${index}`} 
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={cn(
                          "border rounded-md overflow-hidden group transition-all duration-200",
                          isCurrent ? "border-indigo-500 ring-1 ring-indigo-300" : "border-slate-200",
                          isHidden ? "opacity-50" : "opacity-100",
                          snapshot.isDragging ? "shadow-md" : ""
                        )}
                      >
                        <div 
                          className={cn(
                            "flex p-1 items-center justify-between text-xs border-b",
                            isCurrent ? "bg-indigo-50 border-indigo-100" : "bg-slate-50 border-slate-100"
                          )}
                        >
                          <div className="flex items-center">
                            {getSlideTypeIcon(slide.type || 'content')}
                            <span className="ml-1 text-slate-600">Slide {index + 1}</span>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0"
                              onClick={() => onSlideVisibilityToggle(index)}
                              title={isHidden ? "Show slide" : "Hide slide"}
                            >
                              {isHidden ? (
                                <EyeOff className="h-3 w-3 text-slate-400" />
                              ) : (
                                <Eye className="h-3 w-3 text-slate-400" />
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        <div 
                          className="bg-white p-2 cursor-pointer"
                          onClick={() => onSlideSelect(index)}
                        >
                          <div className="aspect-[16/9] w-full h-auto bg-slate-50 flex items-center justify-center rounded overflow-hidden border border-slate-100 text-xs text-slate-400">
                            {/* Simple slide thumbnail preview */}
                            <div className="w-full h-full relative">
                              {/* Title bar */}
                              <div className="absolute top-0 left-0 right-0 h-1/4 flex items-center justify-center">
                                <div className="w-2/3 h-2 bg-slate-300 rounded"></div>
                              </div>
                              
                              {/* Content area based on slide type */}
                              {slide.type === 'chart' && (
                                <div className="absolute top-1/4 left-0 right-0 bottom-0 flex items-center justify-center">
                                  <div className="w-2/3 h-1/2 flex items-end space-x-1">
                                    <div className="h-full w-1/5 bg-indigo-200"></div>
                                    <div className="h-3/4 w-1/5 bg-indigo-300"></div>
                                    <div className="h-2/3 w-1/5 bg-indigo-400"></div>
                                    <div className="h-4/5 w-1/5 bg-indigo-500"></div>
                                    <div className="h-2/5 w-1/5 bg-indigo-600"></div>
                                  </div>
                                </div>
                              )}
                              
                              {slide.type === 'table' && (
                                <div className="absolute top-1/4 left-0 right-0 bottom-0 flex items-center justify-center">
                                  <div className="w-2/3 h-1/2 bg-white border border-slate-200 grid grid-cols-3 grid-rows-2">
                                    {Array.from({ length: 6 }).map((_, i) => (
                                      <div key={i} className="border border-slate-100"></div>
                                    ))}
                                  </div>
                                </div>
                              )}
                              
                              {(slide.type === 'content' || !slide.type) && (
                                <div className="absolute top-1/4 left-0 right-0 bottom-0 flex items-center justify-center">
                                  <div className="w-2/3 h-1/2 flex flex-col space-y-1 items-start">
                                    <div className="h-2 w-full bg-slate-200 rounded"></div>
                                    <div className="h-2 w-5/6 bg-slate-200 rounded"></div>
                                    <div className="h-2 w-4/6 bg-slate-200 rounded"></div>
                                    <div className="h-2 w-full bg-slate-200 rounded"></div>
                                    <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                                  </div>
                                </div>
                              )}
                              
                              {slide.type === 'closing' && (
                                <div className="absolute top-1/4 left-0 right-0 bottom-0 flex flex-col items-center justify-center">
                                  <div className="w-2/3 h-1/6 bg-slate-300 rounded mb-3"></div>
                                  <div className="w-1/2 h-1/3 border-2 border-indigo-300 rounded"></div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div 
                          className={cn(
                            "flex p-1 items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity",
                            "bg-slate-50 border-t border-slate-100"
                          )}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => onSlideDuplicate(index)}
                            title="Duplicate slide"
                          >
                            <Copy className="h-3 w-3 text-slate-400" />
                          </Button>
                          
                          {index > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => onSlideReorder(index, index - 1)}
                              title="Move up"
                            >
                              <ChevronUp className="h-3 w-3 text-slate-400" />
                            </Button>
                          )}
                          
                          {index < slides.length - 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => onSlideReorder(index, index + 1)}
                              title="Move down"
                            >
                              <ChevronDown className="h-3 w-3 text-slate-400" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:text-red-500"
                            onClick={() => onSlideRemove(index)}
                            title="Delete slide"
                          >
                            <Trash className="h-3 w-3 text-slate-400 hover:text-red-500" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
              
              {slides.length === 0 && (
                <div className="p-4 text-center text-slate-400 text-xs">
                  No slides yet. Click the + button to add a slide.
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default SlideThumbnailPanel; 