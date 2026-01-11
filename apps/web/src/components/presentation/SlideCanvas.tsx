'use client';

import React, { useState, useEffect, useRef, forwardRef } from 'react';
import { ContentSection, SlideData } from './types';
import { KonvaClientOnly } from './KonvaClientOnly';

// We need react-konva components synchronously on the client, but we want to avoid SSR issues.
// Instead of next/dynamic (which wraps components in React.lazy and breaks react-konva expectations),
// load the module in a client-side effect and store the concrete components in local state.

const isBrowser = typeof window !== 'undefined';

// Placeholder fallbacks (render nothing during SSR / before load)
const SSRPlaceholder: React.FC<any> = () => null;

// These will be replaced once the module is loaded on the client
let Stage: any = SSRPlaceholder;
let Layer: any = SSRPlaceholder;
let Rect: any = SSRPlaceholder;
let TextNode: any = SSRPlaceholder;
let GroupNode: any = SSRPlaceholder;
let TransformerNode: any = SSRPlaceholder;
let LineNode: any = SSRPlaceholder;
let KonvaImageNode: any = SSRPlaceholder;
let HtmlNode: any = SSRPlaceholder;

if (isBrowser) {
  // Import synchronously in the evaluated bundle on the client
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const konvaMod = require('react-konva');
  const konvaUtils = require('react-konva-utils');
  Stage = konvaMod.Stage;
  Layer = konvaMod.Layer;
  Rect = konvaMod.Rect;
  TextNode = konvaMod.Text;
  GroupNode = konvaMod.Group;
  TransformerNode = konvaMod.Transformer;
  LineNode = konvaMod.Line;
  KonvaImageNode = konvaMod.Image;
  HtmlNode = konvaUtils.Html;
}

// Dynamic import for useImage
const useImageHook = () => {
  const [useImageFunc, setUseImageFunc] = useState<any>(null);
  
  useEffect(() => {
    // Only import on client side
    import('use-image').then((mod) => {
      setUseImageFunc(() => mod.default);
    });
  }, []);
  
  return useImageFunc;
};

// Custom Image component with dynamic useImage
const SlideImage = ({ src, ...props }: { src: string; [key: string]: any }) => {
  const [image, setImage] = useState<HTMLImageElement | undefined>(undefined);
  
  useEffect(() => {
    if (src) {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        setImage(img);
      };
    }
  }, [src]);
  
  if (!image) return null;
  
  return <KonvaImageNode image={image} {...props} />;
};

interface SlideCanvasProps {
  slide: SlideData;
  onElementUpdate: (sectionId: string, updates: Partial<ContentSection>) => void;
  width?: number;
  height?: number;
  editable?: boolean;
}

