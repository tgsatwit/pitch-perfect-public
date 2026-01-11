import { SlideOutlineData, ContentSectionType, ContentSection } from '../types';
import { OutlineContentInput, GeneratedSlideContent } from './SlideContentGenerationService';

/**
 * Options for content generation
 */
export interface ContentGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  includeSourceAttribution?: boolean;
  includeDataSupport?: boolean;
  formatAsHtml?: boolean;
}

/**
 * Class responsible for generating content for specific slide sections using AI
 */
class SlideContentAIGenerator {
  /**
   * Generate content for a heading section
   */
  async generateHeadingContent(
    slideOutline: SlideOutlineData,
    options: ContentGenerationOptions = {}
  ): Promise<any> {
    try {
      // In the future, this would call a LangGraph API
      // For now, return content based on the outline
      const title = slideOutline.title;
      
      // Generate a better title using some simple rules
      let improvedTitle = title;
      
      // Add impact words for titles
      if (title.toLowerCase().includes('introduction') || title.toLowerCase().includes('overview')) {
        improvedTitle = `${slideOutline.companyName || 'Our'} Vision: ${title}`;
      } else if (title.toLowerCase().includes('problem') || title.toLowerCase().includes('challenge')) {
        improvedTitle = `The Critical Challenge: ${title}`;
      } else if (title.toLowerCase().includes('solution') || title.toLowerCase().includes('approach')) {
        improvedTitle = `Our Innovative Solution: ${title.replace(/our solution|solution|our approach|approach/i, '')}`;
      } else if (title.toLowerCase().includes('market') || title.toLowerCase().includes('opportunity')) {
        improvedTitle = `Market Opportunity: ${title.replace(/market|opportunity|market opportunity/i, '')}`;
      }
      
      return {
        text: improvedTitle,
        level: title === slideOutline.title ? 2 : 3, // Main slide title is level 2, subsections level 3
      };
    } catch (error) {
      console.error('Error generating heading content:', error);
      return {
        text: slideOutline.title,
        level: 2,
      };
    }
  }

  /**
   * Generate content for a text section
   */
  async generateTextContent(
    slideOutline: SlideOutlineData,
    options: ContentGenerationOptions = {}
  ): Promise<any> {
    try {
      // Generate text content based on outline data
      let textContent = '';
      
      if (slideOutline.purpose) {
        textContent = slideOutline.purpose;
      } else if (slideOutline.keyTakeaway) {
        textContent = slideOutline.keyTakeaway;
      } else if (slideOutline.strategicFraming) {
        textContent = slideOutline.strategicFraming;
      } else if (slideOutline.keyContent && slideOutline.keyContent.length > 0) {
        textContent = slideOutline.keyContent[0];
      } else {
        textContent = `The ${slideOutline.title} is a critical component of our strategy.`;
      }
      
      // Expand the text with more context and details
      if (slideOutline.keyContent && slideOutline.keyContent.length > 0) {
        // Use the first key content point to add more detail
        if (textContent.length < 100) {
          textContent += ' ' + slideOutline.keyContent[0];
        }
      }
      
      return {
        text: textContent,
      };
    } catch (error) {
      console.error('Error generating text content:', error);
      return {
        text: slideOutline.purpose || 'Generated text content',
      };
    }
  }

