"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PresentationMode } from '@/components/presentation/PresentationMode';
import { SlideData } from '@/components/presentation/types';
import { PresenterNotes } from '@/components/presentation/PresenterNotes';
import { Play, ArrowLeft, FileDown, MessageCircle } from 'lucide-react';
import { ExportToPDF } from '@/components/presentation/ExportToPDF';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function PresentDemo() {
  const [showPresentation, setShowPresentation] = useState(false);
  const [showNotesEditor, setShowNotesEditor] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [presenterNotes, setPresenterNotes] = useState<Record<string, string>>({
    'slide-1': 'Welcome everyone to this presentation about our banking services.\n\n- Introduce the team\n- Mention the client\'s recent challenges\n- Outline the key solutions we\'ll be presenting',
    'slide-3': 'The ROI chart shows a compelling growth curve. Point out that the returns accelerate in years 3-5.',
  });

  // Sample slides for the demo
  const demoSlides: SlideData[] = [
    {
      id: 'slide-1',
      type: 'title',
      content: {
        title: 'Banking Solutions for Enterprise Clients',
        subtitle: 'Pitch Perfect Banking • June 2023',
        sections: [
          {
            id: 'heading-1',
            type: 'heading',
            content: {
              text: 'Banking Solutions for Enterprise Clients',
              level: 1
            },
            position: { x: 480, y: 200 },
            size: { width: 700, height: 100 }
          },
          {
            id: 'text-1',
            type: 'text',
            content: {
              text: 'Pitch Perfect Banking • June 2023'
            },
            position: { x: 480, y: 300 },
            size: { width: 500, height: 60 }
          },
          {
            id: 'image-1',
            type: 'image',
            content: {
              src: 'https://via.placeholder.com/200x100?text=Banking+Logo',
              alt: 'Banking Logo'
            },
            position: { x: 480, y: 100 },
            size: { width: 200, height: 80 }
          }
        ]
      }
    },
    {
      id: 'slide-2',
      type: 'content',
      content: {
        title: 'Executive Summary',
        sections: [
          {
            id: 'heading-2',
            type: 'heading',
            content: {
              text: 'Executive Summary',
              level: 2
            },
            position: { x: 480, y: 80 },
            size: { width: 500, height: 60 }
          },
          {
            id: 'bullet-list-1',
            type: 'bullet-list',
            content: {
              items: [
                'Comprehensive enterprise banking solutions',
                'Specialized services for corporate treasury',
                'Advanced security and fraud prevention',
                'Seamless integration with existing systems',
                'Dedicated support team'
              ]
            },
            position: { x: 480, y: 180 },
            size: { width: 700, height: 250 }
          }
        ]
      }
    },
    {
      id: 'slide-3',
      type: 'chart',
      content: {
        title: 'Return on Investment',
        sections: [
          {
            id: 'heading-3',
            type: 'heading',
            content: {
              text: 'Return on Investment Analysis',
              level: 2
            },
            position: { x: 480, y: 80 },
            size: { width: 600, height: 60 }
          },
          {
            id: 'chart-1',
            type: 'chart',
            content: {
              chartType: 'roi',
              data: [
                { name: 'Year 1', investment: 5000, return: 5500, roi: 10 },
                { name: 'Year 2', investment: 5000, return: 6000, roi: 20 },
                { name: 'Year 3', investment: 5000, return: 7500, roi: 50 },
                { name: 'Year 4', investment: 5000, return: 9000, roi: 80 },
                { name: 'Year 5', investment: 5000, return: 12000, roi: 140 }
              ],
              title: 'ROI Analysis'
            },
            position: { x: 480, y: 180 },
            size: { width: 700, height: 300 }
          }
        ]
      }
    },
    {
      id: 'slide-4',
      type: 'table',
      content: {
        title: 'Competitive Analysis',
        sections: [
          {
            id: 'heading-4',
            type: 'heading',
            content: {
              text: 'Competitive Analysis',
              level: 2
            },
            position: { x: 480, y: 80 },
            size: { width: 500, height: 60 }
          },
          {
            id: 'chart-2',
            type: 'chart',
            content: {
              chartType: 'comparison',
              data: [
                { name: 'Interest Rates', 'Our Bank': 3.5, 'Competitor A': 4.0, 'Competitor B': 4.2 },
                { name: 'Service Fees', 'Our Bank': 0, 'Competitor A': 15, 'Competitor B': 10 },
                { name: 'Online Services', 'Our Bank': 95, 'Competitor A': 80, 'Competitor B': 85 },
                { name: 'Customer Satisfaction', 'Our Bank': 90, 'Competitor A': 75, 'Competitor B': 78 }
              ],
              title: 'Banking Services Comparison'
            },
            position: { x: 480, y: 180 },
            size: { width: 700, height: 300 }
          }
        ]
      }
    },
    {
      id: 'slide-5',
      type: 'closing',
      content: {
        title: 'Next Steps',
        sections: [
          {
            id: 'heading-5',
            type: 'heading',
            content: {
              text: 'Next Steps',
              level: 2
            },
            position: { x: 480, y: 80 },
            size: { width: 500, height: 60 }
          },
          {
            id: 'bullet-list-2',
            type: 'bullet-list',
            content: {
              items: [
                'Schedule technical assessment call',
                'Provide detailed implementation timeline',
                'Introduce dedicated account team',
                'Begin integration planning process',
                'Set up regular progress reviews'
              ]
            },
            position: { x: 480, y: 180 },
            size: { width: 700, height: 250 }
          },
          {
            id: 'text-2',
            type: 'text',
            content: {
              text: 'Thank you for your time and consideration.'
            },
            position: { x: 480, y: 400 },
            size: { width: 500, height: 60 }
          }
        ]
      }
    }
  ];

  const handleEditNotes = (slideId: string) => {
    setActiveSlideIndex(demoSlides.findIndex(slide => slide.id === slideId));
    setShowNotesEditor(true);
  };

  const handleSaveNotes = async (slideId: string, notes: string) => {
    setPresenterNotes(prev => ({
      ...prev,
      [slideId]: notes
    }));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" className="mr-4" asChild>
          <a href="/pitches">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pitches
          </a>
        </Button>
        <h1 className="text-3xl font-bold">Presentation Demo</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white border rounded-md p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Sample Banking Presentation</h2>
            <p className="text-slate-600 mb-6">
              This page demonstrates the presentation mode for client meetings. It includes full-screen mode, 
              slide transitions, presenter notes, and a presentation timer.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {demoSlides.map((slide) => (
                <div 
                  key={slide.id} 
                  className="border rounded-md p-3 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => handleEditNotes(slide.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{slide.content.title}</h3>
                    {presenterNotes[slide.id] && (
                      <MessageCircle className="h-4 w-4 text-indigo-600" />
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{slide.type} slide</p>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <Button
                onClick={() => setShowPresentation(true)}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Presentation
              </Button>

              <ExportToPDF 
                slides={demoSlides}
                presentationTitle="Banking Solutions for Enterprise Clients"
              />
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white border rounded-md p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-3">Presenter Features</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">1</span>
                <span>Full-screen presentation mode</span>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">2</span>
                <span>Presenter view with next slide preview</span>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">3</span>
                <span>Presenter notes for each slide</span>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">4</span>
                <span>Presentation timer</span>
              </li>
              <li className="flex items-start">
                <span className="bg-indigo-100 text-indigo-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">5</span>
                <span>Smooth slide transitions</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border rounded-md p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Keyboard Shortcuts</h2>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-600">Next slide:</div>
              <div className="font-mono bg-slate-100 px-1.5 rounded">→ or Space</div>
              
              <div className="text-slate-600">Previous slide:</div>
              <div className="font-mono bg-slate-100 px-1.5 rounded">← or PageUp</div>
              
              <div className="text-slate-600">Fullscreen:</div>
              <div className="font-mono bg-slate-100 px-1.5 rounded">F</div>
              
              <div className="text-slate-600">Toggle notes:</div>
              <div className="font-mono bg-slate-100 px-1.5 rounded">O</div>
              
              <div className="text-slate-600">Hide controls:</div>
              <div className="font-mono bg-slate-100 px-1.5 rounded">H</div>
              
              <div className="text-slate-600">Exit:</div>
              <div className="font-mono bg-slate-100 px-1.5 rounded">Escape</div>
            </div>
          </div>
        </div>
      </div>

      {/* Presentation mode */}
      {showPresentation && (
        <PresentationMode 
          slides={demoSlides}
          onExit={() => setShowPresentation(false)}
          presenterNotes={presenterNotes}
        />
      )}

      {/* Presenter notes editor */}
      <Dialog open={showNotesEditor} onOpenChange={setShowNotesEditor}>
        <DialogContent className="sm:max-w-[600px]">
          <PresenterNotes 
            slide={demoSlides[activeSlideIndex]}
            notes={presenterNotes[demoSlides[activeSlideIndex].id] || ''}
            onSaveNotes={handleSaveNotes}
            onClose={() => setShowNotesEditor(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 