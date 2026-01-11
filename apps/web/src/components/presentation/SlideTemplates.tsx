import React from 'react';
import { SlideData, ContentSection, SlideType } from './types';

// Interface for template options
export interface TemplateOptions {
  title?: string;
  subtitle?: string;
  clientName?: string;
  clientLogoUrl?: string;
  bankName?: string;
  bankLogoUrl?: string;
  date?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

// Base function to create a slide with common properties
const createBaseSlide = (
  slideId: string,
  slideType: SlideType,
  title: string,
  sections: ContentSection[] = []
): SlideData => {
  return {
    id: slideId,
    type: slideType,
    content: {
      title,
      sections
    }
  };
};

// Template for title slide (cover page)
export const createTitleSlide = (
  slideId: string,
  options: TemplateOptions
): SlideData => {
  const {
    title = 'Banking Services Proposal',
    subtitle = 'Tailored Financial Solutions',
    clientName,
    clientLogoUrl,
    bankName = 'Your Financial Institution',
    bankLogoUrl,
    date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
  } = options;

  const sections: ContentSection[] = [
    {
      id: `title-${Date.now()}`,
      type: 'heading',
      content: {
        text: title,
        level: 1
      },
      position: { x: 480, y: 180 },
      size: { width: 600, height: 80 },
      style: {
        fontSize: 42,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1a365d'
      }
    },
    {
      id: `subtitle-${Date.now()}`,
      type: 'text',
      content: {
        text: subtitle
      },
      position: { x: 480, y: 280 },
      size: { width: 600, height: 40 },
      style: {
        fontSize: 24,
        textAlign: 'center',
        color: '#4a5568'
      }
    },
    {
      id: `client-${Date.now()}`,
      type: 'text',
      content: {
        text: clientName ? `Prepared for ${clientName}` : 'Prepared for Your Client'
      },
      position: { x: 480, y: 340 },
      size: { width: 600, height: 30 },
      style: {
        fontSize: 18,
        textAlign: 'center',
        color: '#4a5568'
      }
    },
    {
      id: `date-${Date.now()}`,
      type: 'text',
      content: {
        text: date
      },
      position: { x: 480, y: 380 },
      size: { width: 600, height: 30 },
      style: {
        fontSize: 16,
        textAlign: 'center',
        color: '#718096'
      }
    }
  ];

  // Add client logo if provided
  if (clientLogoUrl) {
    sections.push({
      id: `client-logo-${Date.now()}`,
      type: 'image',
      content: {
        src: clientLogoUrl,
        alt: `${clientName} logo`
      },
      position: { x: 800, y: 120 },
      size: { width: 150, height: 80 }
    });
  }

  // Add bank logo if provided
  if (bankLogoUrl) {
    sections.push({
      id: `bank-logo-${Date.now()}`,
      type: 'image',
      content: {
        src: bankLogoUrl,
        alt: `${bankName} logo`
      },
      position: { x: 160, y: 120 },
      size: { width: 150, height: 80 }
    });
  }

  // Add bank name as a footer
  sections.push({
    id: `bank-name-${Date.now()}`,
    type: 'text',
    content: {
      text: bankName
    },
    position: { x: 480, y: 500 },
    size: { width: 600, height: 20 },
    style: {
      fontSize: 14,
      textAlign: 'center',
      color: '#718096',
      fontWeight: 'bold'
    }
  });

  return createBaseSlide(slideId, 'title', title, sections);
};

// Template for executive summary slide
export const createExecutiveSummarySlide = (
  slideId: string,
  options: TemplateOptions
): SlideData => {
  const { title = 'Executive Summary' } = options;

  const sections: ContentSection[] = [
    {
      id: `title-${Date.now()}`,
      type: 'heading',
      content: {
        text: title,
        level: 2
      },
      position: { x: 480, y: 60 },
      size: { width: 600, height: 50 },
      style: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1a365b'
      }
    },
    {
      id: `summary-${Date.now()}`,
      type: 'bullet-list',
      content: {
        items: [
          'Comprehensive banking solutions for your business needs',
          'Tailored financial products to optimize your operations',
          'Dedicated team of financial experts',
          'Competitive rates and flexible terms',
          'Cutting-edge digital banking platform'
        ]
      },
      position: { x: 480, y: 150 },
      size: { width: 800, height: 200 },
      style: {
        fontSize: 20,
        lineHeight: 1.5
      }
    },
    {
      id: `value-proposition-${Date.now()}`,
      type: 'text',
      content: {
        text: 'Our tailored solutions address your specific challenges while providing exceptional value and service.'
      },
      position: { x: 480, y: 380 },
      size: { width: 800, height: 60 },
      style: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        fontStyle: 'italic',
        color: '#2c5282'
      }
    }
  ];

  return createBaseSlide(slideId, 'content', title, sections);
};

