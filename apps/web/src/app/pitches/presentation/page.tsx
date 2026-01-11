"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save, Edit, Eye, Trash2, PlusCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

// Define types for slides and presentation data
interface SlideData {
  id: string;
  title: string;
  content: string;
  slideType: string;
  order: number;
  notes?: string;
}

interface PresentationData {
  id: string;
  title: string;
  slides: SlideData[];
  createdAt: any;
  lastUpdatedAt: any;
  pitchId: string;
}

function PresentationEditorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pitchId = searchParams?.get("id");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Fetch the pitch data and generate initial presentation if needed
  useEffect(() => {
    const fetchPitchAndCreatePresentation = async () => {
      if (!pitchId) {
        setError("No pitch ID provided");
        setLoading(false);
        return;
      }
      
      try {
        // Fetch pitch data from Firestore
        const pitchDocRef = doc(db, "pitches", pitchId);
        const pitchDocSnap = await getDoc(pitchDocRef);
        
        if (!pitchDocSnap.exists()) {
          setError("Pitch not found");
          setLoading(false);
          return;
        }
        
        const pitchData = pitchDocSnap.data();
        
        // Create mock presentation data from outline
        // In a real implementation, you would either:
        // 1. Fetch an existing presentation from Firestore
        // 2. Generate a new one from the pitch outline
        
        // For now, let's create a mock presentation based on the outline artifact
        const mockSlides: SlideData[] = generateMockSlidesFromOutline(pitchData);
        
        const mockPresentation: PresentationData = {
          id: "presentation-" + pitchId,
          title: `${pitchData.clientName} Presentation`,
          slides: mockSlides,
          createdAt: new Date().toISOString(),
          lastUpdatedAt: new Date().toISOString(),
          pitchId
        };
        
        setPresentation(mockPresentation);
        
        if (mockSlides.length > 0) {
          setSelectedSlideId(mockSlides[0].id);
        }
        
      } catch (err) {
        console.error("Error fetching pitch data:", err);
        setError("Failed to load presentation data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPitchAndCreatePresentation();
  }, [pitchId]);
  
  // Helper function to generate mock slides from pitch outline
  const generateMockSlidesFromOutline = (pitchData: any): SlideData[] => {
    // In a real implementation, this would parse the outline artifact
    // For now, we'll create some example slides
    
    return [
      {
        id: "slide-1",
        title: "Title Slide",
        content: `# ${pitchData.clientName}\n\nStrategic Partnership Proposal`,
        slideType: "title",
        order: 1
      },
      {
        id: "slide-2",
        title: "Agenda",
        content: "## Today's Discussion\n\n* Understanding Your Needs\n* Our Unique Approach\n* Proposed Solution\n* Implementation Timeline\n* Next Steps",
        slideType: "agenda",
        order: 2
      },
      {
        id: "slide-3",
        title: "Client Overview",
        content: `## ${pitchData.clientName} Overview\n\n* Industry leader in ${pitchData.clientIndustry || "your industry"}\n* Current challenges include...\n* Looking for solutions to...\n* Strategic priorities include...`,
        slideType: "content",
        order: 3
      },
      {
        id: "slide-4",
        title: "Our Solution",
        content: "## Tailored Solution\n\n* Comprehensive approach to address your needs\n* Leveraging our expertise in...\n* Proven methodology with demonstrated results\n* Customized implementation plan",
        slideType: "content",
        order: 4
      },
      {
        id: "slide-5",
        title: "Implementation Timeline",
        content: "## Project Roadmap\n\n* Phase 1: Discovery and Planning (2 weeks)\n* Phase 2: Initial Implementation (4 weeks)\n* Phase 3: Testing and Optimization (2 weeks)\n* Phase 4: Launch and Support (ongoing)",
        slideType: "timeline",
        order: 5
      },
      {
        id: "slide-6",
        title: "Next Steps",
        content: "## Moving Forward\n\n* Review proposal details\n* Schedule follow-up discussion\n* Identify key stakeholders\n* Finalize agreement and timeline",
        slideType: "content",
        order: 6
      }
    ];
  };
  
  const selectedSlide = presentation?.slides.find(slide => slide.id === selectedSlideId);
  
  // Handle selecting a slide
  const handleSlideSelect = (slideId: string) => {
    setSelectedSlideId(slideId);
  };
  
  // Handle navigating to previous slide
  const handlePreviousSlide = () => {
    if (!presentation || !selectedSlideId) return;
    
    const currentIndex = presentation.slides.findIndex(s => s.id === selectedSlideId);
    if (currentIndex > 0) {
      setSelectedSlideId(presentation.slides[currentIndex - 1].id);
    }
  };
  
  // Handle navigating to next slide
  const handleNextSlide = () => {
    if (!presentation || !selectedSlideId) return;
    
    const currentIndex = presentation.slides.findIndex(s => s.id === selectedSlideId);
    if (currentIndex < presentation.slides.length - 1) {
      setSelectedSlideId(presentation.slides[currentIndex + 1].id);
    }
  };
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-slate-700 mb-6">{error}</p>
          <Link href="/pitches">
            <Button variant="outline">Back to Pitches</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between py-2 px-8 border-b border-slate-300 bg-gradient-to-r from-indigo-100 via-purple-100 to-slate-100 text-slate-800 shadow-sm">
        {/* Left Side: Back and Title */}
        <div className="flex items-center gap-3">
          <Link href={`/pitches/new?id=${pitchId}`}>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <ChevronLeft className="h-4 w-4" />
              Back to Outline
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">{presentation?.title || "Presentation Editor"}</h1>
        </div>
        
        {/* Right Side: Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleEditMode}
            className="flex items-center gap-1"
          >
            {editMode ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
            {editMode ? "View Mode" : "Edit Mode"}
          </Button>
          
          <Button 
            variant="default" 
            size="sm"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-sm flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            Save Presentation
          </Button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Slide Navigator */}
        <div className="w-[320px] bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="font-medium text-slate-800">Slides</h2>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
              <PlusCircle className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {presentation?.slides.map((slide, index) => (
              <div 
                key={slide.id}
                onClick={() => handleSlideSelect(slide.id)}
                className={`rounded-md border cursor-pointer transition-all duration-200 ${
                  selectedSlideId === slide.id 
                    ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start p-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-md bg-indigo-100 text-indigo-800 flex items-center justify-center font-semibold text-sm border border-indigo-200">
                    {index + 1}
                  </div>
                  <div className="ml-3 flex-1">
                    <h3 className="font-medium text-slate-800 text-sm">{slide.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {slide.content.replace(/[#*]/g, '').substring(0, 80)}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Slide Editor/Viewer */}
        <div className="flex-1 bg-slate-100 p-6 flex flex-col">
          {selectedSlide ? (
            <>
              <div className="bg-white rounded-lg shadow-md flex-1 flex flex-col">
                {/* Slide controls */}
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                  <h2 className="font-medium text-slate-800">
                    {selectedSlide.title} <span className="text-slate-400 text-sm">({selectedSlide.slideType})</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={!presentation || presentation.slides.findIndex(s => s.id === selectedSlideId) === 0}
                      className="text-slate-500"
                      onClick={handlePreviousSlide}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      disabled={!presentation || presentation.slides.findIndex(s => s.id === selectedSlideId) === presentation.slides.length - 1}
                      className="text-slate-500"
                      onClick={handleNextSlide}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Slide content */}
                <div className="flex-1 p-8 overflow-auto">
                  {editMode ? (
                    <textarea 
                      className="w-full h-full p-4 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                      value={selectedSlide.content}
                      onChange={(e) => {
                        // In real implementation, update slide content state here
                        console.log("Updating slide content:", e.target.value);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-[800px] h-[450px] bg-white rounded-md shadow-lg border border-slate-200 p-10 flex flex-col">
                        <div className="prose prose-slate max-w-none">
                          {/* Convert markdown to HTML */}
                          {selectedSlide.content.split('\n').map((line, i) => {
                            if (line.startsWith('# ')) {
                              return <h1 key={i} className="text-3xl font-bold mb-6">{line.substring(2)}</h1>;
                            } else if (line.startsWith('## ')) {
                              return <h2 key={i} className="text-2xl font-semibold mb-4">{line.substring(3)}</h2>;
                            } else if (line.startsWith('* ')) {
                              return <li key={i} className="mb-2">{line.substring(2)}</li>;
                            } else if (line === '') {
                              return <br key={i} />;
                            } else {
                              return <p key={i} className="mb-2">{line}</p>;
                            }
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Slide notes (visible in edit mode) */}
                {editMode && (
                  <div className="p-4 border-t border-slate-200">
                    <h3 className="font-medium text-slate-700 text-sm mb-2">Presenter Notes</h3>
                    <textarea 
                      className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-mono text-sm h-20"
                      value={selectedSlide.notes || ''}
                      placeholder="Add presenter notes here..."
                      onChange={(e) => {
                        // In real implementation, update slide notes state here
                        console.log("Updating slide notes:", e.target.value);
                      }}
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-500">Select a slide to view or edit.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PresentationEditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PresentationEditorPageContent />
    </Suspense>
  );
} 