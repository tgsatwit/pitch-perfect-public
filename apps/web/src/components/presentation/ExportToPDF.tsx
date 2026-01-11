import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Download, 
  FileText, 
  Loader2, 
  Settings, 
  Printer,
  PictureInPicture,
  X
} from 'lucide-react';
import { AISlideContent } from './services/PresentationAIService';
import { format } from 'date-fns';

export interface ExportToPDFProps {
  slides: AISlideContent[];
  presentationTitle?: string;
  clientName?: string;
  onClose?: () => void;
  open: boolean;
}

export function ExportToPDF({ 
  slides, 
  presentationTitle = "Pitch Deck", 
  clientName,
  onClose,
  open
}: ExportToPDFProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportOptions, setExportOptions] = useState({
    includePageNumbers: true,
    includeDateFooter: true,
    includeHiddenSlides: false,
    paperSize: 'letter',
    orientation: 'landscape',
    quality: 'high',
    filename: presentationTitle ? 
      `${presentationTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}` : 
      `Pitch_Deck_${format(new Date(), 'yyyy-MM-dd')}`
  });
  
  // Refs for dynamically rendered slides
  const slidesContainerRef = useRef<HTMLDivElement>(null);
  
  const handleExport = async () => {
    if (!slidesContainerRef.current || slides.length === 0) return;
    
    try {
      setIsExporting(true);
      setExportProgress(0);
      
      // Filter out hidden slides if needed
      const slidesToExport = exportOptions.includeHiddenSlides 
        ? slides 
        : slides.filter(slide => !slide.hidden);
      
      if (slidesToExport.length === 0) {
        alert("No slides to export. Please include hidden slides or add visible slides.");
        setIsExporting(false);
        return;
      }
      
      // Initialize PDF with the selected paper size and orientation
      const pdf = new jsPDF({
        orientation: exportOptions.orientation as any,
        unit: 'mm',
        format: exportOptions.paperSize as any
      });
      
      const slideElements = slidesContainerRef.current.querySelectorAll('.export-slide');
      
      // Configure PDF metadata
      pdf.setProperties({
        title: presentationTitle,
        subject: `Pitch Deck for ${clientName || 'Client'}`,
        author: 'Pitch Perfect',
        creator: 'Pitch Perfect PDF Export'
      });
      
      // Export each slide one by one
      for (let i = 0; i < slideElements.length; i++) {
        const slideElement = slideElements[i] as HTMLElement;
        
        // Set progress
        setExportProgress(Math.round(((i + 1) / slideElements.length) * 100));
        
        // Use html2canvas to capture the slide
        const canvas = await html2canvas(slideElement, {
          scale: exportOptions.quality === 'high' ? 2 : 1, // Higher scale for better quality
          useCORS: true, // Enable cross-origin image loading
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
        });
        
        // Get PDF page dimensions
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Calculate image dimensions to fit the page while maintaining aspect ratio
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add a new page for slides after the first one
        if (i > 0) pdf.addPage();
        
        // Add the slide image
        const imgData = canvas.toDataURL('image/jpeg', exportOptions.quality === 'high' ? 0.95 : 0.85);
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        
        // Add page number if enabled
        if (exportOptions.includePageNumbers) {
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          pdf.text(`Page ${i + 1} of ${slideElements.length}`, pageWidth - 20, pageHeight - 5);
        }
        
        // Add date footer if enabled
        if (exportOptions.includeDateFooter) {
          pdf.setFontSize(8);
          pdf.setTextColor(100, 100, 100);
          
          const currentDate = format(new Date(), 'MMMM d, yyyy');
          pdf.text(currentDate, 10, pageHeight - 5);
          
          // Add client name if available
          if (clientName) {
            pdf.text(`For: ${clientName}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
          }
        }
      }
      
      // Save the PDF
      pdf.save(`${exportOptions.filename}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setExportProgress(0);
      if (onClose) onClose();
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Export Presentation to PDF
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4 py-4">
          <div>
            <Label htmlFor="filename" className="text-sm font-medium mb-1.5 block">Filename</Label>
            <Input 
              id="filename" 
              value={exportOptions.filename}
              onChange={(e) => setExportOptions({...exportOptions, filename: e.target.value})}
              className="h-9 text-sm"
            />
          </div>
          
          <div>
            <Label htmlFor="paperSize" className="text-sm font-medium mb-1.5 block">Paper Size</Label>
            <Select 
              value={exportOptions.paperSize}
              onValueChange={(value) => setExportOptions({...exportOptions, paperSize: value})}
            >
              <SelectTrigger id="paperSize" className="h-9 text-sm">
                <SelectValue placeholder="Select paper size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="letter">Letter (8.5" × 11")</SelectItem>
                <SelectItem value="a4">A4 (210mm × 297mm)</SelectItem>
                <SelectItem value="legal">Legal (8.5" × 14")</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="orientation" className="text-sm font-medium mb-1.5 block">Orientation</Label>
            <Select 
              value={exportOptions.orientation}
              onValueChange={(value) => setExportOptions({...exportOptions, orientation: value})}
            >
              <SelectTrigger id="orientation" className="h-9 text-sm">
                <SelectValue placeholder="Select orientation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="landscape">Landscape</SelectItem>
                <SelectItem value="portrait">Portrait</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="quality" className="text-sm font-medium mb-1.5 block">Quality</Label>
            <Select 
              value={exportOptions.quality}
              onValueChange={(value) => setExportOptions({...exportOptions, quality: value})}
            >
              <SelectTrigger id="quality" className="h-9 text-sm">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High (Larger file)</SelectItem>
                <SelectItem value="medium">Medium (Balanced)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-3">
          <Label className="text-sm font-medium">Options</Label>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="includePageNumbers" 
              checked={exportOptions.includePageNumbers} 
              onCheckedChange={(checked) => 
                setExportOptions({...exportOptions, includePageNumbers: !!checked})
              }
            />
            <Label htmlFor="includePageNumbers" className="text-sm">Include page numbers</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="includeDateFooter" 
              checked={exportOptions.includeDateFooter} 
              onCheckedChange={(checked) => 
                setExportOptions({...exportOptions, includeDateFooter: !!checked})
              }
            />
            <Label htmlFor="includeDateFooter" className="text-sm">Include date and client name</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="includeHiddenSlides" 
              checked={exportOptions.includeHiddenSlides} 
              onCheckedChange={(checked) => 
                setExportOptions({...exportOptions, includeHiddenSlides: !!checked})
              }
            />
            <Label htmlFor="includeHiddenSlides" className="text-sm">Include hidden slides</Label>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting ({exportProgress}%)
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export to PDF
              </>
            )}
          </Button>
        </DialogFooter>
        
        {/* Hidden container for slides to be exported */}
        <div className="hidden">
          <div ref={slidesContainerRef}>
            <SlidesForExport 
              slides={exportOptions.includeHiddenSlides ? slides : slides.filter(slide => !slide.hidden)} 
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Component for rendering slides to be exported
export interface SlidesForExportProps {
  slides: AISlideContent[];
}

export function SlidesForExport({ slides }: SlidesForExportProps) {
  return (
    <div className="export-slides-container">
      {slides.map((slide, index) => (
        <div 
          key={slide.id || `slide-${index}`} 
          className="export-slide" 
          style={{ 
            width: '1024px',
            height: '576px',
            backgroundColor: 'white',
            position: 'relative',
            overflow: 'hidden',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          {/* Slide Title */}
          {slide.content?.title && (
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              position: 'absolute',
              top: '40px',
              left: '60px',
              right: '60px',
              textAlign: 'center'
            }}>
              {slide.content.title}
            </div>
          )}
          
          {/* Slide Content */}
          <div style={{
            position: 'absolute',
            top: '100px',
            left: '60px',
            right: '60px',
            bottom: '60px',
            fontSize: '18px'
          }}>
            {/* Body Content */}
            {slide.content?.body && (
              <div style={{ whiteSpace: 'pre-line' }}>
                {slide.content.body}
              </div>
            )}
            
            {/* Render blocks if available */}
            {slide.content?.blocks && slide.content.blocks.length > 0 && (
              <div>
                {slide.content.blocks.map((block, blockIndex) => (
                  <div key={blockIndex} style={{ marginBottom: '12px' }}>
                    {block.type === 'bullet' ? (
                      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span style={{ marginRight: '8px', marginTop: '5px' }}>•</span>
                        <span>{block.content}</span>
                      </div>
                    ) : (
                      <div style={{ marginBottom: '8px' }}>
                        {block.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* For chart/table slides, add placeholder */}
            {slide.type === 'chart' && (
              <div style={{
                border: '1px dashed #ccc',
                padding: '20px',
                textAlign: 'center',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}>
                [Chart: {slide.content?.chartTitle || 'Financial Data'}]
              </div>
            )}
            
            {slide.type === 'table' && (
              <div style={{
                border: '1px dashed #ccc',
                padding: '20px',
                textAlign: 'center',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}>
                [Table: {slide.content?.title || 'Data Comparison'}]
              </div>
            )}
          </div>
          
          {/* Slide Number */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            fontSize: '12px',
            color: '#666'
          }}>
            {index + 1}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ExportToPDF; 