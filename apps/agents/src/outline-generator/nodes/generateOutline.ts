import { PitchOutlineAnnotation, type PitchOutlineReturnType } from "../state";
import { LangGraphRunnableConfig } from "@langchain/langgraph";
import { getModelFromConfig } from "../../utils";
import { SettingsService } from "../../services/settingsService";

/**
 * Helper function to get the sentiment label based on score
 */
const getSentimentLabel = (value?: number): string => {
  if (!value) return "Unknown";
  if (value <= 20) return "Cynic";
  if (value <= 40) return "Skeptic";
  if (value <= 60) return "Neutral";
  if (value <= 80) return "Optimist";
  return "Advocate";
};

/**
 * Function to format the generated outline for better rendering
 */
const formatGeneratedOutline = (outline: string): string => {
  // Replace double spaces at the beginning of lines with proper indentation
  let formatted = outline.replace(/^\s\s/gm, '  ');
  
  // Ensure slide headers have proper spacing (## Slide n:)
  formatted = formatted.replace(/##\s+Slide/g, '\n## Slide');
  
  // Add extra newline before headings for markdown rendering
  formatted = formatted.replace(/\n(#{1,6}\s)/g, '\n\n$1');
  
  // Add blank line before each main section label
  const sectionLabels = [
    'Key Takeaway',
    'Key Points',
    'Value Framing',
    'Supporting Evidence',
    'Visual Recommendation',
    'Relationship Building Opportunity',
  ];
  sectionLabels.forEach(label => {
    const regex = new RegExp(`\\*\\*${label}:\\*\\*`, 'g');
    formatted = formatted.replace(regex, `\n\n**${label}:**`);
  });
  
  // Convert inline " - " within Key Points section to newline bullets
  formatted = formatted.replace(/\*\*Key Points:\*\*[\s\S]*?(?=(\*\*|$))/g, (match) => {
    return match.replace(/\s-\s/g, '\n- ');
  });
  
  // Ensure every dash list item starts at new line
  formatted = formatted.replace(/([^\n])\s-\s/g, '$1\n- ');
  
  // Collapse excessive blank lines
  formatted = formatted.replace(/\n{3,}/g, '\n\n');
  
  return formatted;
};

/**
 * Node for generating the pitch deck outline
 */
export async function generateOutlineNode(
  state: typeof PitchOutlineAnnotation.State,
  config?: LangGraphRunnableConfig
): Promise<PitchOutlineReturnType> {
  console.log("[generateOutlineNode] Starting pitch outline generation");
  
  try {
    // If we have an error from a previous node, return it
    if (state.error) {
      return {};
    }
    
    // Get client industry, size, and revenue from enhanced data
    const clientIndustry = state.enhancedClientData?.processedData?.industry || "Unknown Industry";
    const clientSize = state.enhancedClientData?.processedData?.size || "Unknown Size";
    const clientRevenue = state.enhancedClientData?.processedData?.revenue || "Unknown Revenue";
    
    // Get competitor names
    const competitorNames = Object.values(state.enhancedCompetitorData || {})
      .map((competitor: any) => competitor.name || "Unnamed Competitor")
      .join(", ");
    
    // Get pitch stage information from configurable settings
    const pitchStage = await SettingsService.getPitchStageByLegacyKey(state.input.pitchStage);
    const pitchStageName = pitchStage?.name || state.input.pitchStage;
    
    // Get data sources
    const dataSources = state.dataSourceContent || "No specific data sources selected";
    
    // Get uploaded files
    const files = state.input.uploadedFileNames && state.input.uploadedFileNames.length > 0 
      ? state.input.uploadedFileNames.join(", ")
      : "No files uploaded";
    
    // Get slide structure - prioritize custom structure from the pitch
    let slideStructures;
    if (state.input.customSlideStructure && state.input.customSlideStructure.length > 0) {
      console.log("[generateOutlineNode] Using custom slide structure from pitch");
      slideStructures = state.input.customSlideStructure;
    } else {
      // Fallback to configurable settings for this pitch stage
      console.log("[generateOutlineNode] Using default slide structure for pitch stage");
      const settings = await SettingsService.getSettingsForPitchStage(pitchStage?.id || 'fallback');
      slideStructures = settings.slideStructures;
    }
    
    // Build slide structure text
    const slideStructureText = slideStructures
      .map((slide: any, index: number) => `${index + 1}. **${slide.title}** - ${slide.description}`)
      .join('\n');
    
    // Get key principles from configurable settings (always use default for now)
    const settings = await SettingsService.getSettingsForPitchStage(pitchStage?.id || 'fallback');
    const keyPrinciplesText = settings.keyPrinciples
      .map((principle: any, index: number) => `${index + 1}. **${principle.title}:** ${principle.description}`)
      .join('\n\n');

    // Create system prompt
    const systemPrompt = `# System Instructions for Pitch Deck Outline Generation

You are a specialized agent for creating institutional pitch deck outlines for banking/financial services pitches. Your task is to create a comprehensive, strategic pitch outline that follows banking industry best practices and demonstrates deep understanding of both the client's needs and competitive landscape.

Use British English spelling and writing style consistently in all text you produce.

## Output Format Requirements
Generate a markdown-formatted pitch deck outline with clear slide titles, content guidance, and visual recommendations. For EACH slide, you MUST include:

\`\`\`
## Slide [Number]: [Title]

**Key Takeaway:** [One sentence that captures what the audience should remember from this slide]

**Key Points:**
- [Bullet point 1]
- [Bullet point 2]
- [Bullet point 3]

**Value Framing:** [How this specifically positions us stronger than competitors]

**Supporting Evidence:** [Data points, case studies, or proof points that validate claims]

**Visual Recommendation:** [Suggestion for diagram, chart, or visual element]

**Relationship Building Opportunity:** [How this slide can strengthen trust or demonstrate understanding]
\`\`\`

## Mandatory Slide Structure
Your outline must include these essential slides (you may adjust titles to be more specific/compelling):

${slideStructureText}

## Key Principles to Apply
Based on institutional banking pitch best practices:

${keyPrinciplesText}

# Client Context Information

**Client Name:** ${state.input.clientName ?? 'Unknown Client'}
**Industry:** ${clientIndustry}
**Size/Scope:** ${clientSize}
**Revenue:** ${clientRevenue}
**Pitch Stage:** ${pitchStageName}
**Client Sentiment:** ${getSentimentLabel(state.input.clientSentiment)} (${state.input.clientSentiment ?? 'N/A'}/100)
**Pitch Focus/Goals:** ${state.input.pitchFocus || 'Not specified'}

**Key Client Information:**
${state.input.importantClientInfo || 'Not specified'}

**Client Needs/Goals:**
${state.input.importantToClient || 'Not specified'}

**Our Competitive Advantages:**
${state.input.ourAdvantages || 'Not specified'}

**Competitor Strengths to Address:**
${state.input.competitorStrengths || 'Not specified'}

**Known Competitors:**
${competitorNames}

**Selected Data Source Categories:**
${dataSources}

**Uploaded Files/Resources:**
${files}

**Relevant Case Studies/Success Stories:**
${state.input.relevantCaseStudies || 'Not specified'}

**Key Metrics/Benchmarks:**
${state.input.keyMetrics || 'Not specified'}

**Implementation Timeline Requirements:**
${state.input.implementationTimeline || 'Not specified'}

**Expected ROI/Financial Expectations:**
${state.input.expectedROI || 'Not specified'}

# Strategic Pitch Considerations

1. **Pre-RFP Relationship:** If this is early engagement, focus on thought leadership and insights that demonstrate expertise without a hard sell. Position as a trusted advisor who understands the client's industry.

2. **Beauty Parade Differentiation:** If competing in a formal pitch process, create clear, memorable differentiators for each major section that will stand out when multiple banks present in sequence.

3. **Closing Approach:** Include slides that address potential objections and emphasize total value beyond price. Be clear about next steps and implementation approach.

4. **Senior Executive Involvement:** Highlight where senior leadership will be engaged in the relationship to demonstrate the client's importance to your organization.

5. **Post-Pitch Follow-Up:** Suggest content for materials that can be left behind or follow-up information that would add value beyond the pitch itself.

Remember, you are creating an OUTLINE only that will guide the creation of a high-impact, relationship-focused institutional pitch. Each slide must follow the complete structure specified above, including key takeaway, key points, value framing, supporting evidence, and relationship building opportunity.`;
    
    // Merge the incoming LangGraph config (if any) with a fallback that guarantees a model name.
    // `getModelFromConfig` requires `configurable.customModelName` to be present, otherwise it throws
    // "Model name is missing in config." errors. We therefore ensure a default value ("o3-mini")
    // is always provided while still respecting any model name explicitly set by the caller.

    const modelConfig: LangGraphRunnableConfig = {
      ...(config ?? {}),
      configurable: {
        ...((config as LangGraphRunnableConfig | undefined)?.configurable ?? {}),
        customModelName:
          (config as LangGraphRunnableConfig | undefined)?.configurable?.customModelName ??
          "o3-mini",
      },
    };
    const model = await getModelFromConfig(modelConfig, {
      temperature: 0.5,
      maxTokens: 16000
    });
    
    // Generate the outline
    console.log("[generateOutlineNode] Invoking model to generate outline");
    const response = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: "Please generate a comprehensive pitch deck outline based on the provided information." }
    ]);
    
    // Extract the outline text
    const outlineText = response.content.toString();
    
    console.log("[generateOutlineNode] Outline generated successfully");
    
    // Generate a brief summary
    const summaryPrompt = `You've just created the following pitch deck outline:

${outlineText}

Please provide a brief 2-3 sentence summary of this outline, focusing on its key strengths and how it addresses the client's needs.`;
    
    console.log("[generateOutlineNode] Generating outline summary");
    const summaryResponse = await model.invoke([
      { role: "user", content: summaryPrompt }
    ]);
    
    const outlineSummary = summaryResponse.content.toString();
    console.log("[generateOutlineNode] Summary generated successfully");
    
    // Format the generated outline
    const formattedOutline = formatGeneratedOutline(outlineText);
    
    return {
      outlineText: formattedOutline,
      outlineSummary
    };
  } catch (error) {
    console.error("[generateOutlineNode] Error:", error);
    return {
      error: `Outline generation error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 