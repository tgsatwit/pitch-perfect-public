import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { getBankingPrompt, getSlidePrompt, getElementPrompt } from "./BankingPromptTemplates";
import { SlideType } from "../types";
import { PitchContext } from "@/app/pitches/types";

/**
 * Interface for slide content request options
 */
interface SlideContentRequest {
  slideType: SlideType | string;
  elementType?: 'title' | 'bulletPoints' | 'chartData' | 'tableComparison' | 'keyMetrics';
  audience?: 'executive' | 'technical' | 'boardOfDirectors';
  bankingContext?: 'retailBanking' | 'commercialBanking' | 'wealthManagement' | 'investmentBanking';
  context?: Record<string, any>;
  pitchContext?: PitchContext;
}

/**
 * Response with generated content
 */
interface GeneratedContent {
  content: string;
  metadata?: Record<string, any>;
}

/**
 * Generated chart data
 */
interface ChartDataGeneration {
  title: string;
  data: any[];
  xAxisLabel?: string;
  yAxisLabel?: string;
  insightText?: string;
}

/**
 * Generated table data
 */
interface TableDataGeneration {
  headers: string[];
  rows: string[][];
  title?: string;
  description?: string;
}

/**
 * Service for generating banking-specific content using AI
 */
export class BankingAIService {
  private streamMessage: (params: any) => Promise<any>;
  private threadId: string | null;
  
  /**
   * Initialize the Banking AI Service
   * @param streamMessage Function to send messages to AI
   * @param threadId Current thread ID for conversation context
   */
  constructor(streamMessage: (params: any) => Promise<any>, threadId: string | null) {
    this.streamMessage = streamMessage;
    this.threadId = threadId;
  }
  
  /**
   * Generate content for a slide based on type and context
   * @param options Content generation options
   * @returns Generated content
   */
  async generateSlideContent(options: SlideContentRequest): Promise<GeneratedContent> {
    const { 
      slideType,
      elementType = 'bulletPoints',
      audience = 'executive',
      bankingContext = 'commercialBanking',
      context = {},
      pitchContext
    } = options;
    
    // Enhance context with pitch information if available
    const enhancedContext = {
      ...context,
      ...(pitchContext ? {
        clientName: pitchContext.clientName,
        industry: pitchContext.industry,
        problem: pitchContext.problem,
        solution: pitchContext.solution,
        competitors: pitchContext.competitors?.map(c => c.name).join(', '),
        pitchStage: pitchContext.pitchStage
      } : {})
    };
    
    // Generate appropriate prompt
    const prompt = getBankingPrompt(
      slideType,
      elementType,
      audience,
      bankingContext as any,
      enhancedContext
    );
    
    try {
      // Call AI with the generated prompt
      const messages = [new HumanMessage(prompt)];
      
      const result = await this.streamMessage({
        messages,
        threadId: this.threadId,
      });
      
      // Return the generated content
      return {
        content: result.response,
        metadata: { prompt, slideType, elementType }
      };
    } catch (error) {
      console.error("Error generating content:", error);
      throw new Error("Failed to generate banking content");
    }
  }
  
