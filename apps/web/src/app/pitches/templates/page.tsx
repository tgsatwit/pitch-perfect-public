'use client';

import React from 'react';
import { SlideTemplates } from '@/components/presentation/SlideTemplates';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SlideCanvas } from '@/components/presentation/SlideCanvas';
import { createTitleSlide, createExecutiveSummarySlide, createFinancialDataSlide, createCompetitiveAnalysisSlide, createTimelineSlide, createConclusionSlide, createServicesSlide } from '@/components/presentation/SlideTemplates';

export default function TemplatesDemoPage() {
  // Demo templates with sample data
  const templateOptions = {
    clientName: 'Global Industries Corp.',
    bankName: 'Fusion Banking Partners',
    date: 'October 2023'
  };
  
  // Create sample slides
  const titleSlide = createTitleSlide('title-demo', templateOptions);
  const executiveSummarySlide = createExecutiveSummarySlide('exec-demo', templateOptions);
  const financialSlide = createFinancialDataSlide('financial-demo', templateOptions);
  const competitiveSlide = createCompetitiveAnalysisSlide('competitive-demo', templateOptions);
  const timelineSlide = createTimelineSlide('timeline-demo', templateOptions);
  const servicesSlide = createServicesSlide('services-demo', templateOptions);
  const conclusionSlide = createConclusionSlide('conclusion-demo', templateOptions);
  
  const slideTemplates = [
    { id: 'title', name: 'Title Slide', slide: titleSlide },
    { id: 'executive', name: 'Executive Summary', slide: executiveSummarySlide },
    { id: 'financial', name: 'Financial Data', slide: financialSlide },
    { id: 'competitive', name: 'Competitive Analysis', slide: competitiveSlide },
    { id: 'services', name: 'Banking Services', slide: servicesSlide },
    { id: 'timeline', name: 'Implementation Timeline', slide: timelineSlide },
    { id: 'conclusion', name: 'Conclusion', slide: conclusionSlide }
  ];
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-3">Banking Slide Templates</h1>
      <p className="text-slate-600 mb-6">
        Preview banking-specific slide templates optimized for financial services presentations to C-suite executives.
      </p>
      
      <Tabs defaultValue="title" className="w-full">
        <TabsList className="mb-6 flex flex-wrap">
          {slideTemplates.map(template => (
            <TabsTrigger key={template.id} value={template.id} className="flex-grow">
              {template.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {slideTemplates.map(template => (
          <TabsContent key={template.id} value={template.id} className="mt-4">
            <div className="border rounded-md overflow-hidden shadow-sm">
              <div className="bg-slate-50 py-2 px-4 border-b">
                <h2 className="text-lg font-medium">{template.name} Template</h2>
              </div>
              <div className="p-4">
                <SlideCanvas 
                  slide={template.slide} 
                  onElementUpdate={() => {}}
                  width={960}
                  height={540}
                  editable={false}
                />
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-2">When to Use</h3>
                <div className="bg-white p-4 rounded-md border">
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {template.id === 'title' && (
                      <>
                        <li>Opening slide for your banking services presentations</li>
                        <li>First impression to showcase your bank's brand and focus</li>
                        <li>Setting the tone for a professional financial proposal</li>
                      </>
                    )}
                    {template.id === 'executive' && (
                      <>
                        <li>Providing a concise overview of your banking proposal</li>
                        <li>Highlighting key advantages for busy executives</li>
                        <li>Communicating core value propositions early in the presentation</li>
                      </>
                    )}
                    {template.id === 'financial' && (
                      <>
                        <li>Visualizing financial performance and projections</li>
                        <li>Demonstrating ROI and value of banking services</li>
                        <li>Supporting claims with quantitative data</li>
                      </>
                    )}
                    {template.id === 'competitive' && (
                      <>
                        <li>Contrasting your bank's services against competitors</li>
                        <li>Highlighting competitive advantages in specific areas</li>
                        <li>Presenting clear comparisons of fees, rates, and services</li>
                      </>
                    )}
                    {template.id === 'services' && (
                      <>
                        <li>Detailing specific banking services offered</li>
                        <li>Explaining features and benefits of each service</li>
                        <li>Organizing multiple offerings in a structured format</li>
                      </>
                    )}
                    {template.id === 'timeline' && (
                      <>
                        <li>Outlining implementation process and key milestones</li>
                        <li>Setting expectations for onboarding and transition</li>
                        <li>Demonstrating a structured approach to relationship management</li>
                      </>
                    )}
                    {template.id === 'conclusion' && (
                      <>
                        <li>Summarizing key points and value proposition</li>
                        <li>Providing clear next steps for the client</li>
                        <li>Reinforcing your commitment to the banking relationship</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Best Practices</h3>
                <div className="bg-white p-4 rounded-md border">
                  <ul className="list-disc pl-5 space-y-1 text-slate-700">
                    {template.id === 'title' && (
                      <>
                        <li>Personalize with the client's logo and name</li>
                        <li>Use professional and refined typography</li>
                        <li>Include a clear, benefit-focused subtitle</li>
                      </>
                    )}
                    {template.id === 'executive' && (
                      <>
                        <li>Limit to 4-5 key points for easy digestion</li>
                        <li>Be specific about benefits to this particular client</li>
                        <li>End with a compelling value statement</li>
                      </>
                    )}
                    {template.id === 'financial' && (
                      <>
                        <li>Choose the right chart type for your data story</li>
                        <li>Label axes and data points clearly</li>
                        <li>Include a concise insight statement under the chart</li>
                      </>
                    )}
                    {template.id === 'competitive' && (
                      <>
                        <li>Be factual and avoid negative characterizations</li>
                        <li>Focus on areas where your bank excels</li>
                        <li>Use color to highlight your advantages</li>
                      </>
                    )}
                    {template.id === 'services' && (
                      <>
                        <li>Focus on benefits, not just features</li>
                        <li>Tailor descriptions to the client's specific needs</li>
                        <li>Group related services logically</li>
                      </>
                    )}
                    {template.id === 'timeline' && (
                      <>
                        <li>Be realistic about timeframes</li>
                        <li>Highlight client involvement points</li>
                        <li>Include key deliverables at each stage</li>
                      </>
                    )}
                    {template.id === 'conclusion' && (
                      <>
                        <li>Include specific contact details</li>
                        <li>Outline clear, actionable next steps</li>
                        <li>Reinforce the most compelling benefits</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 