  /**
   * Generate content for a bullet list section
   */
  async generateBulletListContent(
    slideOutline: SlideOutlineData,
    options: ContentGenerationOptions = {}
  ): Promise<any> {
    try {
      let bulletItems: string[] = [];
      
      if (slideOutline.keyContent && slideOutline.keyContent.length > 0) {
        bulletItems = [...slideOutline.keyContent];
      } else if (slideOutline.supportingEvidence && slideOutline.supportingEvidence.length > 0) {
        bulletItems = [...slideOutline.supportingEvidence];
      } else {
        // Generate some generic bullets based on the title
        const title = slideOutline.title.toLowerCase();
        
        if (title.includes('problem') || title.includes('challenge')) {
          bulletItems = [
            'Current approaches are insufficient',
            'The market needs a better solution',
            'Customers face significant pain points'
          ];
        } else if (title.includes('solution') || title.includes('approach')) {
          bulletItems = [
            'Our solution addresses key market needs',
            'Innovative technology provides unique advantages',
            'Proprietary approach delivers superior results'
          ];
        } else if (title.includes('market') || title.includes('opportunity')) {
          bulletItems = [
            'Large addressable market with significant growth',
            'Clear path to market penetration',
            'Established customer need with limited solutions'
          ];
        } else if (title.includes('competition') || title.includes('competitor')) {
          bulletItems = [
            'Current competitors lack key capabilities',
            'Fragmented market with no dominant player',
            'Our differentiators address critical gaps'
          ];
        } else {
          bulletItems = [
            'Key point 1 related to ' + slideOutline.title,
            'Key point 2 with supporting evidence',
            'Key point 3 demonstrating our unique approach'
          ];
        }
      }
      
      // Ensure each bullet is properly formatted with action verbs
      bulletItems = bulletItems.map(item => {
        // Remove any existing bullet markers
        let cleanItem = item.replace(/^[-•*+]\s+/, '').trim();
        
        // Add action verbs to the beginning if they don't exist
        const actionVerbs = ['Delivers', 'Provides', 'Enables', 'Creates', 'Supports', 'Enhances', 'Accelerates'];
        const hasActionVerb = /^[A-Z][a-z]+s\b/.test(cleanItem);
        
        if (!hasActionVerb && !cleanItem.includes(':') && cleanItem.length < 40) {
          const randomVerb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
          return `${randomVerb} ${cleanItem.toLowerCase().charAt(0) + cleanItem.slice(1)}`;
        }
        
        return cleanItem;
      });
      
      return {
        items: bulletItems,
      };
    } catch (error) {
      console.error('Error generating bullet list content:', error);
      return {
        items: slideOutline.keyContent || ['Generated bullet point'],
      };
    }
  }

  /**
   * Generate content for a chart section
   */
  async generateChartContent(
    slideOutline: SlideOutlineData,
    options: ContentGenerationOptions = {}
  ): Promise<any> {
    try {
      // Determine best chart type based on content
      const chartType = this.determineChartType(slideOutline);
      
      // Generate labels and values based on the outline data
      const data = this.generateChartData(slideOutline, chartType);
      
      return {
        chartType,
        data,
      };
    } catch (error) {
      console.error('Error generating chart content:', error);
      return {
        chartType: 'bar',
        data: {
          labels: ['Category A', 'Category B', 'Category C'],
          values: [30, 50, 20],
        },
      };
    }
  }

  /**
   * Generate content for a table section
   */
  async generateTableContent(
    slideOutline: SlideOutlineData,
    options: ContentGenerationOptions = {}
  ): Promise<any> {
    try {
      // Generate table headers and data based on the outline
      const headers = this.generateTableHeaders(slideOutline);
      const data = this.generateTableRows(slideOutline, headers);
      
      return {
        headers,
        data,
      };
    } catch (error) {
      console.error('Error generating table content:', error);
      return {
        headers: ['Feature', 'Description', 'Benefit'],
        data: [
          { cells: ['Feature 1', 'Description 1', 'Benefit 1'] },
          { cells: ['Feature 2', 'Description 2', 'Benefit 2'] },
        ],
      };
    }
  }

  /**
   * Generate content for an image section
   */
  async generateImageContent(
    slideOutline: SlideOutlineData,
    options: ContentGenerationOptions = {}
  ): Promise<any> {
    try {
      // In the future, this might use an image generation API
      // For now, return placeholder content with a caption based on the outline
      let caption = '';
      
      if (slideOutline.visualRecommendation) {
        caption = slideOutline.visualRecommendation;
      } else if (slideOutline.keyTakeaway) {
        caption = slideOutline.keyTakeaway;
      } else {
        caption = `Visual representation of ${slideOutline.title}`;
      }
      
      return {
        src: '', // No actual image source for now
        alt: slideOutline.title,
        caption,
      };
    } catch (error) {
      console.error('Error generating image content:', error);
      return {
        src: '',
        alt: 'Generated image',
        caption: slideOutline.visualRecommendation || 'Image caption',
      };
    }
  }

  /**
   * Generate content for a specific section type
   */
  async generateSectionContent(
    sectionType: ContentSectionType,
    slideOutline: SlideOutlineData,
    options: ContentGenerationOptions = {}
  ): Promise<any> {
    switch (sectionType) {
      case 'heading':
        return this.generateHeadingContent(slideOutline, options);
      case 'text':
        return this.generateTextContent(slideOutline, options);
      case 'bullet-list':
        return this.generateBulletListContent(slideOutline, options);
      case 'chart':
        return this.generateChartContent(slideOutline, options);
      case 'table':
        return this.generateTableContent(slideOutline, options);
      case 'image':
        return this.generateImageContent(slideOutline, options);
      default:
        throw new Error(`Unsupported section type: ${sectionType}`);
    }
  }

