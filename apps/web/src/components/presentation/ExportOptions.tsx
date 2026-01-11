import React, { useState } from 'react';
import { 
  Download, 
  FileDown, 
  Image, 
  MonitorPlay, 
  Copy, 
  Clock,
  Upload,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AISlideContent } from './services/PresentationAIService';
import { ExportToPDF } from './ExportToPDF';
import { PresentationMode } from './PresentationMode';

import * as htmlToImage from 'html-to-image';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

export interface ExportOptionsProps {
  slides: AISlideContent[];
  presentationTitle: string;
  clientName?: string;
  currentSlideIndex: number;
  currentSlideRef?: React.RefObject<HTMLDivElement>;
  onVersionSave?: () => Promise<void>;
}

export function ExportOptions({
  slides,
  presentationTitle,
  clientName,
  currentSlideIndex,
  currentSlideRef,
  onVersionSave
}: ExportOptionsProps) {
  const [showPDFExport, setShowPDFExport] = useState(false);
  const [showPresentationMode, setShowPresentationMode] = useState(false);
  
  // Export current slide as image
  const exportCurrentSlideAsImage = async (imageFormat: 'png' | 'jpeg' = 'png') => {
    if (!currentSlideRef?.current) return;
    
    try {
      // Create a clone of the slide element to modify before export
      const element = currentSlideRef.current.cloneNode(true) as HTMLElement;
      
      // Remove any editing UI elements
      element.querySelectorAll('.editing-ui, .resize-handle, .selection-indicator').forEach(el => {
        el.remove();
      });
      
      // Append to body temporarily (hidden) to ensure styles are properly applied
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      document.body.appendChild(element);
      
      // Convert to image
      let dataUrl;
      if (imageFormat === 'png') {
        dataUrl = await htmlToImage.toPng(element, { quality: 0.95, pixelRatio: 2 });
      } else {
        dataUrl = await htmlToImage.toJpeg(element, { quality: 0.95, pixelRatio: 2 });
      }
      
      // Remove the temporary element
      document.body.removeChild(element);
      
      // Generate filename
      const slideNumber = currentSlideIndex + 1;
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const filename = `${presentationTitle.replace(/[^a-z0-9]/gi, '_')}_slide_${slideNumber}_${timestamp}.${imageFormat}`;
      
      // Save the file
      saveAs(dataUrl, filename);
    } catch (error) {
      console.error('Error exporting slide as image:', error);
      alert('Failed to export slide as image. Please try again.');
    }
  };
  
  // Export all slides as images
  const exportAllSlidesAsImages = async (imageFormat: 'png' | 'jpeg' = 'png') => {
    alert('This feature will export all slides as separate image files. Not implemented in this demo.');
    // Implementation would require rendering each slide to a canvas and then exporting
  };
  
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-9 gap-1">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Export Options</DropdownMenuLabel>
          
          {/* PDF Export */}
          <DropdownMenuItem onClick={() => setShowPDFExport(true)}>
            <FileText className="h-4 w-4 mr-2" />
            <span>Export to PDF</span>
          </DropdownMenuItem>
          
          {/* Presentation Mode */}
          <DropdownMenuItem onClick={() => setShowPresentationMode(true)}>
            <MonitorPlay className="h-4 w-4 mr-2" />
            <span>Present</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Image Export Options */}
          <DropdownMenuLabel className="text-xs">Export as Image</DropdownMenuLabel>
          
          <DropdownMenuItem onClick={() => exportCurrentSlideAsImage('png')}>
            <Image className="h-4 w-4 mr-2" />
            <span>Current Slide as PNG</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => exportCurrentSlideAsImage('jpeg')}>
            <Image className="h-4 w-4 mr-2" />
            <span>Current Slide as JPEG</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => exportAllSlidesAsImages('png')}>
            <Copy className="h-4 w-4 mr-2" />
            <span>All Slides as PNG</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          {/* Version Saving */}
          {onVersionSave && (
            <DropdownMenuItem onClick={onVersionSave}>
              <Clock className="h-4 w-4 mr-2" />
              <span>Save Version</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* PDF Export Dialog */}
      <ExportToPDF
        slides={slides}
        presentationTitle={presentationTitle}
        clientName={clientName}
        open={showPDFExport}
        onClose={() => setShowPDFExport(false)}
      />
      
      {/* Presentation Mode */}
      <PresentationMode
        slides={slides}
        initialSlideIndex={currentSlideIndex}
        open={showPresentationMode}
        onClose={() => setShowPresentationMode(false)}
        presentationTitle={presentationTitle}
      />
    </>
  );
}

export default ExportOptions; 