// Template for financial data slide with chart
export const createFinancialDataSlide = (
  slideId: string,
  options: TemplateOptions
): SlideData => {
  const { title = 'Financial Performance Analysis' } = options;

  const sections: ContentSection[] = [
    {
      id: `title-${Date.now()}`,
      type: 'heading',
      content: {
        text: title,
        level: 2
      },
      position: { x: 480, y: 60 },
      size: { width: 600, height: 50 },
      style: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1a365b'
      }
    },
    {
      id: `chart-${Date.now()}`,
      type: 'chart',
      content: {
        chartType: 'bar',
        data: {
          labels: ['Q1', 'Q2', 'Q3', 'Q4'],
          values: [120, 180, 150, 210]
        },
        title: 'Quarterly Financial Performance'
      },
      position: { x: 480, y: 220 },
      size: { width: 600, height: 300 }
    },
    {
      id: `insight-${Date.now()}`,
      type: 'text',
      content: {
        text: 'The financial performance shows a positive trend with a 75% increase in Q4 compared to Q1.'
      },
      position: { x: 480, y: 480 },
      size: { width: 600, height: 40 },
      style: {
        fontSize: 16,
        fontStyle: 'italic',
        textAlign: 'center'
      }
    }
  ];

  return createBaseSlide(slideId, 'chart', title, sections);
};

// Template for competitive analysis slide with table
export const createCompetitiveAnalysisSlide = (
  slideId: string,
  options: TemplateOptions
): SlideData => {
  const { title = 'Competitive Analysis', bankName = 'Our Bank' } = options;

  // For a table, we'll create a text-based representation
  // In a real implementation, you'd want a proper table component
  const sections: ContentSection[] = [
    {
      id: `title-${Date.now()}`,
      type: 'heading',
      content: {
        text: title,
        level: 2
      },
      position: { x: 480, y: 60 },
      size: { width: 600, height: 50 },
      style: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1a365b'
      }
    },
    {
      id: `table-${Date.now()}`,
      type: 'table',
      content: {
        headers: ['Feature', bankName, 'Competitor A', 'Competitor B'],
        rows: [
          ['Interest Rates', '3.5%', '4.0%', '4.2%'],
          ['Service Fees', '$0', '$15/month', '$10/month'],
          ['Online Banking', 'Advanced', 'Basic', 'Standard'],
          ['Customer Support', '24/7', 'Business hours', 'Extended hours'],
          ['International Services', 'Comprehensive', 'Limited', 'Standard']
        ]
      },
      position: { x: 480, y: 250 },
      size: { width: 800, height: 300 }
    },
    {
      id: `advantage-${Date.now()}`,
      type: 'text',
      content: {
        text: `${bankName} offers the most competitive rates and comprehensive services in the market.`
      },
      position: { x: 480, y: 480 },
      size: { width: 800, height: 40 },
      style: {
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2c5282'
      }
    }
  ];

  return createBaseSlide(slideId, 'table', title, sections);
};

