import { PitchContext, SlideType, SlideContent } from "../../../app/pitches/types";

export interface SlideGenerationContext {
  pitchContext: PitchContext;
  slideIndex: number;
  totalSlides: number;
  previousContent?: string;
  nextContent?: string;
}

export interface AISlideContent {
  id?: string;
  type?: SlideType;
  content?: {
    title?: string;
    subtitle?: string;
    body?: string;
    chartType?: 'line' | 'bar' | 'pie';
    data?: any;
    chartTitle?: string;
    headers?: string[];
    style?: string;
    blocks?: Array<{
      type: 'text' | 'bullet' | 'heading';
      content: string;
      level?: number;
    }>;
  };
  hidden?: boolean;
  notes?: string;
  aiSuggestions?: {
    content?: string | string[];
    visuals?: string | string[];
    talking_points?: string[];
    visualizations?: string[];
    data_integration?: string[];
    [key: string]: any;
  };
}

export class PresentationAIService {
  private async buildPrompt(context: SlideGenerationContext): Promise<string> {
    const { pitchContext, slideIndex, totalSlides, previousContent, nextContent } = context;
    
    let prompt = `Generate content for slide ${slideIndex + 1} of ${totalSlides} for a pitch presentation.\n\n`;
    
    // Add pitch context
    prompt += `Context:\n`;
    prompt += `- Company: ${pitchContext.companyName}\n`;
    prompt += `- Industry: ${pitchContext.industry}\n`;
    prompt += `- Problem: ${pitchContext.problem}\n`;
    prompt += `- Solution: ${pitchContext.solution}\n`;
    prompt += `- Market: ${pitchContext.market}\n`;
    
    // Add slide position context
    if (slideIndex === 0) {
      prompt += `\nThis is the title slide. Create an impactful opening that introduces the pitch.\n`;
    } else if (slideIndex === totalSlides - 1) {
      prompt += `\nThis is the final slide. Create a strong closing with clear next steps.\n`;
    } else {
      const theme = this.getSlideTheme(slideIndex, totalSlides);
      prompt += `\nThis is a content slide. Focus on ${theme}.\n`;
    }
    
    // Add flow context
    if (previousContent) {
      prompt += `\nPrevious slide content:\n${previousContent}\n`;
    }
    if (nextContent) {
      prompt += `\nNext slide content:\n${nextContent}\n`;
    }
    
    return prompt;
  }

  private getSlideTheme(index: number, total: number): string {
    // Calculate relative position (0-1)
    const position = index / (total - 1);
    
    if (position < 0.25) {
      return "introducing the problem and market opportunity";
    } else if (position < 0.5) {
      return "explaining our unique solution and value proposition";
    } else if (position < 0.75) {
      return "demonstrating market validation and traction";
    } else {
      return "outlining the implementation plan and timeline";
    }
  }

  public async generateSlideContent(context: SlideGenerationContext): Promise<AISlideContent> {
    const prompt = await this.buildPrompt(context);
    
    try {
      // Generate content structure based on slide position
      const slideType: SlideType = context.slideIndex === 0 ? 'title' : 
                                 context.slideIndex === context.totalSlides - 1 ? 'closing' : 
                                 'content';
      
      const theme = this.getSlideTheme(context.slideIndex, context.totalSlides);
      
      let content: AISlideContent['content'] = {};
      
      switch (slideType) {
        case 'title':
          content = {
            title: `${context.pitchContext.companyName} - Strategic Partnership Proposal`,
            subtitle: `Transforming ${context.pitchContext.industry} Through Innovation`
          };
          break;
          
        case 'closing':
          content = {
            title: 'Next Steps',
            body: '• Review proposal details\n• Schedule follow-up discussion\n• Identify key stakeholders\n• Finalize agreement'
          };
          break;
          
        default:
          content = {
            title: this.generateSlideTitle(theme),
            body: this.generateSlideBodyContent(theme, context.pitchContext)
          };
      }
      
      return {
        id: `slide-${context.slideIndex}`,
        type: slideType,
        content,
        notes: `Speaker notes for slide ${context.slideIndex + 1}`,
        aiSuggestions: {
          content: this.generateContentSuggestions(theme),
          visuals: this.generateVisualSuggestions(theme),
          talking_points: await this.generateTalkingPoints({ type: slideType, content })
        }
      };
      
    } catch (error) {
      console.error('Error generating slide content:', error);
      throw new Error('Failed to generate slide content');
    }
  }

  private generateSlideTitle(theme: string): string {
    const titles: { [key: string]: string } = {
      "introducing the problem and market opportunity": "Market Opportunity",
      "explaining our unique solution and value proposition": "Our Solution",
      "demonstrating market validation and traction": "Market Validation",
      "outlining the implementation plan and timeline": "Implementation Plan"
    };
    return titles[theme] || "Content";
  }

  private generateSlideBodyContent(theme: string, context: PitchContext): string {
    // Generate appropriate content based on theme and context
    switch (theme) {
      case "introducing the problem and market opportunity":
        return `• ${context.problem}\n• Market size: ${context.market}\n• Current solutions fall short`;
      case "explaining our unique solution and value proposition":
        return `• ${context.solution}\n• Key differentiators\n• Value proposition`;
      case "demonstrating market validation and traction":
        return `• Early adopters\n• Market feedback\n• Growth metrics`;
      case "outlining the implementation plan and timeline":
        return `• Phase 1: Discovery & Planning\n• Phase 2: Implementation\n• Phase 3: Launch & Scale`;
      default:
        return "• Point 1\n• Point 2\n• Point 3";
    }
  }

  private generateContentSuggestions(theme: string): string[] {
    return [
      "Add specific metrics or data points",
      "Include customer testimonials",
      "Show competitive analysis"
    ];
  }

  private generateVisualSuggestions(theme: string): string[] {
    return [
      "Add relevant product screenshots",
      "Include market size chart",
      "Show implementation timeline"
    ];
  }

  public async generateTalkingPoints(content: { type: SlideType; content: AISlideContent['content'] }): Promise<string[]> {
    return [
      "Emphasize key benefits",
      "Share relevant case studies",
      "Address potential concerns"
    ];
  }
}

export const presentationAIService = new PresentationAIService(); 