  /**
   * Determine the best chart type based on slide outline
   */
  private determineChartType(slideOutline: SlideOutlineData): 'bar' | 'pie' | 'line' {
    const visualRec = (slideOutline.visualRecommendation || '').toLowerCase();
    const title = (slideOutline.title || '').toLowerCase();
    const content = slideOutline.keyContent || [];
    const contentText = content.join(' ').toLowerCase();
    
    // Look for time-series indicators for line chart
    if (
      visualRec.includes('trend') || 
      visualRec.includes('over time') || 
      visualRec.includes('line') ||
      title.includes('trend') || 
      title.includes('growth') || 
      title.includes('over time') ||
      contentText.includes('trend') ||
      contentText.includes('growth') ||
      contentText.includes('over time')
    ) {
      return 'line';
    }
    
    // Look for distribution/proportion indicators for pie chart
    if (
      visualRec.includes('distribution') || 
      visualRec.includes('proportion') || 
      visualRec.includes('share') || 
      visualRec.includes('pie') ||
      title.includes('distribution') || 
      title.includes('breakdown') || 
      title.includes('share') ||
      contentText.includes('distribution') ||
      contentText.includes('proportion') ||
      contentText.includes('segment') ||
      contentText.includes('share')
    ) {
      return 'pie';
    }
    
    // Default to bar chart for comparison
    return 'bar';
  }

  /**
   * Generate chart data based on slide outline
   */
  private generateChartData(
    slideOutline: SlideOutlineData,
    chartType: string
  ): { labels: string[]; values: number[] } {
    const keyContent = slideOutline.keyContent || [];
    const supportingEvidence = slideOutline.supportingEvidence || [];
    
    // Try to extract numerical values from supporting evidence
    const numericalValues: number[] = [];
    const labels: string[] = [];
    
    // First try to find data pairs in supporting evidence
    supportingEvidence.forEach(evidence => {
      const match = evidence.match(/([^:]+):\s*(\d+[.,]?\d*)/);
      if (match) {
        const label = match[1].trim();
        const value = parseFloat(match[2].replace(',', '.'));
        labels.push(label);
        numericalValues.push(value);
      }
    });
    
    // If we found data pairs, use them
    if (labels.length > 0 && numericalValues.length > 0) {
      return { labels, values: numericalValues };
    }
    
    // Otherwise, use key content as labels and generate random values
    if (keyContent.length > 0) {
      const extractedLabels = keyContent.map(item => {
        // Extract the first few words as a label
        const words = item.split(' ');
        return words.slice(0, Math.min(3, words.length)).join(' ');
      });
      
      if (chartType === 'line') {
        // For line charts, generate a trend
        const baseValue = Math.floor(Math.random() * 30) + 20;
        const trend = Math.random() > 0.5 ? 1 : -1; // Upward or downward trend
        const values = extractedLabels.map((_, i) => {
          return Math.max(0, baseValue + (trend * i * Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10) - 5));
        });
        return { labels: extractedLabels, values };
      } else if (chartType === 'pie') {
        // For pie charts, ensure values sum to 100%
        const values = [];
        let remaining = 100;
        
        for (let i = 0; i < extractedLabels.length - 1; i++) {
          const value = Math.floor(Math.random() * (remaining / 2)) + 5;
          values.push(value);
          remaining -= value;
        }
        values.push(remaining); // Last segment gets what's left
        
        return { labels: extractedLabels, values };
      } else {
        // Bar chart - random values
        const values = extractedLabels.map(() => Math.floor(Math.random() * 70) + 30);
        return { labels: extractedLabels, values };
      }
    }
    