export const SlideCanvas = forwardRef<any, SlideCanvasProps>((
  { slide, onElementUpdate, width = 960, height = 540, editable = true }, 
  ref
) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sections, setSections] = useState<ContentSection[]>([]);
  // Use the forwarded ref or create a local one
  const internalStageRef = useRef<any>(null);
  const stageRef = ref || internalStageRef;
  const transformerRef = useRef<any>(null);

  // Initialize sections from slide data
  useEffect(() => {
    if (slide?.content?.sections) {
      // Ensure all sections have position and size
      const processedSections = slide.content.sections.map((section) => ({
        ...section,
        position: section.position || { x: 100, y: 100 + Math.random() * 100 },
        size: section.size || { width: 300, height: 100 },
      }));
      setSections(processedSections);
    }
  }, [slide]);

  // Handle selection update
  useEffect(() => {
    const stage = stageRef && 'current' in stageRef ? stageRef.current : stageRef;
    if (selectedId && transformerRef.current && stage) { // Check if stage exists
      // Find selected node
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) {
        // Attach transformer to selected node
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    } else if (!selectedId && transformerRef.current) {
      // Detach transformer if nothing is selected
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw(); // Optional chaining for safety
    }
  }, [selectedId, stageRef]); // Add stageRef to dependency array

  // Check if clicked on empty area
  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  // Handle element transform (resize, move)
  const handleTransform = (sectionId: string, e: any) => {
    if (!editable) return;
    
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Update node scale back to 1
    node.scaleX(1);
    node.scaleY(1);
    
    // Update position and size in our state
    const updatedSections = sections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          position: { x: node.x(), y: node.y() },
          size: { 
            width: Math.max(node.width() * scaleX, 20), // Minimum size
            height: Math.max(node.height() * scaleY, 20)
          }
        };
      }
      return section;
    });
    
    setSections(updatedSections);
    
    // Notify parent component
    const updatedSection = updatedSections.find(section => section.id === sectionId);
    if (updatedSection) {
      onElementUpdate(sectionId, {
        position: updatedSection.position,
        size: updatedSection.size
      });
    }
  };

  // Render content based on section type
  const renderSectionContent = (section: ContentSection) => {
    const { position, size, type, content } = section;

    switch (type) {
      case 'heading':
        return (
          <TextNode
            text={content.text || 'Heading'}
            fontSize={content.level === 1 ? 32 : 24}
            fontStyle="bold"
            width={size?.width || 300}
            align="center"
          />
        );
      
      case 'text':
        return (
          <TextNode
            text={content.text || 'Text content'}
            fontSize={16}
            width={size?.width || 300}
            wrap="word"
          />
        );
      
      case 'bullet-list':
        const bulletItems = content.items || ['Bullet item'];
        return (
          <GroupNode>
            {bulletItems.map((item: string, index: number) => (
              <TextNode
                key={index}
                text={`• ${item}`}
                fontSize={14}
                y={index * 20}
                width={size?.width || 300}
                wrap="word"
              />
            ))}
          </GroupNode>
        );
      
      case 'chart':
        // For chart sections, render the chart using SlideChartComponent
        if (typeof window === 'undefined') {
          return null; // Don't render on server
        }
        
        return (
          <HtmlNode
            transform
            divProps={{
              style: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${size?.width || 300}px`,
                height: `${size?.height || 200}px`,
                pointerEvents: 'none', // Allow clicks to pass through to Konva
              },
            }}
          >
            <div>Chart Placeholder: {content.chartType || 'bar'}</div>
          </HtmlNode>
        );
        
      case 'image':
        return (
          <SlideImage
            src={content.src || ''}
            width={size?.width || 300}
            height={size?.height || 200}
            alt={content.alt || 'Slide image'}
          />
        );
      
      default:
        return <TextNode text={`Unsupported type: ${type}`} />;
    }
  };

  // Add new interface for layered content sections
  interface LayeredContentSection extends ContentSection {
    zIndex?: number;
  }

  // Z-index handlers
  const handleBringForward = (sectionId: string) => {
    const currentSections = sections as LayeredContentSection[];
    const currentIndex = currentSections.findIndex(s => s.id === sectionId);
    
    if (currentIndex < currentSections.length - 1) {
      const newSections = [...currentSections];
      const temp = newSections[currentIndex];
      newSections[currentIndex] = newSections[currentIndex + 1];
      newSections[currentIndex + 1] = temp;
      setSections(newSections);
      // Update zIndex if needed, or let Konva handle draw order
    }
  };

  const handleSendBackward = (sectionId: string) => {
    const currentSections = sections as LayeredContentSection[];
    const currentIndex = currentSections.findIndex(s => s.id === sectionId);
    
    if (currentIndex > 0) {
      const newSections = [...currentSections];
      const temp = newSections[currentIndex];
      newSections[currentIndex] = newSections[currentIndex - 1];
      newSections[currentIndex - 1] = temp;
      setSections(newSections);
    }
  };

  const handleBringToFront = (sectionId: string) => {
    const currentSections = sections as LayeredContentSection[];
    const currentIndex = currentSections.findIndex(s => s.id === sectionId);
    
    if (currentIndex < currentSections.length - 1) {
      const newSections = [
        ...currentSections.slice(0, currentIndex),
        ...currentSections.slice(currentIndex + 1),
        currentSections[currentIndex],
      ];
      setSections(newSections);
    }
  };

  const handleSendToBack = (sectionId: string) => {
    const currentSections = sections as LayeredContentSection[];
    const currentIndex = currentSections.findIndex(s => s.id === sectionId);
    
    if (currentIndex > 0) {
      const newSections = [
        currentSections[currentIndex],
        ...currentSections.slice(0, currentIndex),
        ...currentSections.slice(currentIndex + 1),
      ];
      setSections(newSections);
    }
  };

  // Snap to grid helper
  const snapToGrid = (value: number): number => {
    const gridSize = 20; // Or use state if dynamic
    return Math.round(value / gridSize) * gridSize;
  };

  // Handle drag end with snapping
  const handleDragEnd = (e: any, id: string) => {
    if (!editable) return;
    
    const node = e.target;
    const newX = node.x();
    const newY = node.y();
    
    // Snap to grid if enabled
    // Add snapToGrid logic here if needed
    // newX = snapToGrid(newX);
    // newY = snapToGrid(newY);
    
    handleTransform(id, e);
  };

  // Handle transform end
  const handleTransformEnd = (e: any, id: string) => {
    if (!editable) return;
    
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    node.scaleX(1);
    node.scaleY(1);
    
    const newSize = { 
      width: Math.max(node.width() * scaleX, 20),
      height: Math.max(node.height() * scaleY, 20)
    };
    
    const newPosition = { x: node.x(), y: node.y() };
    
    handleTransform(id, e);
  };

  // Render grid lines
  const renderGrid = () => {
    const gridSize = 20; // Adjust as needed
    const lines = [];
    
    // Vertical lines
    for (let i = 0; i < width / gridSize; i++) {
      lines.push(
        <LineNode
          key={`v-${i}`}
          points={[i * gridSize, 0, i * gridSize, height]}
          stroke="#ddd"
          strokeWidth={0.5}
        />
      );
    }
    
    // Horizontal lines
    for (let j = 0; j < height / gridSize; j++) {
      lines.push(
        <LineNode
          key={`h-${j}`}
          points={[0, j * gridSize, width, j * gridSize]}
          stroke="#ddd"
          strokeWidth={0.5}
        />
      );
    }
    
    return <GroupNode>{lines}</GroupNode>;
  };

  // Context menu (placeholder)
  const renderContextMenu = () => {
    // Implement context menu logic here
    // For now, just a placeholder
    return null;
  };

  return (
    <KonvaClientOnly>
      <Stage
        ref={stageRef} // Use the forwarded ref
        width={width}
        height={height}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
        style={{ backgroundColor: '#f0f0f0', position: 'relative' }}
      >
        <Layer>
          {/* Background rectangle */}
          <Rect
            x={0}
            y={0}
            width={width}
            height={height}
            fill="white"
            listening={false} // Prevent background from capturing clicks
          />
          
          {/* Optional grid */}
          {/* {renderGrid()} */}
          
          {/* Render sections */}
          {sections.map((section) => (
            <GroupNode
              key={section.id}
              id={section.id}
              x={section.position?.x || 0}
              y={section.position?.y || 0}
              width={section.size?.width || 300}
              height={section.size?.height || 100}
              draggable={editable}
              onClick={(e: any) => {
                if (editable) {
                  setSelectedId(section.id);
                  e.cancelBubble = true; // Prevent stage click
                }
              }}
              onTap={(e: any) => { // Handle touch events
                if (editable) {
                  setSelectedId(section.id);
                  e.cancelBubble = true;
                }
              }}
              onDragEnd={(e: any) => handleDragEnd(e, section.id)}
              onTransformEnd={(e: any) => handleTransformEnd(e, section.id)}
            >
              {/* Render content inside the group */}
              {renderSectionContent(section)}
            </GroupNode>
          ))}
          
          {/* Transformer for resizing/rotating */}
          {editable && (
            <TransformerNode
              ref={transformerRef}
              borderEnabled={true}
              borderStroke="#007bff"
              anchorStroke="#007bff"
              anchorFill="#fff"
              anchorSize={8}
              rotateEnabled={false} // Disable rotation for simplicity
              keepRatio={false} // Allow free resizing
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
            />
          )}
        </Layer>
      </Stage>
      {/* Context menu (render outside Konva Stage if using HTML) */}
      {renderContextMenu()}
    </KonvaClientOnly>
  );
});

// Add display name for easier debugging
SlideCanvas.displayName = 'SlideCanvas'; 