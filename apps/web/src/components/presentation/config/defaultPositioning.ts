import { SlideType, ContentSectionType } from '../types';

/**
 * Default positions and sizes for slide elements based on slide type and element type
 */
interface PositioningConfig {
  position: { x: number; y: number };
  size: { width: number; height: number };
}

type SlideElementPositioning = Record<SlideType, Record<ContentSectionType, PositioningConfig>>;

/**
 * Default positioning for slide elements based on slide type and element type
 */
export const defaultPositioning: SlideElementPositioning = {
  title: {
    heading: {
      position: { x: 480, y: 180 },
      size: { width: 600, height: 80 }
    },
    text: {
      position: { x: 480, y: 280 },
      size: { width: 500, height: 60 }
    },
    'bullet-list': {
      position: { x: 480, y: 350 },
      size: { width: 500, height: 150 }
    },
    image: {
      position: { x: 820, y: 120 },
      size: { width: 200, height: 100 }
    },
    chart: {
      position: { x: 480, y: 350 },
      size: { width: 600, height: 300 }
    },
    table: {
      position: { x: 480, y: 350 },
      size: { width: 600, height: 250 }
    },
    columns: {
      position: { x: 480, y: 280 },
      size: { width: 600, height: 250 }
    }
  },
  content: {
    heading: {
      position: { x: 480, y: 100 },
      size: { width: 500, height: 60 }
    },
    text: {
      position: { x: 480, y: 200 },
      size: { width: 500, height: 100 }
    },
    'bullet-list': {
      position: { x: 480, y: 200 },
      size: { width: 500, height: 200 }
    },
    image: {
      position: { x: 480, y: 300 },
      size: { width: 300, height: 200 }
    },
    chart: {
      position: { x: 480, y: 200 },
      size: { width: 550, height: 300 }
    },
    table: {
      position: { x: 480, y: 200 },
      size: { width: 550, height: 250 }
    },
    columns: {
      position: { x: 480, y: 200 },
      size: { width: 700, height: 250 }
    }
  },
  chart: {
    heading: {
      position: { x: 480, y: 80 },
      size: { width: 500, height: 60 }
    },
    text: {
      position: { x: 480, y: 450 },
      size: { width: 500, height: 60 }
    },
    'bullet-list': {
      position: { x: 200, y: 450 },
      size: { width: 400, height: 150 }
    },
    image: {
      position: { x: 820, y: 450 },
      size: { width: 200, height: 150 }
    },
    chart: {
      position: { x: 480, y: 250 },
      size: { width: 700, height: 300 }
    },
    table: {
      position: { x: 480, y: 450 },
      size: { width: 500, height: 150 }
    },
    columns: {
      position: { x: 480, y: 450 },
      size: { width: 600, height: 150 }
    }
  },
  table: {
    heading: {
      position: { x: 480, y: 80 },
      size: { width: 500, height: 60 }
    },
    text: {
      position: { x: 480, y: 150 },
      size: { width: 500, height: 60 }
    },
    'bullet-list': {
      position: { x: 480, y: 420 },
      size: { width: 500, height: 150 }
    },
    image: {
      position: { x: 820, y: 420 },
      size: { width: 200, height: 150 }
    },
    chart: {
      position: { x: 480, y: 420 },
      size: { width: 500, height: 150 }
    },
    table: {
      position: { x: 480, y: 250 },
      size: { width: 700, height: 250 }
    },
    columns: {
      position: { x: 480, y: 420 },
      size: { width: 600, height: 150 }
    }
  },
  closing: {
    heading: {
      position: { x: 480, y: 100 },
      size: { width: 500, height: 80 }
    },
    text: {
      position: { x: 480, y: 200 },
      size: { width: 500, height: 100 }
    },
    'bullet-list': {
      position: { x: 480, y: 200 },
      size: { width: 500, height: 200 }
    },
    image: {
      position: { x: 480, y: 320 },
      size: { width: 300, height: 200 }
    },
    chart: {
      position: { x: 480, y: 200 },
      size: { width: 500, height: 200 }
    },
    table: {
      position: { x: 480, y: 200 },
      size: { width: 500, height: 200 }
    },
    columns: {
      position: { x: 480, y: 200 },
      size: { width: 600, height: 250 }
    }
  }
};

/**
 * Get the default positioning for an element based on slide type and element type
 * @param slideType Type of slide
 * @param elementType Type of element
 * @returns Default position and size
 */
export function getDefaultPositioning(
  slideType: SlideType,
  elementType: ContentSectionType
): PositioningConfig {
  // If the exact combination doesn't exist, fall back to content slide defaults
  return (
    defaultPositioning[slideType]?.[elementType] ||
    defaultPositioning.content[elementType] ||
    {
      position: { x: 480, y: 200 },
      size: { width: 500, height: 100 }
    }
  );
}

/**
 * Helper to create a new element with default positioning
 * @param slideType Type of slide the element will be added to
 * @param elementType Type of element to create
 * @param elementId Unique ID for the element
 * @param content Content for the element
 * @returns A new element with appropriate default positioning
 */
export function createPositionedElement(
  slideType: SlideType,
  elementType: ContentSectionType,
  elementId: string,
  content: any
) {
  const { position, size } = getDefaultPositioning(slideType, elementType);
  
  return {
    id: elementId,
    type: elementType,
    content,
    position,
    size
  };
} 