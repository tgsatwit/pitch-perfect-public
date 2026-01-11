import { AISlideContent } from './PresentationAIService';
import { PitchContext, Competitor } from '@/app/pitches/types';
import { langGraphService } from './LangGraphService';

// Type definitions for our content generation
export interface ContentGenerationRequest {
  slideType: string;
  outline: {
    title: string;
    purpose?: string;
    keyContent?: string[];
    supportingEvidence?: string[];
    keyTakeaway?: string;
    strategicFraming?: string;
    visualRecommendation?: string;
  };
  clientContext: PitchContext;
  dataSources?: string[];
}

export interface ContentGenerationResponse {
  title: string;
  subtitle?: string;
  body?: string;
  chartType?: 'bar' | 'line' | 'pie';
  data?: {
    labels: string[];
    values: number[];
  };
  headers?: string[];
  tableData?: string[][];
  notes?: string;
}

class PresentationContentService {
  /**
   * Generates content for a slide based on its outline and context
   */
  async generateSlideContent(
    slideType: string,
    outline: any,
    clientContext: PitchContext
  ): Promise<ContentGenerationResponse> {
    console.log(`Generating content for ${slideType} slide: ${outline.title}`);
    
    // Try to use LangGraph service if available
    try {
      // First, attempt to use LangGraph for enhanced content generation
      const langGraphContent = await langGraphService.generateContent(
        slideType,
        outline,
        clientContext
      );
      
      // If successful, return the LangGraph-generated content
      if (langGraphContent && langGraphContent.title) {
        console.log('Successfully generated content using LangGraph');
        return langGraphContent;
      }
    } catch (error) {
      console.error('Error using LangGraph for content generation:', error);
      // Fall back to local generation logic
    }
    
    // Fallback to local content generation
    console.log('Falling back to local content generation');
    
    // For now, we'll generate some placeholder content based on slide type
    switch (slideType) {
      case 'title':
        return {
          title: outline.title || 'Presentation Title',
          subtitle: clientContext.companyName || 'Company Name'
        };
        
      case 'content':
        // Format bullet points from key content
        const bulletPoints = outline.keyContent?.map((item: string) => `• ${item}`) || [];
        
        return {
          title: outline.title || 'Content Slide',
          body: bulletPoints.join('\n'),
          notes: `${outline.purpose || ''}\n\nKey takeaway: ${outline.keyTakeaway || ''}`,
        };
        
      case 'chart':
        // Determine chart type from visual recommendation
        let chartType: 'bar' | 'line' | 'pie' = 'bar';
        const visualRec = outline.visualRecommendation?.toLowerCase() || '';
        
        if (visualRec.includes('pie') || visualRec.includes('distribution')) {
          chartType = 'pie';
        } else if (visualRec.includes('line') || visualRec.includes('trend') || visualRec.includes('over time')) {
          chartType = 'line';
        }
        
        // Generate sample data based on key content
        const labels = outline.keyContent?.slice(0, 5).map((item: string, index: number) => {
          // Try to extract a label from the content item
          const parts = item.split(/[-:]/);
          if (parts.length > 1) {
            return parts[0].trim();
          }
          return `Category ${index + 1}`;
        }) || ['Category A', 'Category B', 'Category C'];
        
        // Generate random values for the chart
        const values = labels.map(() => Math.floor(Math.random() * 80) + 20);
        
        return {
          title: outline.title || 'Chart Title',
          chartType,
          data: {
            labels,
            values
          },
          notes: `${outline.purpose || ''}\n\nKey takeaway: ${outline.keyTakeaway || ''}`,
        };
        
      case 'table':
        // Extract potential headers from key content or supporting evidence
        const allContent = [...(outline.keyContent || []), ...(outline.supportingEvidence || [])];
        
        // Default headers based on slide context
        let headers: string[] = ['Category', 'Details', 'Value'];
        const titleLower = outline.title?.toLowerCase() || '';
        
        if (titleLower.includes('comparison')) {
          headers = ['Criteria', clientContext.companyName || 'Our Company', 'Competition'];
        } else if (titleLower.includes('timeline')) {
          headers = ['Phase', 'Timeline', 'Deliverable'];
        }
        
        // Generate table rows from content
        const tableData: string[][] = [];
        
        if (allContent.length > 0) {
          // Use content items to create rows
          for (let i = 0; i < Math.min(5, allContent.length); i++) {
            const item = allContent[i];
            
            // Try to split the item into columns
            const parts = item.split(/[-:,|]/);
            
            if (parts.length >= headers.length) {
              // We got a good split, use it for the row
              tableData.push(parts.slice(0, headers.length).map((part: string) => part.trim()));
            } else {
              // Create a row with the item in the first column
              const row = [item];
              // Add empty cells for remaining columns
              for (let j = 1; j < headers.length; j++) {
                row.push('');
              }
              tableData.push(row);
            }
          }
        }
        
        // If we don't have enough rows, add placeholders
        while (tableData.length < 3) {
          const row = headers.map((header, index) => `Example ${tableData.length + 1} for ${header}`);
          tableData.push(row);
        }
        
        return {
          title: outline.title || 'Table Title',
          headers,
          tableData,
          notes: `${outline.purpose || ''}\n\nKey takeaway: ${outline.keyTakeaway || ''}`,
        };
        
      case 'closing':
        return {
          title: outline.title || 'Next Steps',
          body: outline.keyContent?.map((item: string) => `• ${item}`).join('\n') || 'Thank you for your attention',
          notes: `${outline.purpose || ''}\n\nKey takeaway: ${outline.keyTakeaway || ''}`,
        };
        
      default:
        return {
          title: outline.title || 'Slide Title',
          body: outline.keyContent?.map((item: string) => `• ${item}`).join('\n') || 'Content goes here',
          notes: outline.purpose || '',
        };
    }
  }