    // Default fallback
    return {
      labels: ['Category A', 'Category B', 'Category C', 'Category D'].slice(0, keyContent.length || 4),
      values: [45, 65, 32, 58].slice(0, keyContent.length || 4)
    };
  }

  /**
   * Generate table headers based on slide outline
   */
  private generateTableHeaders(slideOutline: SlideOutlineData): string[] {
    const title = (slideOutline.title || '').toLowerCase();
    const keyContent = slideOutline.keyContent || [];
    
    // Determine headers based on title keywords
    if (title.includes('comparison') || title.includes('vs') || title.includes('versus')) {
      return ['Feature', 'Our Solution', 'Competitor'];
    }
    
    if (title.includes('timeline') || title.includes('schedule') || title.includes('roadmap')) {
      return ['Phase', 'Time Frame', 'Deliverables'];
    }
    
    if (title.includes('features') || title.includes('capabilities')) {
      return ['Feature', 'Description', 'Benefit'];
    }
    
    if (title.includes('pricing') || title.includes('cost')) {
      return ['Plan', 'Features', 'Price'];
    }
    
    // Try to extract headers from first key content item if it has a pattern
    if (keyContent.length > 0) {
      const firstItem = keyContent[0];
      
      // Look for patterns like "Feature: Description: Benefit"
      const colonSeparated = firstItem.split(/:\s*/);
      if (colonSeparated.length >= 2) {
        return colonSeparated.map(part => part.trim());
      }
      
      // Look for patterns like "Feature - Description - Benefit"
      const dashSeparated = firstItem.split(/\s*-\s*/);
      if (dashSeparated.length >= 2) {
        return dashSeparated.map(part => part.trim());
      }
      
      // Look for patterns like "Feature | Description | Benefit"
      const pipeSeparated = firstItem.split(/\s*\|\s*/);
      if (pipeSeparated.length >= 2) {
        return pipeSeparated.map(part => part.trim());
      }
    }
    
    // Default headers based on likely content
    if (slideOutline.slideType === 'table') {
      const slideTopic = slideOutline.title.toLowerCase();
      
      if (slideTopic.includes('market')) {
        return ['Market Segment', 'Size', 'Growth Rate'];
      } else if (slideTopic.includes('competitor')) {
        return ['Competitor', 'Strengths', 'Weaknesses'];
      } else if (slideTopic.includes('financial')) {
        return ['Metric', 'Current', 'Projected'];
      }
    }
    
    return ['Category', 'Description', 'Value'];
  }

  /**
   * Generate table rows based on slide outline
   */
  private generateTableRows(slideOutline: SlideOutlineData, headers: string[]): any[] {
    const keyContent = slideOutline.keyContent || [];
    const supportingEvidence = slideOutline.supportingEvidence || [];
    
    // If we have key content AND it's a table-like format with delimiters
    if (keyContent.length > 1) {
      const firstItem = keyContent[1]; // Use the second item to check for delimiters
      let delimiter = null;
      
      if (firstItem.includes(':')) delimiter = /:\s*/;
      else if (firstItem.includes(' - ')) delimiter = /\s*-\s*/;
      else if (firstItem.includes('|')) delimiter = /\s*\|\s*/;
      
      if (delimiter) {
        return keyContent.slice(1).map(item => {
          const parts = item.split(delimiter);
          
          if (parts.length >= headers.length) {
            return { 
              cells: parts.slice(0, headers.length).map(part => part.trim()) 
            };
          }
          
          // Fill in missing cells
          const cells = [...parts.map(part => part.trim())];
          while (cells.length < headers.length) {
            cells.push('');
          }
          
          return { cells };
        });
      }
    }
    
    // If we have supporting evidence, try to make a table from it
    if (supportingEvidence.length > 0 && headers.length > 1) {
      return supportingEvidence.map(item => {
        // Try to parse into cells based on common patterns
        let cells = [];
        
        // Try colon separated
        if (item.includes(':')) {
          const parts = item.split(/:\s*/);
          cells = parts.map(part => part.trim());
        } 
        // Try dash separated
        else if (item.includes(' - ')) {
          const parts = item.split(/\s*-\s*/);
          cells = parts.map(part => part.trim());
        }
        // Otherwise use the whole item as the first cell
        else {
          cells = [item.trim()];
        }
        
        // Fill in missing cells
        while (cells.length < headers.length) {
          cells.push('');
        }
        
        // Truncate if too many
        if (cells.length > headers.length) {
          cells = cells.slice(0, headers.length);
        }
        
        return { cells };
      });
    }
    
    // Generate generic data if we don't have any content to work with
    const rows = [];
    const title = slideOutline.title.toLowerCase();
    
    // Create fake data based on context
    if (title.includes('comparison') || title.includes('competitor')) {
      rows.push({ 
        cells: ['Ease of Use', 'Intuitive interface with guided workflow', 'Complex setup with limited guidance'] 
      });
      rows.push({ 
        cells: ['Performance', 'Optimized for speed with 2x faster processing', 'Standard performance metrics'] 
      });
      rows.push({ 
        cells: ['Scalability', 'Enterprise-ready with unlimited capacity', 'Limited to 1000 concurrent users'] 
      });
    } else if (title.includes('timeline') || title.includes('roadmap')) {
      rows.push({ 
        cells: ['Phase 1: MVP', 'Q1 2023', 'Core functionality and basic features'] 
      });
      rows.push({ 
        cells: ['Phase 2: Market Expansion', 'Q2-Q3 2023', 'Advanced features and integration capabilities'] 
      });
      rows.push({ 
        cells: ['Phase 3: Enterprise Version', 'Q4 2023', 'Enterprise security and custom deployment options'] 
      });
    } else if (title.includes('pricing') || title.includes('cost')) {
      rows.push({ 
        cells: ['Starter', 'Basic features for individuals', '$9.99/month'] 
      });
      rows.push({ 
        cells: ['Professional', 'Advanced features for teams', '$29.99/month'] 
      });
      rows.push({ 
        cells: ['Enterprise', 'Custom solutions for large organizations', 'Contact sales'] 
      });
    } else {
      for (let i = 0; i < 3; i++) {
        const cells = headers.map((header, j) => {
          if (j === 0) return `Item ${i+1}`;
          if (j === headers.length - 1 && /value|rate|price/i.test(header)) {
            return `$${Math.floor(Math.random() * 100)}`;
          }
          return `Data ${i+1}.${j+1}`;
        });
        rows.push({ cells });
      }
    }
    
    return rows;
  }

  /**
   * Transform outline data into rich slide content
   * This converts the instructional outline into presentation-ready content
   */
  async transformOutlineToContent(
    outlineInput: OutlineContentInput
  ): Promise<GeneratedSlideContent> {
    try {
      // Create a slide outline from the input data
      const slideOutline: SlideOutlineData = {
        id: `slide-${outlineInput.slideNumber}`,
        number: outlineInput.slideNumber,
        title: outlineInput.slideTitle,
        purpose: outlineInput.purpose || '',
        keyContent: outlineInput.keyContent || [],
        supportingEvidence: [],
        keyTakeaway: outlineInput.keyTakeaway || '',
        strategicFraming: outlineInput.strategicFraming || '',
        visualRecommendation: outlineInput.visualRecommendation || '',
        slideType: outlineInput.slideType as any,
        companyName: 'Company' // Default
      };
      
      // Get an improved title
      const headingContent = await this.generateHeadingContent(slideOutline);
      
      // Generate content blocks based on slide type
      const contentBlocks: {type: 'text' | 'bullet'; content: string}[] = [];
      
      // Generate content based on slide type
      switch (outlineInput.slideType) {
        case 'title':
          const textContent = await this.generateTextContent(slideOutline);
          contentBlocks.push({
            type: 'text',
            content: textContent.text
          });
          break;
          
        case 'content':
          // For regular content slides, convert key points to bullet list
          if (outlineInput.keyContent && outlineInput.keyContent.length > 0) {
            const bulletContent = await this.generateBulletListContent(slideOutline);
            
            // Add enhanced bullet points with better wording
            contentBlocks.push({
              type: 'bullet',
              content: bulletContent.items.join('\n')
            });
          } else if (outlineInput.purpose) {
            // If no key points but there's a purpose, use that as text
            contentBlocks.push({
              type: 'text',
              content: outlineInput.purpose
            });
          }
          
          // Add key takeaway as a separate text block if available
          if (outlineInput.keyTakeaway) {
            contentBlocks.push({
              type: 'text',
              content: `Key Takeaway: ${outlineInput.keyTakeaway}`
            });
          }
          break;
          
        case 'chart':
          // For chart slides, describe what the chart would show
          contentBlocks.push({
            type: 'text',
            content: this.generateChartDescription(slideOutline)
          });
          
          // Add data points as bullets
          const chartDataPoints = this.generateChartDataPoints(slideOutline);
          contentBlocks.push({
            type: 'bullet',
            content: chartDataPoints.join('\n')
          });
          break;
          
        case 'closing':
          // Create a compelling closing with action items
          const closingText = this.generateClosingText(slideOutline);
          contentBlocks.push({
            type: 'text',
            content: closingText
          });
          
          // Add next steps or call to action as bullets
          const actionItems = this.generateActionItems(slideOutline);
          contentBlocks.push({
            type: 'bullet',
            content: actionItems.join('\n')
          });
          break;
          
        default:
          // Default handling for any other slide type
          if (outlineInput.keyContent && outlineInput.keyContent.length > 0) {
            contentBlocks.push({
              type: 'bullet',
              content: outlineInput.keyContent.join('\n')
            });
          } else if (outlineInput.purpose) {
            contentBlocks.push({
              type: 'text',
              content: outlineInput.purpose
            });
          }
          
          if (outlineInput.keyTakeaway) {
            contentBlocks.push({
              type: 'text',
              content: outlineInput.keyTakeaway
            });
          }
      }
      
      return {
        title: headingContent.text,
        contentBlocks: contentBlocks
      };
    } catch (error) {
      console.error('Error transforming outline to content:', error);
      
      // Return a basic content structure if generation fails
      return {
        title: outlineInput.slideTitle,
        contentBlocks: [
          {
            type: 'text',
            content: outlineInput.purpose || 'Slide content generation failed. Please edit manually.'
          }
        ]
      };
    }
  }
  
  /**
   * Generate a description of what the chart would visualize
   */
  private generateChartDescription(slideOutline: SlideOutlineData): string {
    if (slideOutline.purpose) {
      return slideOutline.purpose;
    }
    
    const chartType = this.determineChartType(slideOutline);
    const visualText = slideOutline.visualRecommendation || '';
    
    let description = '';
    
    // Create a description based on chart type
    switch (chartType) {
      case 'bar':
        description = `This bar chart visualizes the key metrics for ${slideOutline.title.toLowerCase()}.`;
        break;
      case 'pie':
        description = `This pie chart shows the distribution of ${slideOutline.title.toLowerCase()}.`;
        break;
      case 'line':
        description = `This line chart tracks the trend of ${slideOutline.title.toLowerCase()} over time.`;
        break;
      default:
        description = `This chart illustrates ${slideOutline.title.toLowerCase()}.`;
    }
    
    // Add visual recommendation if available
    if (visualText) {
      description += ` ${visualText}`;
    }
    
    return description;
  }
  
  /**
   * Generate data points for chart visuals
   */
  private generateChartDataPoints(slideOutline: SlideOutlineData): string[] {
    if (slideOutline.keyContent && slideOutline.keyContent.length > 0) {
      // Use existing key content points
      return slideOutline.keyContent.map(point => 
        point.startsWith('-') ? point : `- ${point}`
      );
    }
    
    // Generate generic data points based on slide title
    const title = slideOutline.title.toLowerCase();
    
    if (title.includes('market') || title.includes('growth')) {
      return [
        '- Market segment A shows 45% growth year-over-year',
        '- Market segment B remains stable at 30% market share',
        '- Emerging segment C represents the highest growth potential at 60%'
      ];
    } else if (title.includes('comparison') || title.includes('competitor')) {
      return [
        '- Our solution outperforms competitors in key metrics',
        '- 40% higher efficiency rating compared to industry average',
        '- Customer satisfaction scores exceed nearest competitor by 25%'
      ];
    } else {
      return [
        '- Key data point 1 shows significant patterns',
        '- Data point 2 demonstrates our competitive advantage',
        '- Trend 3 validates our strategic approach'
      ];
    }
  }
  
  /**
   * Generate compelling closing text
   */
  private generateClosingText(slideOutline: SlideOutlineData): string {
    if (slideOutline.keyTakeaway) {
      return slideOutline.keyTakeaway;
    }
    
    if (slideOutline.purpose) {
      return `${slideOutline.purpose}\n\nWe're ready to take the next steps with you.`;
    }
    
    // Generic closing text based on slide title
    const title = slideOutline.title.toLowerCase();
    
    if (title.includes('next steps') || title.includes('action')) {
      return 'Our clear path forward will ensure successful implementation and measurable results.';
    } else if (title.includes('conclusion') || title.includes('summary')) {
      return 'In summary, our comprehensive solution addresses your key challenges while delivering exceptional value.';
    } else {
      return 'Thank you for your attention. We look forward to discussing how we can move forward together.';
    }
  }
  
  /**
   * Generate action items for closing slides
   */
  private generateActionItems(slideOutline: SlideOutlineData): string[] {
    if (slideOutline.keyContent && slideOutline.keyContent.length > 0) {
      // Use existing key content points
      return slideOutline.keyContent.map(point => 
        point.startsWith('-') ? point : `- ${point}`
      );
    }
    
    // Generic action items
    return [
      '- Schedule follow-up meeting to discuss implementation details',
      '- Identify key stakeholders and establish communication channels',
      '- Develop detailed timeline with measurable milestones'
    ];
  }
}

export const slideContentAIGenerator = new SlideContentAIGenerator(); 