// Template for implementation timeline slide
export const createTimelineSlide = (
  slideId: string,
  options: TemplateOptions
): SlideData => {
  const { title = 'Implementation Timeline' } = options;

  const sections: ContentSection[] = [
    {
      id: `title-${Date.now()}`,
      type: 'heading',
      content: {
        text: title,
        level: 2
      },
      position: { x: 480, y: 60 },
      size: { width: 600, height: 50 },
      style: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1a365b'
      }
    },
    {
      id: `timeline-${Date.now()}`,
      type: 'bullet-list',
      content: {
        items: [
          'Week 1-2: Initial onboarding and account setup',
          'Week 3-4: System integration and staff training',
          'Week 5-6: Parallel testing and validation',
          'Week 7-8: Full implementation and transition',
          'Week 9+: Ongoing support and optimization'
        ]
      },
      position: { x: 480, y: 200 },
      size: { width: 800, height: 200 },
      style: {
        fontSize: 18,
        lineHeight: 1.8
      }
    },
    {
      id: `commitment-${Date.now()}`,
      type: 'text',
      content: {
        text: 'Our dedicated implementation team will ensure a smooth transition with minimal disruption to your operations.'
      },
      position: { x: 480, y: 420 },
      size: { width: 800, height: 60 },
      style: {
        fontSize: 16,
        fontStyle: 'italic',
        textAlign: 'center'
      }
    }
  ];

  return createBaseSlide(slideId, 'content', title, sections);
};

// Template for conclusion slide
export const createConclusionSlide = (
  slideId: string,
  options: TemplateOptions
): SlideData => {
  const { 
    title = 'Next Steps',
    bankName = 'Your Financial Partner',
    bankLogoUrl
  } = options;

  const sections: ContentSection[] = [
    {
      id: `title-${Date.now()}`,
      type: 'heading',
      content: {
        text: title,
        level: 2
      },
      position: { x: 480, y: 60 },
      size: { width: 600, height: 50 },
      style: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1a365b'
      }
    },
    {
      id: `steps-${Date.now()}`,
      type: 'bullet-list',
      content: {
        items: [
          'Schedule follow-up meeting to discuss proposal in detail',
          'Identify key stakeholders for implementation planning',
          'Finalize service agreements and documentation',
          'Develop detailed transition plan and timeline'
        ]
      },
      position: { x: 480, y: 180 },
      size: { width: 800, height: 160 },
      style: {
        fontSize: 20,
        lineHeight: 1.5
      }
    },
    {
      id: `contact-${Date.now()}`,
      type: 'text',
      content: {
        text: 'Contact: John Smith, Relationship Manager\nEmail: john.smith@bankname.com\nPhone: (555) 123-4567'
      },
      position: { x: 480, y: 360 },
      size: { width: 600, height: 100 },
      style: {
        fontSize: 18,
        textAlign: 'center',
        color: '#2d3748'
      }
    },
    {
      id: `thank-you-${Date.now()}`,
      type: 'heading',
      content: {
        text: 'Thank You',
        level: 2
      },
      position: { x: 480, y: 460 },
      size: { width: 600, height: 50 },
      style: {
        fontSize: 36,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#2c5282'
      }
    }
  ];

  // Add bank logo if provided
  if (bankLogoUrl) {
    sections.push({
      id: `bank-logo-${Date.now()}`,
      type: 'image',
      content: {
        src: bankLogoUrl,
        alt: `${bankName} logo`
      },
      position: { x: 480, y: 120 },
      size: { width: 150, height: 80 }
    });
  }

  return createBaseSlide(slideId, 'closing', title, sections);
};