  /**
   * Updates or enhances existing slide content using LangGraph
   */
  async enhanceSlideContent(
    slideContent: ContentGenerationResponse,
    feedback: string,
    clientContext: PitchContext
  ): Promise<ContentGenerationResponse> {
    console.log('Enhancing slide content based on feedback:', feedback);
    
    // Try to use LangGraph service for content enhancement
    try {
      const enhancedContent = await langGraphService.enhanceContent(
        slideContent,
        feedback,
        clientContext
      );
      
      if (enhancedContent) {
        console.log('Successfully enhanced content using LangGraph');
        return enhancedContent;
      }
    } catch (error) {
      console.error('Error using LangGraph for content enhancement:', error);
      // Fall back to basic enhancement
    }
    
    // Simple fallback enhancement
    return {
      ...slideContent,
      notes: `${slideContent.notes || ''}\n\nEnhanced with feedback: ${feedback}`,
    };
  }

  /**
   * Fetches additional data from specified sources to enhance slides
   */
  async fetchDataForSlide(
    slideType: string,
    slideContent: ContentGenerationResponse,
    dataSources: string[],
    clientContext: PitchContext
  ): Promise<ContentGenerationResponse> {
    console.log(`Fetching data for ${slideType} slide from sources:`, dataSources);
    
    // Try to use LangGraph for data retrieval
    try {
      const query = `Data for ${slideType} slide: ${slideContent.title}`;
      const retrievedData = await langGraphService.retrieveData(
        query,
        dataSources,
        clientContext
      );
      
      if (retrievedData && retrievedData.results) {
        console.log('Successfully retrieved data using LangGraph');
        
        // Enhance slide content with the retrieved data
        // Implementation would depend on the data format and slide type
        
        // For demonstration purposes, we'll just add a note
        return {
          ...slideContent,
          notes: `${slideContent.notes || ''}\n\nData summary: ${retrievedData.summary || ''}`
        };
      }
    } catch (error) {
      console.error('Error using LangGraph for data retrieval:', error);
      // Fall back to mock data
    }
    
    // If LangGraph data retrieval failed, use fallback logic
    // If this is a chart slide, we could find real data points
    if (slideType === 'chart' && slideContent.chartType) {
      // We'd use LangGraph to fetch real data based on the chart type and context
      console.log('Enhancing chart data with sample values');
      
      // For now, generate slightly better random data
      const enhancedData = {
        labels: slideContent.data?.labels || [],
        values: slideContent.data?.values?.map(() => Math.floor(Math.random() * 80) + 20) || []
      };
      
      return {
        ...slideContent,
        data: enhancedData
      };
    }
    
    // For tables, we could populate with real data
    if (slideType === 'table' && slideContent.headers) {
      console.log('Enhancing table with sample data');
      
      // We'd use LangGraph to retrieve relevant data for the table
      // For now, just enhance the existing data
      const enhancedTableData = slideContent.tableData?.map(row => 
        row.map(cell => cell || 'Enhanced data')
      ) || [];
      
      return {
        ...slideContent,
        tableData: enhancedTableData
      };
    }
    
    // For content slides, we could enhance the text
    return {
      ...slideContent,
      body: slideContent.body?.replace('Content goes here', 'Enhanced content with real insights from data sources') || ''
    };
  }
}

export const presentationContentService = new PresentationContentService(); 