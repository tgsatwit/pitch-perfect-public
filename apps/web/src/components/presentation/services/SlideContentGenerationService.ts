import { SlideOutlineData, ContentSectionType, ContentSection } from '../types';
import { langGraphService } from './LangGraphService';
import { slideContentAIGenerator } from './SlideContentAIGenerator';

// Add new interfaces for outline content generation
export interface OutlineContentInput {
  slideTitle: string;
  slideNumber: number;
  slideType: string;
  purpose?: string;
  keyContent?: string[];
  keyTakeaway?: string;
  strategicFraming?: string;
  visualRecommendation?: string;
}

export interface GeneratedSlideContent {
  title: string;
  subtitle?: string;
  contentBlocks?: {
    type: 'text' | 'bullet';
    content: string;
  }[];
}

export interface ContentGenerationOptions {
  useOutline?: boolean;
  useSupportingEvidence?: boolean;
  useResearch?: boolean;
  additionalContext?: string;
}

export interface SlideGenerationRequest {
  slideType: string;
  slideOutline: SlideOutlineData;
  sectionType?: ContentSectionType;
  sectionId?: string;
  options?: ContentGenerationOptions;
}

class SlideContentGenerationService {
  /**
   * Generate content for a specific section within a slide
   */
  async generateSectionContent(
    request: SlideGenerationRequest
  ): Promise<ContentSection | null> {
    const { slideType, slideOutline, sectionType, sectionId, options } = request;
    
    if (!sectionType) {
      console.error('Section type is required for section content generation');
      return null;
    }
    
    try {
      // Try to use LangGraph for advanced generation if available
      try {
        const generatedContent = await langGraphService.generateContent(
          slideType,
          {
            ...slideOutline,
            sectionType,
            sectionId,
          },
          { options }
        );
        
        if (generatedContent) {
          console.log('Using LangGraph-generated content for section');
          return {
            id: sectionId || this.generateId(sectionType),
            type: sectionType,
            content: generatedContent
          };
        }
      } catch (error) {
        console.warn('LangGraph generation failed, using fallback:', error);
      }
      
      // Use the AI generator for section content
      const sectionContent = await slideContentAIGenerator.generateSectionContent(
        sectionType,
        slideOutline
      );
      
      return {
        id: sectionId || this.generateId(sectionType),
        type: sectionType,
        content: sectionContent
      };
    } catch (error) {
      console.error('Error generating section content:', error);
      return null;
    }
  }
  
  /**
   * Generate content for an entire slide, creating multiple sections as needed
   */
  async generateSlideContent(
    request: SlideGenerationRequest
  ): Promise<ContentSection[]> {
    const { slideType, slideOutline, options } = request;
    
    try {
      // Try to use LangGraph for advanced generation
      try {
        const generatedContent = await langGraphService.generateContent(
          slideType,
          slideOutline,
          { options }
        );
        
        if (generatedContent && generatedContent.sections) {
          console.log('Using LangGraph-generated content for the entire slide');
          return generatedContent.sections;
        }
      } catch (error) {
        console.warn('LangGraph slide generation failed, using fallback:', error);
      }
      
      // Create a slide with multiple sections using our AI generator
      return this.generateStructuredSlideContent(slideType, slideOutline, options);
    } catch (error) {
      console.error('Error generating slide content:', error);
      return this.getDefaultSlideContent(slideType, slideOutline);
    }
  }
  
