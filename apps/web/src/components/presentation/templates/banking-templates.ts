import { SlideData } from '../types';
import { createPositionedElement } from '../config/defaultPositioning';

/**
 * Banking template categories
 */
export type BankingTemplateCategory = 
  | 'executive'  // Executive summary, overview slides
  | 'financial'  // Financial data, charts, metrics
  | 'service'    // Banking services, offerings
  | 'comparison' // Competitive analysis, comparisons
  | 'timeline'   // Implementation, project timeline
  | 'case-study'; // Customer success stories

/**
 * Banking template data structure
 */
export interface BankingTemplate {
  id: string;
  name: string;
  category: BankingTemplateCategory;
  description: string;
  slides: SlideData[];
  brandingOptions: {
    primaryColor?: string;
    secondaryColor?: string;
    logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
}

/**
 * Create an executive summary template
 * @param clientName The client company name
 * @param bankName The bank name
 * @returns SlideData for executive summary
 */
export function createExecutiveSummaryTemplate(clientName = 'Client', bankName = 'Bank'): SlideData {
  return {
    id: `template-executive-summary-${Date.now()}`,
    type: 'content',
    content: {
      title: 'Executive Summary',
      subtitle: `${bankName} Services for ${clientName}`,
      clientName,
      bankName,
      sections: [
        createPositionedElement(
          'content',
          'heading',
          `heading-${Date.now()}`,
          {
            text: 'Executive Summary',
            level: 2
          }
        ),
        createPositionedElement(
          'content',
          'bullet-list',
          `bullet-list-${Date.now()}`,
          {
            items: [
              'Comprehensive banking solutions tailored for your needs',
              'Dedicated team of financial experts',
              'Cutting-edge technology and security',
              'Proven track record with similar clients',
              'Seamless implementation with minimal disruption'
            ]
          }
        ),
        createPositionedElement(
          'content',
          'text',
          `text-${Date.now()}`,
          {
            text: 'Our proposal is designed to address your specific challenges while providing exceptional value and service.'
          }
        )
      ]
    }
  };
}

/**
 * Create a financial metrics template
 * @param clientName The client company name
 * @returns SlideData for financial metrics
 */
export function createFinancialMetricsTemplate(clientName = 'Client'): SlideData {
  return {
    id: `template-financial-metrics-${Date.now()}`,
    type: 'chart',
    content: {
      title: 'Financial Performance',
      subtitle: `Projected Impact for ${clientName}`,
      clientName,
      sections: [
        createPositionedElement(
          'chart',
          'heading',
          `heading-${Date.now()}`,
          {
            text: 'Financial Performance',
            level: 2
          }
        ),
        createPositionedElement(
          'chart',
          'chart',
          `chart-${Date.now()}`,
          {
            chartType: 'financial-growth',
            data: [
              { year: '2023', actual: 100, projected: 100 },
              { year: '2024', actual: null, projected: 130 },
              { year: '2025', actual: null, projected: 180 },
              { year: '2026', actual: null, projected: 220 },
              { year: '2027', actual: null, projected: 280 }
            ],
            title: 'Projected Growth'
          }
        ),
        createPositionedElement(
          'chart',
          'text',
          `text-${Date.now()}`,
          {
            text: 'The implementation of our services is projected to deliver significant ROI over the next 5 years.'
          }
        )
      ]
    }
  };
}

/**
 * Create a services comparison template
 * @param competitors Array of competitor names
 * @returns SlideData for services comparison
 */
export function createServicesComparisonTemplate(competitors = ['Competitor A', 'Competitor B']): SlideData {
  return {
    id: `template-services-comparison-${Date.now()}`,
    type: 'table',
    content: {
      title: 'Banking Services Comparison',
      subtitle: 'How We Compare to Alternatives',
      sections: [
        createPositionedElement(
          'table',
          'heading',
          `heading-${Date.now()}`,
          {
            text: 'Banking Services Comparison',
            level: 2
          }
        ),
        createPositionedElement(
          'table',
          'table',
          `table-${Date.now()}`,
          {
            headers: ['Service Feature', 'Our Offering', ...competitors],
            rows: [
              ['Transaction Processing', '✓ Real-time', '✓ Next-day', '✓ Next-day'],
              ['Fraud Prevention', '✓ AI-powered', '✓ Rule-based', '✗ Limited'],
              ['International Payments', '✓ 150+ countries', '✓ 75 countries', '✓ 50 countries'],
              ['API Integration', '✓ Full suite', '✗ Limited', '✗ None'],
              ['Dedicated Support', '✓ 24/7 dedicated team', '✓ Business hours', '✗ Call center only']
            ]
          }
        ),
        createPositionedElement(
          'table',
          'text',
          `text-${Date.now()}`,
          {
            text: 'Our comprehensive services provide superior value and capabilities compared to alternatives in the market.'
          }
        )
      ]
    }
  };
}

/**
 * Create an implementation timeline template
 * @param clientName The client company name
 * @returns SlideData for implementation timeline
 */
export function createImplementationTimelineTemplate(clientName = 'Client'): SlideData {
  return {
    id: `template-implementation-timeline-${Date.now()}`,
    type: 'content',
    content: {
      title: 'Implementation Timeline',
      subtitle: `Roadmap for ${clientName}`,
      clientName,
      sections: [
        createPositionedElement(
          'content',
          'heading',
          `heading-${Date.now()}`,
          {
            text: 'Implementation Timeline',
            level: 2
          }
        ),
        createPositionedElement(
          'content',
          'table',
          `table-${Date.now()}`,
          {
            headers: ['Phase', 'Activities', 'Timeline', 'Key Milestones'],
            rows: [
              ['Discovery', 'Requirements gathering, solution design', 'Weeks 1-2', 'Solution blueprint'],
              ['Configuration', 'System setup, customization', 'Weeks 3-5', 'Test environment'],
              ['Testing', 'User acceptance, integration testing', 'Weeks 6-8', 'Test completion sign-off'],
              ['Training', 'User and admin training sessions', 'Weeks 7-9', 'Training completion'],
              ['Go-Live', 'Production deployment, handover', 'Week 10', 'System launch']
            ]
          }
        ),
        createPositionedElement(
          'content',
          'text',
          `text-${Date.now()}`,
          {
            text: 'Our proven implementation methodology ensures a smooth transition with minimal business disruption.'
          }
        )
      ]
    }
  };
}

/**
 * Banking template collection
 */
export const bankingTemplates: BankingTemplate[] = [
  {
    id: 'executive-summary',
    name: 'Executive Summary',
    category: 'executive',
    description: 'Overview of your banking proposal highlighting key benefits',
    slides: [createExecutiveSummaryTemplate()],
    brandingOptions: {
      primaryColor: '#2463EB',
      secondaryColor: '#F8FAFC',
      logoPosition: 'top-right'
    }
  },
  {
    id: 'financial-metrics',
    name: 'Financial Performance',
    category: 'financial',
    description: 'Financial metrics and projections with visualizations',
    slides: [createFinancialMetricsTemplate()],
    brandingOptions: {
      primaryColor: '#2463EB',
      secondaryColor: '#F8FAFC',
      logoPosition: 'top-right'
    }
  },
  {
    id: 'services-comparison',
    name: 'Services Comparison',
    category: 'comparison',
    description: 'Comparison of your banking services with competitors',
    slides: [createServicesComparisonTemplate()],
    brandingOptions: {
      primaryColor: '#2463EB',
      secondaryColor: '#F8FAFC',
      logoPosition: 'top-right'
    }
  },
  {
    id: 'implementation-timeline',
    name: 'Implementation Timeline',
    category: 'timeline',
    description: 'Project timeline for implementing banking services',
    slides: [createImplementationTimelineTemplate()],
    brandingOptions: {
      primaryColor: '#2463EB',
      secondaryColor: '#F8FAFC',
      logoPosition: 'top-right'
    }
  }
];

/**
 * Get a template by ID
 * @param templateId The template ID to retrieve
 * @returns The template or undefined if not found
 */
export function getTemplateById(templateId: string): BankingTemplate | undefined {
  return bankingTemplates.find(template => template.id === templateId);
}

/**
 * Get templates by category
 * @param category The category to filter by
 * @returns Array of templates in the specified category
 */
export function getTemplatesByCategory(category: BankingTemplateCategory): BankingTemplate[] {
  return bankingTemplates.filter(template => template.category === category);
} 