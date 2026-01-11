# Firebase Schema for Slide Persistence

This document outlines the Firebase schema used for storing and retrieving slide data in the pitch deck builder.

## Pitch Document Structure

Pitch documents are stored in the `pitches` collection with the following structure:

```typescript
interface PitchDocumentData { 
  clientId: string;
  clientName: string;
  pitchStage: string;
  competitorsSelected: Record<string, boolean>; 
  status: string;
  createdAt: Timestamp;
  lastUpdatedAt?: Timestamp;
  dataSourcesSelected: Record<string, boolean>; 
  subDataSourcesSelected?: string[];
  uploadedFiles: { name: string; url: string }[];
  additionalContext: {
    importantClientInfo?: string;
    importantToClient?: string;
    clientSentiment?: number;
    ourAdvantages?: string;
    competitorStrengths?: string;
    pitchFocus?: string;
    relevantCaseStudies?: string;
    keyMetrics?: string;
    implementationTimeline?: string;
    expectedROI?: string;
    ignoredSections?: string[];
  };
  langGraphThreadId: string | null;
  researchData?: {
    clientDetails?: any;
    competitorDetails?: Record<string, any>;
  };
  useResearchData?: {
    clientResearch?: boolean;
    competitorResearch?: boolean;
  };
  initialOutline?: string;
  outlineSummary?: string;
  slides?: SlideData[];
}
```

## Slide Data Structure

Slides are stored as an array within each pitch document, with the following structure:

```typescript
interface SlideData {
  id: string;
  type: 'title' | 'content' | 'chart' | 'table' | 'closing';
  content: {
    title?: string;
    subtitle?: string;
    sections: ContentSection[];
    clientName?: string;
    bankName?: string;
    [key: string]: any;
  };
  notes?: string;
}
```

## ContentSection Structure

Each slide contains an array of content sections that represent individual elements on the slide:

```typescript
interface ContentSection {
  id: string;
  type: 'text' | 'bullet-list' | 'table' | 'chart' | 'image' | 'heading' | 'columns';
  content: any;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  style?: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: string;
    color?: string;
    [key: string]: any;
  };
}
```

## Default Positioning

Default positioning for slide elements follows these guidelines:

1. **Title Slide:**
   - Main heading: Centered at top (x: 250, y: 100)
   - Subtitle: Below heading (x: 250, y: 200)
   - Logo: Top right (x: 480, y: 120)

2. **Content Slide:**
   - Heading: Top centered (x: 250, y: 80)
   - Bullet points: Center area (x: 150, y: 180)
   - Text blocks: Below heading (x: 250, y: 160)

3. **Chart Slide:**
   - Heading: Top centered (x: 250, y: 80)
   - Chart: Center area (x: 250, y: 180)
   - Description: Below chart (x: 250, y: 450)

4. **Table Slide:**
   - Heading: Top centered (x: 250, y: 80)
   - Table: Center area (x: 250, y: 200)

5. **Closing Slide:**
   - Heading: Center top (x: 250, y: 100)
   - Text: Center (x: 250, y: 200)
   - Call to action: Bottom center (x: 250, y: 400)

## Banking-Specific Template Structure

Banking templates extend the base slide structure with industry-specific content and styling:

```typescript
interface BankingTemplateSlide extends SlideData {
  templateId: string;
  templateCategory: 'financial' | 'service' | 'executive' | 'comparison';
  brandingOptions?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  financialData?: {
    dataSource?: string;
    timeframe?: string;
    analysisType?: string;
  };
}
```

## Working with the Schema

### Reading Slide Data

```typescript
const pitchDocRef = doc(db, "pitches", pitchId);
const pitchDocSnap = await getDoc(pitchDocRef);
if (pitchDocSnap.exists()) {
  const pitchData = pitchDocSnap.data() as PitchDocumentData;
  const slides = pitchData.slides || [];
  // Process slides...
}
```

### Writing Slide Data

```typescript
const updatedSlides = [...currentSlides];
// Make modifications to slides
await updateDoc(pitchDocRef, {
  slides: updatedSlides,
  lastUpdatedAt: serverTimestamp()
});
```

### Element Position Updates

When updating element positions:

```typescript
const updatedSections = slide.content.sections.map(section => {
  if (section.id === sectionId) {
    return {
      ...section,
      position: { x: newX, y: newY },
      size: { width: newWidth, height: newHeight }
    };
  }
  return section;
});

// Update the slide with new sections
const updatedSlide = {
  ...slide,
  content: {
    ...slide.content,
    sections: updatedSections
  }
};
``` 