  /**
   * Generate structured content for a slide with multiple sections
   */
  private async generateStructuredSlideContent(
    slideType: string,
    slideOutline: SlideOutlineData,
    options?: ContentGenerationOptions
  ): Promise<ContentSection[]> {
    const sections: ContentSection[] = [];
    
    // Create a heading section for title
    const headingContent = await slideContentAIGenerator.generateHeadingContent(slideOutline);
    sections.push({
      id: this.generateId('heading'),
      type: 'heading',
      content: headingContent
    });
    
    // Add different sections based on slide type
    switch (slideType) {
      case 'title':
        // For title slides, add a text section for subtitle/intro
        const textContent = await slideContentAIGenerator.generateTextContent(slideOutline);
        sections.push({
          id: this.generateId('text'),
          type: 'text',
          content: textContent
        });
        break;
        
      case 'content':
        // For content slides, add bullet points
        const bulletContent = await slideContentAIGenerator.generateBulletListContent(slideOutline);
        sections.push({
          id: this.generateId('bullet-list'),
          type: 'bullet-list',
          content: bulletContent
        });
        
        // If there's a key takeaway, add it as text
        if (slideOutline.keyTakeaway) {
          sections.push({
            id: this.generateId('text'),
            type: 'text',
            content: {
              text: slideOutline.keyTakeaway
            }
          });
        }
        break;
        
      case 'chart':
        // For chart slides, add a chart and supporting text
        const chartContent = await slideContentAIGenerator.generateChartContent(slideOutline);
        sections.push({
          id: this.generateId('chart'),
          type: 'chart',
          content: chartContent
        });
        
        // Add explanation text if we have it
        if (slideOutline.keyTakeaway) {
          sections.push({
            id: this.generateId('text'),
            type: 'text',
            content: {
              text: slideOutline.keyTakeaway
            }
          });
        } else if (slideOutline.keyContent && slideOutline.keyContent.length > 0) {
          const keyPoints = slideOutline.keyContent.join(' ').substring(0, 200);
          sections.push({
            id: this.generateId('text'),
            type: 'text',
            content: {
              text: keyPoints
            }
          });
        }
        break;
        
      case 'table':
        // For table slides, add a table
        const tableContent = await slideContentAIGenerator.generateTableContent(slideOutline);
        sections.push({
          id: this.generateId('table'),
          type: 'table',
          content: tableContent
        });
        
        // Add explanation if we have it
        if (slideOutline.keyTakeaway) {
          sections.push({
            id: this.generateId('text'),
            type: 'text',
            content: {
              text: slideOutline.keyTakeaway
            }
          });
        }
        break;
        
      case 'closing':
        // For closing slides, add bullet points
        const closingContent = await slideContentAIGenerator.generateBulletListContent(slideOutline);
        sections.push({
          id: this.generateId('bullet-list'),
          type: 'bullet-list',
          content: closingContent
        });
        
        // Add contact/next steps text
        sections.push({
          id: this.generateId('text'),
          type: 'text',
          content: {
            text: slideOutline.keyTakeaway || 'Thank you for your attention. Questions?'
          }
        });
        break;
        
      default:
        // Default for any other slide type - text and bullets
        const defaultContent = await slideContentAIGenerator.generateBulletListContent(slideOutline);
        sections.push({
          id: this.generateId('bullet-list'),
          type: 'bullet-list',
          content: defaultContent
        });
    }
    
    return sections;
  }
  
  /**
   * Get default content for a slide type if generation fails
   */
  private getDefaultSlideContent(
    slideType: string,
    slideOutline: SlideOutlineData
  ): ContentSection[] {
    return [
      {
        id: this.generateId('heading'),
        type: 'heading',
        content: {
          text: slideOutline.title || 'Slide Title',
          level: 2
        }
      },
      {
        id: this.generateId('text'),
        type: 'text',
        content: {
          text: 'Content generation failed. Please edit this slide manually or try again.'
        }
      }
    ];
  }
  
  /**
   * Generate a random ID for a section
   */
  private generateId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
  }
  
  /**
   * Generate slide content from outline data
   * This transforms the outline notes into real slide content with proper formatting
   */
  async generateFromOutline(
    outlineInput: OutlineContentInput
  ): Promise<GeneratedSlideContent | null> {
    try {
      console.log('Generating slide content from outline:', outlineInput);
      
      // First try to use LangGraph for advanced generation if available
      try {
        const generatedContent = await langGraphService.generateContentFromOutline(
          outlineInput
        );
        
        if (generatedContent) {
          console.log('Using LangGraph-generated content from outline');
          return generatedContent;
        }
      } catch (error) {
        console.warn('LangGraph outline generation failed, using fallback:', error);
      }
      
      // Fall back to the AI generator's transformation method
      return await slideContentAIGenerator.transformOutlineToContent(outlineInput);
      
    } catch (error) {
      console.error('Error generating content from outline:', error);
      return {
        title: outlineInput.slideTitle,
        contentBlocks: [
          {
            type: 'text',
            content: 'Content generation failed. Please try again or edit manually.'
          }
        ]
      };
    }
  }
}

export const slideContentGenerationService = new SlideContentGenerationService(); 