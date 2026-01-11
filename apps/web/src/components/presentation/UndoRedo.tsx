import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { Undo2, Redo2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface UndoRedoProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  buttonVariant?: ButtonProps['variant'];
  buttonSize?: ButtonProps['size'];
  className?: string;
}

export const UndoRedo: React.FC<UndoRedoProps> = ({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  buttonVariant = 'ghost',
  buttonSize = 'icon',
  className,
}) => {
  return (
    <div className={`flex items-center space-x-1 ${className || ''}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={buttonVariant}
              size={buttonSize}
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Undo (Ctrl+Z)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={buttonVariant}
              size={buttonSize}
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Redo (Ctrl+Y)</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}; 