'use client';

import React, { useState } from 'react';
import { SlideCanvas } from './SlideCanvas';
import { SlideData, ContentSection } from './types';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const SlideCanvasDemo: React.FC = () => {
  // Sample slide data with various content types
  const [slide, setSlide] = useState<SlideData>({
    id: 'demo-slide-1',
    type: 'content',
    content: {
      title: 'Demo Slide',
      sections: [
        {
          id: 'heading-1',
          type: 'heading',
          content: {
            text: 'Banking Services Proposal',
            level: 1
          },
          position: { x: 250, y: 50 },
          size: { width: 500, height: 60 }
        },
        {
          id: 'text-1',
          type: 'text',
          content: {
            text: 'This is a sample presentation showing the capabilities of our canvas-based slide editor. You can drag and resize elements.'
          },
          position: { x: 250, y: 130 },
          size: { width: 500, height: 80 }
        },
        {
          id: 'bullet-list-1',
          type: 'bullet-list',
          content: {
            items: [
              'Premium Banking Services',
              'Financial Advisory',
              'Investment Portfolio Management',
              'Exclusive C-Suite Benefits'
            ]
          },
          position: { x: 250, y: 230 },
          size: { width: 500, height: 120 }
        }
      ]
    }
  });

  // Handle updates to slide elements
  const handleElementUpdate = (sectionId: string, updates: Partial<ContentSection>) => {
    setSlide(prevSlide => {
      if (!prevSlide.content.sections) return prevSlide;
      
      // Update the specific section with new properties
      const updatedSections = prevSlide.content.sections.map(section => {
        if (section.id === sectionId) {
          return { ...section, ...updates };
        }
        return section;
      });
      
      return {
        ...prevSlide,
        content: {
          ...prevSlide.content,
          sections: updatedSections
        }
      };
    });
  };

  // Add a new text element to the slide
  const addTextElement = () => {
    setSlide(prevSlide => {
      const newSection: ContentSection = {
        id: `text-${Date.now()}`,
        type: 'text',
        content: {
          text: 'New text element. Edit this content.'
        },
        position: { x: 300, y: 350 },
        size: { width: 300, height: 80 }
      };
      
      return {
        ...prevSlide,
        content: {
          ...prevSlide.content,
          sections: [...(prevSlide.content.sections || []), newSection]
        }
      };
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center p-2 bg-slate-100 rounded">
        <h2 className="text-xl font-semibold">Canvas Slide Editor Demo</h2>
        <div className="flex gap-2">
          <Button size="sm" onClick={addTextElement} className="flex items-center">
            <Plus className="h-4 w-4 mr-1" />
            Add Text
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <SlideCanvas 
          slide={slide} 
          onElementUpdate={handleElementUpdate}
        />
      </div>
      
      <div className="bg-slate-100 p-2 rounded">
        <h3 className="text-sm font-medium mb-2">Element Positions (Updated in Real-time):</h3>
        <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-40">
          {JSON.stringify(slide.content.sections, null, 2)}
        </pre>
      </div>
    </div>
  );
}; 