  /**
   * Generate financial chart data based on chart type and context
   * @param chartType Type of chart (line, bar, pie)
   * @param context Additional context
   * @returns Generated chart data
   */
  async generateChartData(
    chartType: "line" | "bar" | "pie",
    context: Record<string, any>,
    pitchContext?: PitchContext
  ): Promise<ChartDataGeneration> {
    // Create a specialized prompt for financial chart data
    const prompt = getElementPrompt('chartData', {
      chartType,
      dataContext: context.dataContext || 'financial performance',
      ...context
    });
    
    // Additional context for financial data
    const enhancedPrompt = `
${prompt}

Generate a JSON object with the following structure:
{
  "title": "Chart title",
  "xAxisLabel": "X-axis label",
  "yAxisLabel": "Y-axis label",
  "data": [
    {"name": "Label 1", "value": 100},
    {"name": "Label 2", "value": 200}
  ],
  "insightText": "Key insight from this data"
}

For a ${chartType} chart in a banking presentation for ${pitchContext?.clientName || 'a financial client'}.
The data should be realistic and reflect typical trends in the ${pitchContext?.industry || 'banking'} industry.
Ensure all financial values follow proper formatting and use appropriate scales.

The chart should support the following key message: ${context.keyMessage || 'Financial performance improvement'}

Response must be valid JSON only.
`;

    try {
      // Call AI with the chart data prompt
      const messages = [new HumanMessage(enhancedPrompt)];
      
      const result = await this.streamMessage({
        messages,
        threadId: this.threadId,
      });
      
      // Extract JSON from the response
      let jsonData;
      try {
        // Look for JSON pattern in the response
        const jsonMatch = result.response.match(/```json\n([\s\S]*?)\n```/) || 
                          result.response.match(/```\n([\s\S]*?)\n```/) ||
                          result.response.match(/\{[\s\S]*\}/);
        
        const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : result.response;
        jsonData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error("Error parsing chart data JSON:", parseError);
        // Fallback to default data
        jsonData = {
          title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
          data: [
            { name: "Q1", value: 120 },
            { name: "Q2", value: 150 },
            { name: "Q3", value: 180 },
            { name: "Q4", value: 220 }
          ],
          xAxisLabel: "Period",
          yAxisLabel: "Value",
          insightText: "Data represents quarterly performance."
        };
      }
      
      return jsonData;
    } catch (error) {
      console.error("Error generating chart data:", error);
      // Return fallback data
      return {
        title: `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
        data: [
          { name: "Q1", value: 120 },
          { name: "Q2", value: 150 },
          { name: "Q3", value: 180 },
          { name: "Q4", value: 220 }
        ],
        xAxisLabel: "Period",
        yAxisLabel: "Value",
        insightText: "Quarterly performance trend."
      };
    }
  }
  
  /**
   * Generate comparison table data
   * @param comparisonSubject What's being compared
   * @param context Additional context
   * @returns Generated table data
   */
  async generateTableData(
    comparisonSubject: string,
    context: Record<string, any>,
    pitchContext?: PitchContext
  ): Promise<TableDataGeneration> {
    // Create specialized prompt for table comparison
    const prompt = getElementPrompt('tableComparison', {
      comparisonSubject,
      ...context
    });
    
    // Additional context for table data
    const enhancedPrompt = `
${prompt}

Generate a JSON object with the following structure for a comparison table:
{
  "title": "Table title",
  "description": "Brief description of what this table shows",
  "headers": ["Feature/Aspect", "Our Solution", "Competitor 1", "Competitor 2"],
  "rows": [
    ["Feature 1", "✓", "✗", "✓"],
    ["Feature 2", "Value 1", "Value 2", "Value 3"]
  ]
}

This table should compare ${comparisonSubject} across different solutions for ${pitchContext?.clientName || 'a financial client'}.
Use checkmarks (✓) and X marks (✗) where appropriate.
Highlight our strengths but be honest about areas where competitors might be stronger.
Focus on aspects most relevant to ${pitchContext?.industry || 'banking'} clients.

Response must be valid JSON only.
`;

    try {
      // Call AI with the table data prompt
      const messages = [new HumanMessage(enhancedPrompt)];
      
      const result = await this.streamMessage({
        messages,
        threadId: this.threadId,
      });
      
      // Extract JSON from the response
      let jsonData;
      try {
        // Look for JSON pattern in the response
        const jsonMatch = result.response.match(/```json\n([\s\S]*?)\n```/) || 
                          result.response.match(/```\n([\s\S]*?)\n```/) ||
                          result.response.match(/\{[\s\S]*\}/);
        
        const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : result.response;
        jsonData = JSON.parse(jsonString);
      } catch (parseError) {
        console.error("Error parsing table data JSON:", parseError);
        // Fallback to default data
        jsonData = {
          title: `${comparisonSubject} Comparison`,
          description: "Comparison of key features and capabilities",
          headers: ["Feature", "Our Solution", "Competition"],
          rows: [
            ["Feature 1", "✓", "✗"],
            ["Feature 2", "✓", "✓"],
            ["Feature 3", "✓", "✗"]
          ]
        };
      }
      
      return jsonData;
    } catch (error) {
      console.error("Error generating table data:", error);
      // Return fallback data
      return {
        title: `${comparisonSubject} Comparison`,
        description: "Comparison of key features and capabilities",
        headers: ["Feature", "Our Solution", "Competition"],
        rows: [
          ["Feature 1", "✓", "✗"],
          ["Feature 2", "✓", "✓"],
          ["Feature 3", "✓", "✗"]
        ]
      };
    }
  }
  
  /**
   * Generate bullet points for a specific slide type
   * @param slideType Type of slide
   * @param context Additional context
   * @returns Generated bullet points as an array
   */
  async generateBulletPoints(
    slideType: SlideType | string,
    context: Record<string, any>,
    pitchContext?: PitchContext
  ): Promise<string[]> {
    const prompt = `
${getSlidePrompt(slideType)}

${getElementPrompt('bulletPoints')}

Generate 4-5 bullet points for a ${slideType} slide in a banking presentation for ${pitchContext?.clientName || 'a financial client'}.
Focus on the ${context.focus || 'key benefits'}.

Return the bullet points as a JSON array of strings, like this:
["Bullet point 1", "Bullet point 2", "Bullet point 3", "Bullet point 4"]

Response must be valid JSON only.
`;

    try {
      // Call AI with the bullet points prompt
      const messages = [new HumanMessage(prompt)];
      
      const result = await this.streamMessage({
        messages,
        threadId: this.threadId,
      });
      
      // Extract JSON from the response
      let bulletPoints;
      try {
        // Look for JSON pattern in the response
        const jsonMatch = result.response.match(/```json\n([\s\S]*?)\n```/) || 
                          result.response.match(/```\n([\s\S]*?)\n```/) ||
                          result.response.match(/\[[\s\S]*\]/);
        
        const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : result.response;
        bulletPoints = JSON.parse(jsonString);
      } catch (parseError) {
        console.error("Error parsing bullet points JSON:", parseError);
        // Extract bullet points manually
        bulletPoints = result.response
          .split('\n')
          .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
          .map(line => line.trim().replace(/^[-*]\s+/, ''));
        
        // If still no bullet points, create default ones
        if (bulletPoints.length === 0) {
          bulletPoints = [
            "Key benefit for your financial institution",
            "Improved operational efficiency and cost reduction",
            "Enhanced compliance and risk management",
            "Strategic advantage over competitors"
          ];
        }
      }
      
      return bulletPoints;
    } catch (error) {
      console.error("Error generating bullet points:", error);
      // Return fallback bullet points
      return [
        "Key benefit for your financial institution",
        "Improved operational efficiency and cost reduction",
        "Enhanced compliance and risk management",
        "Strategic advantage over competitors"
      ];
    }
  }
} 