// Template for services offering slide
export const createServicesSlide = (
  slideId: string,
  options: TemplateOptions
): SlideData => {
  const { title = 'Our Banking Services' } = options;

  const sections: ContentSection[] = [
    {
      id: `title-${Date.now()}`,
      type: 'heading',
      content: {
        text: title,
        level: 2
      },
      position: { x: 480, y: 60 },
      size: { width: 600, height: 50 },
      style: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#1a365b'
      }
    },
    {
      id: `services-left-${Date.now()}`,
      type: 'bullet-list',
      content: {
        items: [
          'Commercial Lending',
          'Cash Management Solutions',
          'International Banking Services'
        ]
      },
      position: { x: 240, y: 180 },
      size: { width: 350, height: 150 },
      style: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    {
      id: `services-right-${Date.now()}`,
      type: 'bullet-list',
      content: {
        items: [
          'Treasury Management',
          'Merchant Services',
          'Digital Banking Platform'
        ]
      },
      position: { x: 720, y: 180 },
      size: { width: 350, height: 150 },
      style: {
        fontSize: 18,
        fontWeight: 'bold'
      }
    },
    {
      id: `left-details-${Date.now()}`,
      type: 'text',
      content: {
        text: 'Customized lending solutions to support your growth\nStreamlined cash flow management\nSeamless international transactions and trade financing'
      },
      position: { x: 240, y: 300 },
      size: { width: 350, height: 150 },
      style: {
        fontSize: 14,
        lineHeight: 1.5
      }
    },
    {
      id: `right-details-${Date.now()}`,
      type: 'text',
      content: {
        text: 'Optimize working capital and liquidity\nSecure payment processing solutions\nAdvanced digital tools for efficient banking'
      },
      position: { x: 720, y: 300 },
      size: { width: 350, height: 150 },
      style: {
        fontSize: 14,
        lineHeight: 1.5
      }
    }
  ];

  return createBaseSlide(slideId, 'content', title, sections);
};

// Template selector component
export interface TemplateListProps {
  onSelectTemplate: (template: SlideData) => void;
  clientName?: string;
  bankName?: string;
}

export const SlideTemplates: React.FC<TemplateListProps> = ({
  onSelectTemplate,
  clientName = 'Your Client',
  bankName = 'Your Bank'
}) => {
  const templateOptions: TemplateOptions = {
    clientName,
    bankName,
    date: new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  };

  const templates = [
    {
      id: 'title-slide',
      name: 'Title Slide',
      description: 'Opening slide with presentation title',
      template: createTitleSlide(`title-${Date.now()}`, templateOptions)
    },
    {
      id: 'executive-summary',
      name: 'Executive Summary',
      description: 'Overview of key points and value proposition',
      template: createExecutiveSummarySlide(`exec-summary-${Date.now()}`, templateOptions)
    },
    {
      id: 'financial-data',
      name: 'Financial Data',
      description: 'Chart-based slide for financial analysis',
      template: createFinancialDataSlide(`financial-${Date.now()}`, templateOptions)
    },
    {
      id: 'competitive-analysis',
      name: 'Competitive Analysis',
      description: 'Compare your offerings with competitors',
      template: createCompetitiveAnalysisSlide(`competitive-${Date.now()}`, templateOptions)
    },
    {
      id: 'timeline',
      name: 'Implementation Timeline',
      description: 'Timeline for implementation phases',
      template: createTimelineSlide(`timeline-${Date.now()}`, templateOptions)
    },
    {
      id: 'services',
      name: 'Banking Services',
      description: 'Overview of services offered',
      template: createServicesSlide(`services-${Date.now()}`, templateOptions)
    },
    {
      id: 'conclusion',
      name: 'Conclusion',
      description: 'Closing slide with next steps',
      template: createConclusionSlide(`conclusion-${Date.now()}`, templateOptions)
    }
  ];

  return (
    <div className="slide-templates grid grid-cols-2 md:grid-cols-3 gap-4">
      {templates.map((template) => (
        <div
          key={template.id}
          className="template-card border rounded-md p-4 cursor-pointer hover:border-indigo-500 hover:shadow-md transition-all"
          onClick={() => onSelectTemplate(template.template)}
        >
          <h3 className="font-medium text-sm mb-1">{template.name}</h3>
          <p className="text-xs text-slate-500 mb-2">{template.description}</p>
          <div className="bg-slate-100 h-24 rounded flex items-center justify-center text-xs text-slate-400">
            Template Preview
          </div>
        </div>
      ))}
    </div>
  );
}; 