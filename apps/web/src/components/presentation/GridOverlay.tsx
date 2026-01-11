import React from 'react';
import { cn } from '@/lib/utils';

interface GridOverlayProps {
  visible: boolean;
  gridSize?: number;
  gridColor?: string;
  className?: string;
  width: number;
  height: number;
}

export function GridOverlay({
  visible,
  gridSize = 20,
  gridColor = 'rgba(0, 0, 255, 0.1)',
  className,
  width,
  height
}: GridOverlayProps) {
  if (!visible) return null;

  // Calculate number of vertical and horizontal lines
  const verticalLines = Math.floor(width / gridSize);
  const horizontalLines = Math.floor(height / gridSize);
  
  return (
    <div 
      className={cn(
        "absolute inset-0 pointer-events-none",
        className
      )}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    >
      {/* Vertical lines */}
      {Array.from({ length: verticalLines }).map((_, index) => (
        <div
          key={`v-${index}`}
          className="absolute top-0 bottom-0"
          style={{
            left: `${index * gridSize}px`,
            width: '1px',
            backgroundColor: gridColor,
            height: '100%'
          }}
        />
      ))}
      
      {/* Horizontal lines */}
      {Array.from({ length: horizontalLines }).map((_, index) => (
        <div
          key={`h-${index}`}
          className="absolute left-0 right-0"
          style={{
            top: `${index * gridSize}px`,
            height: '1px',
            backgroundColor: gridColor,
            width: '100%'
          }}
        />
      ))}
    </div>
  );
} 