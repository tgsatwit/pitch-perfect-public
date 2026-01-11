import React from 'react';
import { 
  AlignLeft, 
  AlignRight, 
  AlignHorizontalJustifyCenter, 
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyEnd,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyEnd,
  MoveHorizontal,
  MoveVertical,
  Maximize,
  Minimize,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  CornerDownRight,
  CornerUpLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

// Alignment types
type HorizontalAlignment = 'left' | 'center' | 'right' | 'distribute';
type VerticalAlignment = 'top' | 'middle' | 'bottom' | 'distribute';

export interface AlignmentControlsProps {
  onAlignHorizontal: (alignment: HorizontalAlignment) => void;
  onAlignVertical: (alignment: VerticalAlignment) => void;
  onMoveElement: (direction: 'up' | 'down' | 'left' | 'right', amount: number) => void;
  onBringForward: () => void;
  onBringToFront: () => void;
  onSendBackward: () => void;
  onSendToBack: () => void;
  onDistributeHorizontal?: () => void;
  onDistributeVertical?: () => void;
  multipleElementsSelected?: boolean;
  isGridEnabled?: boolean;
  onToggleGrid?: () => void;
  gridSize?: number;
  onChangeGridSize?: (size: number) => void;
}

export function AlignmentControls({
  onAlignHorizontal,
  onAlignVertical,
  onMoveElement,
  onBringForward,
  onBringToFront,
  onSendBackward,
  onSendToBack,
  onDistributeHorizontal,
  onDistributeVertical,
  multipleElementsSelected = false,
  isGridEnabled = false,
  onToggleGrid,
  gridSize = 10,
  onChangeGridSize
}: AlignmentControlsProps) {

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-sm p-2">
      {/* Title */}
      <div className="text-xs font-medium text-slate-500 mb-2 px-1">
        Alignment & Position
      </div>
      
      {/* Horizontal Alignment Controls */}
      <div className="flex justify-between mb-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => onAlignHorizontal('left')}
            >
              <AlignHorizontalJustifyStart className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Align Left</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => onAlignHorizontal('center')}
            >
              <AlignHorizontalJustifyCenter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Align Center</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => onAlignHorizontal('right')}
            >
              <AlignHorizontalJustifyEnd className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Align Right</p>
          </TooltipContent>
        </Tooltip>
        
        {multipleElementsSelected && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={onDistributeHorizontal}
              >
                <MoveHorizontal className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Distribute Horizontally</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      
      {/* Vertical Alignment Controls */}
      <div className="flex justify-between mb-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => onAlignVertical('top')}
            >
              <AlignVerticalJustifyStart className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Align Top</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => onAlignVertical('middle')}
            >
              <AlignVerticalJustifyCenter className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Align Middle</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => onAlignVertical('bottom')}
            >
              <AlignVerticalJustifyEnd className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Align Bottom</p>
          </TooltipContent>
        </Tooltip>
        
        {multipleElementsSelected && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={onDistributeVertical}
              >
                <MoveVertical className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Distribute Vertically</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      
      <Separator className="my-2" />
      
      {/* Z-index controls */}
      <div className="text-xs font-medium text-slate-500 mb-2 px-1">
        Layering
      </div>
      
      <div className="flex justify-between mb-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={onBringToFront}
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Bring to Front</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={onBringForward}
            >
              <CornerUpLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Bring Forward</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={onSendBackward}
            >
              <CornerDownRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Send Backward</p>
          </TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={onSendToBack}
            >
              <Minimize className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Send to Back</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <Separator className="my-2" />
      
      {/* Position fine-tuning */}
      <div className="text-xs font-medium text-slate-500 mb-2 px-1">
        Position Adjustment
      </div>
      
      <div className="grid grid-cols-3 gap-1 mb-2">
        {/* Empty cell */}
        <div></div>
        
        {/* Up arrow */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => onMoveElement('up', 1)}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Move Up ({gridSize}px)</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Empty cell */}
        <div></div>
        
        {/* Left arrow */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => onMoveElement('left', 1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Move Left ({gridSize}px)</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Grid toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={isGridEnabled ? "default" : "ghost"}
              size="sm" 
              className={cn(
                "h-8 w-8 p-0",
                isGridEnabled && "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 hover:text-indigo-900"
              )}
              onClick={onToggleGrid}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="6" height="6" />
                <rect x="15" y="3" width="6" height="6" />
                <rect x="3" y="15" width="6" height="6" />
                <rect x="15" y="15" width="6" height="6" />
              </svg>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{isGridEnabled ? "Disable" : "Enable"} Snap to Grid</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Right arrow */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => onMoveElement('right', 1)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Move Right ({gridSize}px)</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Empty cell */}
        <div></div>
        
        {/* Down arrow */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => onMoveElement('down', 1)}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Move Down ({gridSize}px)</p>
          </TooltipContent>
        </Tooltip>
        
        {/* Empty cell */}
        <div></div>
      </div>
      
      {/* Grid size control (conditionally shown) */}
      {isGridEnabled && onChangeGridSize && (
        <div className="mt-2">
          <div className="text-xs font-medium text-slate-500 mb-1 px-1">
            Grid Size: {gridSize}px
          </div>
          <div className="flex justify-between items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => onChangeGridSize(Math.max(5, gridSize - 5))}
              disabled={gridSize <= 5}
            >
              <Minimize className="h-3 w-3" />
            </Button>
            
            <div className="w-full h-1 bg-slate-200 rounded-full mx-2">
              <div 
                className="h-1 bg-indigo-500 rounded-full" 
                style={{ width: `${Math.min(100, (gridSize - 5) / 45 * 100)}%` }}
              />
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0" 
              onClick={() => onChangeGridSize(Math.min(50, gridSize + 5))}
              disabled={gridSize >= 50}
            >
              <Maximize className="h-3 w-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AlignmentControls; 