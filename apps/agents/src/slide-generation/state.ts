import { Annotation } from "@langchain/langgraph";
import { 
  SlideGenerationInput, 
  SlideGenerationResult, 
  GeneratedSlideContent,
  SlideOutlineData,
  PitchContextData 
} from "./types";

export const SlideGenerationAnnotation = Annotation.Root({
  /**
   * The input parameters for slide generation
   */
  input: Annotation<SlideGenerationInput>,
  
  /**
   * The final output result of slide generation
   */
  output: Annotation<SlideGenerationResult | undefined>,
  
  /**
   * Any errors that occurred during generation
   */
  error: Annotation<string | undefined>,
  
  /**
   * Individual slide generation results (collected in parallel)
   */
  generatedSlides: Annotation<GeneratedSlideContent[]>({
    reducer: (left: GeneratedSlideContent[], right: GeneratedSlideContent | GeneratedSlideContent[]) => {
      if (Array.isArray(right)) {
        return right;
      }
      return [...left, right];
    },
    default: () => []
  }),
  
  /**
   * Progress tracking for individual slides
   */
  slideProgress: Annotation<Record<string, 'pending' | 'processing' | 'completed' | 'failed'>>({
    reducer: (left: Record<string, 'pending' | 'processing' | 'completed' | 'failed'>, right: Record<string, 'pending' | 'processing' | 'completed' | 'failed'>) => ({
      ...left,
      ...right
    }),
    default: () => ({})
  }),
  
  /**
   * Context data for slide generation
   */
  contextData: Annotation<PitchContextData | undefined>,
  
  /**
   * Slide outlines to be processed
   */
  slideOutlines: Annotation<SlideOutlineData[] | undefined>,
  
  /**
   * Processing metadata
   */
  processingMetadata: Annotation<{
    startTime?: number;
    endTime?: number;
    totalSlides?: number;
    completedSlides?: number;
    failedSlides?: number;
  }>({
    reducer: (left: any, right: any) => ({ ...left, ...right }),
    default: () => ({})
  }),
  
  /**
   * Review results from the reviewer node
   */
  reviewResults: Annotation<{
    issues?: Array<{
      type: 'repetitive_content' | 'narrative_gap' | 'quality_issue';
      severity: 'HIGH' | 'MEDIUM' | 'LOW';
      affectedSlides: number[];
      description: string;
      recommendation: string;
    }>;
    overallScore?: number;
    summary?: string;
  } | undefined>,
  
  /**
   * Whether the slides need revision based on review
   */
  needsRevision: Annotation<boolean>,
  
  /**
   * Enhanced titles generated for slides
   */
  enhancedTitles: Annotation<Record<number, string>>({
    reducer: (left: Record<number, string>, right: Record<number, string>) => ({
      ...left,
      ...right
    }),
    default: () => ({})
  }),
});

export type SlideGenerationReturnType = Partial<
  typeof SlideGenerationAnnotation.State
>; 