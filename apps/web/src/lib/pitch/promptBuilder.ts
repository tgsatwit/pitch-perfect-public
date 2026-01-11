import type { PitchContextInput } from '@/types/pitch';
import { getSentimentLabel } from './sentimentUtils';

// Function to format the context object into the initial prompt string
export const createInitialPromptString = (context: PitchContextInput & { 
  enhancedData?: { 
    clientDetails?: any, 
    competitorDetails?: Record<string, any>, 
    fileUrls?: string[] 
  } 
}): string => {
  // Extract competitor names from the selected map
  const competitorNames = Object.entries(context.competitorsSelected)
      .filter(([_, isSelected]) => isSelected)
      .map(([key]) => {
        // For manually added competitors (not in database)
        if (key.startsWith('manual-')) return key.substring(7);
        
        // For competitors from the database, use their full info if available
        const competitorDetail = context.enhancedData?.competitorDetails?.[key];
        if (competitorDetail) {
          return `${competitorDetail.name || key} (${competitorDetail.industry || 'Unknown industry'})`;
        }
        return key;
      })
      .join(', ') || 'None specified';

  const dataSources = Object.entries(context.dataSourcesSelected)
      .filter(([_, isSelected]) => isSelected)
      .map(([key]) => {
        // Make data source names more readable
        switch(key) {
          case 'external-client-data': return 'External Client Data';
          case 'internal-client-data': return 'Internal Client Data';
          case 'competitor-data': return 'Competitor Data';
          case 'market-analysis': return 'Market Analysis';
          default: return key;
        }
      })
      .join(', ') || 'None specified';

  // Make sub-data source names more readable
  const subDataSources = context.subDataSourcesSelected.map(key => {
        switch(key) {
          case 'ds-ext-news': return 'News Articles';
          case 'ds-ext-filings': return 'Financial Filings';
          case 'ds-ext-website': return 'Website Content';
          case 'ds-int-rm-notes': return 'Relationship Manager Notes';
          case 'ds-int-past-deals': return 'Past Deals';
          case 'ds-int-risk': return 'Risk Assessment';
          case 'ds-comp-profiles': return 'Competitor Profiles';
          case 'ds-comp-analysis': return 'Competitive Analysis';
          case 'ds-market-reports': return 'Market Reports';
          case 'ds-market-trends': return 'Industry Trends';
          default: return key;
        }
      }).join(', ') || 'None specified';
      
  // Build file information with URLs
  const files = context.uploadedFileNames.map((name, index) => {
    const url = context.enhancedData?.fileUrls?.[index] || '';
    return `${name}${url ? ` (${url})` : ''}`;
  }).join(', ') || 'None specified';
  
  // Extract detailed client information
  const clientDetails = context.enhancedData?.clientDetails || {};
  const clientIndustry = clientDetails.industry || 'Not specified';
  const clientSize = clientDetails.size || 'Not specified';
  const clientRevenue = clientDetails.annualRevenue || 'Not specified';
  
  // Get the pitch stage name
  const pitchStageName = (() => {
    switch(context.pitchStage) {
      case 'stage1': return 'Initial Engagement / Prospecting';
      case 'stage2': return 'Needs Assessment / Exploration';
      case 'stage3': return 'RFP Response';
      case 'stage4': return 'Proposal / Pitch Presentation';
      case 'stage5': return 'Evaluation / Negotiation';
      default: return context.pitchStage;
    }
  })();

  // Construct the prompt string
  return `# System Instructions for Pitch Deck Outline Generation

You are a specialized agent for creating institutional pitch deck outlines. Your task is to generate a structured, client-focused outline that follows banking industry best practices.

## Output Format Requirements

For each slide in the outline, you MUST include the following structure:

\`\`\`
## Slide [Number]: [Title]

**Purpose:** [Brief description of the slide's purpose in the overall narrative]

**Key Content:**
- [Bullet points of main content elements to include]
- [...]

**Supporting Evidence/Data:**
- [Specific data points, benchmarks, or case studies to include]
- [If unavailable, provide clear recommendations for what data to gather]

**Key Takeaway:** [Single sentence that captures the critical message for the audience]

**Strategic Framing:** [How to position this content considering our advantages vs. competitor strengths]

**Visual Recommendation:** [Suggestion for diagram, chart, or visual element]
\`\`\`

## Mandatory Slide Structure

Your outline MUST include these essential slides in this sequence:

1. **Cover & Introduction** - First impression and team introduction
2. **Executive Summary** - Value proposition and key benefits
3. **Client Background & Understanding** - Demonstrate deep client knowledge
4. **Market Context** - Industry trends relevant to the client
5. **Client Needs & Challenges** - Articulate pain points and opportunities
6. **Proposed Solution Overview** - High-level solution architecture
7. **Solution Details** (Multiple slides as needed) - Specific products/services
8. **Bank's Credentials & Experience** - Relevant expertise and case studies
9. **Relationship Team & Service Model** - Who will support the client
10. **Implementation Approach** - How we'll execute seamlessly
11. **Commercial Terms** - Value-based pricing framework
12. **Differentiation & Competitive Advantages** - Why choose us
13. **Risk Management & Compliance** - How we ensure security and continuity
14. **Next Steps** - Clear implementation timeline and actions

## Key Principles to Apply

1. **Client-Centricity:** Every slide must connect directly to the client's needs, goals, or challenges. Use the client's terminology where possible.

2. **Evidence-Based Approach:** Include specific data points, metrics, and case studies wherever possible. Suggest data that should be gathered if not available.

3. **Differentiation Focus:** Highlight unique strengths that competitors cannot easily match. Address competitor strengths proactively.

4. **Visual Thinking:** Recommend specific visual elements (diagrams, charts, etc.) that would enhance understanding of complex concepts.

5. **Strategic Narrative:** Ensure the overall flow tells a cohesive story from client need to proposed solution to successful implementation.

6. **Quantifiable Value:** Where possible, express benefits in quantifiable terms (e.g., "Reduces processing time by 40%").

7. **Relationship Emphasis:** Highlight long-term partnership approach rather than transactional relationship.

# Client Context Information

Use the following client information to customize the pitch outline:

**Client Name:** ${context.clientName}
**Industry:** ${clientIndustry}
**Size/Scope:** ${clientSize}
**Revenue:** ${clientRevenue}
**Pitch Stage:** ${pitchStageName}
**Client Sentiment:** ${getSentimentLabel(context.clientSentiment)} (${context.clientSentiment}/100)
**Pitch Focus/Goals:** ${context.pitchFocus || 'Not specified'}

**Key Client Information:**
${context.importantClientInfo || 'Not specified'}

**Client Needs/Goals:**
${context.importantToClient || 'Not specified'}

**Our Competitive Advantages:**
${context.ourAdvantages || 'Not specified'}

**Competitor Strengths to Address:**
${context.competitorStrengths || 'Not specified'}

**Known Competitors:**
${competitorNames}

**Selected Data Source Categories:**
${dataSources}

**Selected Specific Data Sources:**
${subDataSources}

**Uploaded Files/Resources:**
${files}

**Relevant Case Studies/Success Stories:**
${context.relevantCaseStudies || 'Not specified'}

**Key Metrics/Benchmarks:**
${context.keyMetrics || 'Not specified'}

**Implementation Timeline Requirements:**
${context.implementationTimeline || 'Not specified'}

**Expected ROI/Financial Expectations:**
${context.expectedROI || 'Not specified'}

Remember, you are creating an OUTLINE only - not the full content of each slide. Be specific with what should go on each slide, but concise. Focus on structure and key messages tailored to this client's specific situation and needs.`;
};