import type { SlideOutlineData as AgentSlideOutlineData } from '../../../../../agents/src/slide-generation/types';

/**
 * Parse outline text into structured slide outline data for the agent
 */
export const parseOutlineToSlideOutlines = (outline: string): AgentSlideOutlineData[] => {
  if (!outline) {
    console.warn("No outline provided to parse slide outlines from");
    return [];
  }
  
  console.log("Starting to parse outline into slide outlines...");
  
  const slideOutlines: AgentSlideOutlineData[] = [];
  
  // Regex pattern to match slide sections
  const slideRegex = /##\s*Slide\s*(\d+)[:\-–—.]?\s*(.+?)(?=\n|$)([\s\S]*?)(?=\n##\s*Slide\s*\d+[:\-–—.]?\s*|$)/gi;
  
  let match;
  while ((match = slideRegex.exec(outline)) !== null) {
    const slideNumber = parseInt(match[1]);
    const slideTitle = match[2].trim();
    const slideContent = match[3] ? match[3].trim() : '';
    
    console.log(`Processing slide ${slideNumber}: ${slideTitle}`);
    
    // Store the raw content first - this preserves everything
    const rawContent = slideContent;
    
    // Extract structured information using more flexible regex patterns
    // Make patterns more flexible to handle variations
    const purposeRegex = /\*\*Purpose[:\s]*\*\*\s*([\s\S]*?)(?=\*\*[A-Za-z\s]+:|$)/i;
    const keyContentRegex = /\*\*Key (?:Content|Points)[:\s]*\*\*\s*([\s\S]*?)(?=\*\*[A-Za-z\s]+:|$)/i;
    const supportingEvidenceRegex = /\*\*Supporting (?:Evidence|Data)[\/\s]*[:\s]*\*\*\s*([\s\S]*?)(?=\*\*[A-Za-z\s]+:|$)/i;
    const keyTakeawayRegex = /\*\*Key Takeaway[:\s]*\*\*\s*([\s\S]*?)(?=\*\*[A-Za-z\s]+:|$)/i;
    const strategicFramingRegex = /\*\*(?:Strategic Framing|Value Framing)[:\s]*\*\*\s*([\s\S]*?)(?=\*\*[A-Za-z\s]+:|$)/i;
    const visualRecommendationRegex = /\*\*Visual Recommendation[:\s]*\*\*\s*([\s\S]*?)(?=\*\*[A-Za-z\s]+:|$)/i;
    
    // Extract fields with better handling of multiline content
    const purposeMatch = slideContent.match(purposeRegex);
    const purpose = purposeMatch ? purposeMatch[1].trim() : '';
    
    const keyTakeawayMatch = slideContent.match(keyTakeawayRegex);
    const keyTakeaway = keyTakeawayMatch ? keyTakeawayMatch[1].trim() : '';
    
    const strategicFramingMatch = slideContent.match(strategicFramingRegex);
    const strategicFraming = strategicFramingMatch ? strategicFramingMatch[1].trim() : '';
    
    const visualRecommendationMatch = slideContent.match(visualRecommendationRegex);
    const visualRecommendation = visualRecommendationMatch ? visualRecommendationMatch[1].trim() : '';
    
    // Extract key content as array
    const keyContentMatch = slideContent.match(keyContentRegex);
    const keyContentText = keyContentMatch ? keyContentMatch[1] : '';
    const keyContent = keyContentText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 0);
    
    // Extract supporting evidence as array
    const supportingEvidenceMatch = slideContent.match(supportingEvidenceRegex);
    const supportingEvidenceText = supportingEvidenceMatch ? supportingEvidenceMatch[1] : '';
    const supportingEvidence = supportingEvidenceText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.startsWith('•') || line.startsWith('*'))
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(line => line.length > 0);
    
    // Determine slide type
    const slideType = determineSlideType(slideTitle);
    
    // Create a flexible structure that includes both parsed fields and raw content
    const slideOutline: any = {
      id: `slide-${slideNumber}`,
      number: slideNumber,
      title: slideTitle,
      slideType,
      rawContent, // Always include the full raw content
      // Include parsed fields if they exist
      ...(purpose && { purpose }),
      ...(keyContent.length > 0 && { keyContent }),
      ...(supportingEvidence.length > 0 && { supportingEvidence }),
      ...(keyTakeaway && { keyTakeaway }),
      ...(strategicFraming && { strategicFraming }),
      ...(visualRecommendation && { visualRecommendation }),
    };
    
    // Also check for any other sections that might not match our patterns
    // This ensures we don't lose any custom sections
    const customSections: Record<string, string> = {};
    const customSectionRegex = /\*\*([^:*]+)[:\s]*\*\*\s*([\s\S]*?)(?=\*\*[A-Za-z\s]+:|$)/gi;
    let customMatch;
    while ((customMatch = customSectionRegex.exec(slideContent)) !== null) {
      const sectionName = customMatch[1].trim();
      const sectionContent = customMatch[2].trim();
      // Only add if it's not one of our known sections
      if (!['Purpose', 'Key Content', 'Key Points', 'Supporting Evidence', 'Supporting Data', 
           'Key Takeaway', 'Strategic Framing', 'Value Framing', 'Visual Recommendation']
           .some(known => sectionName.toLowerCase().includes(known.toLowerCase()))) {
        customSections[sectionName] = sectionContent;
      }
    }
    
    // Add custom sections if any were found
    if (Object.keys(customSections).length > 0) {
      slideOutline.customSections = customSections;
    }
    
    slideOutlines.push(slideOutline);
  }
  
  // Sort by slide number
  slideOutlines.sort((a, b) => a.number - b.number);
  
  console.log(`Parsed ${slideOutlines.length} slide outlines from the outline`);
  return slideOutlines;
};

/**
 * Determine slide type based on title and content
 */
export const determineSlideType = (title: string): 'title' | 'content' | 'chart' | 'table' | 'closing' => {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('cover') || 
      titleLower.includes('title') || 
      titleLower.includes('introduction') || 
      titleLower.includes('overview')) {
    return 'title';
  } else if (titleLower.includes('conclusion') || 
             titleLower.includes('next steps') || 
             titleLower.includes('thank you')) {
    return 'closing';
  } else if (titleLower.includes('table') || 
             titleLower.includes('comparison')) {
    return 'table';
  } else if (titleLower.includes('chart') || 
             titleLower.includes('graph') || 
             titleLower.includes('data')) {
    return 'chart';
  } else {
    return 'content';
  }
};